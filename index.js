const fs = require('fs').promises;

const setup = {
    diretorioRaiz: "arquivos"
}

const readFileAsync = async (path) => fs.readFile(path, 'utf8');

async function getFiles(diretorio, arquivos) {
    if (!arquivos)
        arquivos = [];

    let listaDeArquivos = await fs.readdir(diretorio);

    for (let k in listaDeArquivos) {
        let stat = await fs.stat(diretorio + '/' + listaDeArquivos[k]);
        if (stat.isDirectory())
            await getFiles(diretorio + '/' + listaDeArquivos[k], arquivos);
        else
            arquivos.push(diretorio + '/' + listaDeArquivos[k]);
    }

    return arquivos;
}

async function readContentFromFile(diretorio) {
    try {
        const file = await readFileAsync(diretorio, "utf8");
        return file;
    }
    catch (err) {
        console.error(err)
    }
}

async function searchTerm(content = "", terms = []) {
    const results = [];

    content = content.toUpperCase();

    terms = terms.map((term) => {
        return term.toUpperCase();
    });

    terms.forEach((term) => {
        if (!content.includes(term)) {
            return undefined
        }

        while (content.includes(term)) {
            const index = content.search(term);
            const termSearchable = content.substr(index);
            const spaceIndex = termSearchable.search(" ");

            const contentString = termSearchable.substring(0, spaceIndex);
            results.push(contentString);

            content = content.replace(contentString, "alreadyGet");
        }

    });

    return results;
}

function writeFile(content = [], directory, nameFile) {
    try {
        fs.writeFile(`${directory}/${nameFile}`, content);
    } catch (error) {
        console.log("Houve um erro");
        console.log(error);
    }
}

(async function start() {
    let contentAll = "";
    let arquivos = await getFiles(setup.diretorioRaiz) || []; // coloque o caminho do seu diretorio

    for (let file of arquivos) {
        const content = await readContentFromFile(file);
        contentAll += `\n ${content}`;
    }

    const results = await searchTerm(contentAll, ["serviceCode"]);
    writeFile(JSON.stringify(results), "./", "terms.json");

    return true;
})();