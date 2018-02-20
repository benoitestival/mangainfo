const program = require("commander");
const Xray = require('x-ray');
const x = new Xray();

program
    .version('0.0.42')
    .option('-l, --list', 'output full manga list information (title, url)', getFullMangaList)
    .option('-s, --search <title>', 'output message if manga you looking for exist (e.g.  -s \"One Piece\")', searchingManga)
    .option('-d, --download', 'download all available chapters from given url (e.g. http://mangastream.com/manga/toriko)')
    .parse(process.argv);

if (program.search) searchingManga(program.search);

process.on('uncaughtException', (err) => {
    console.log(err);
});

function getFullMangaList() {
    var manga_list_url = 'http://japscan.com/mangas';
    var manga_list = {};
    const getAllList = new Promise((resolve, reject) => {
        x(manga_list_url, '.table .row a',
            [{
                title: '@text',
                url: '@href'
            }]
        )((err, results) => {
            if(err) {
                reject(new Error(err));
            } else{
                resolve(results);
            }
        });
    });

    getAllList.then((results) => {
        for (var i = 0, len = results.length; i < len; i++) {
            if(results[i].url.includes("/mangas/"))
            {
                manga_list[(results[i].title)] = (results[i].url);
            }
        }
        return manga_list
    });
}

function searchingManga(titleSearch) {
    const getList = new Promise((resolve, reject) => {
        getFullMangaList()((err, result) => {
            if (err) {
                reject(new Error(err));
            } else {
                resolve(result);
            }
        });
    });
    getList.then((results) => {
        for(manga in results)
        {
            if(manga[titleSearch] != null)
                console.log(titleSearch + " exist !");
        }
        console.log(titleSearch + " not found!");
    });
}
