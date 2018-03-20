const program = require("commander");
const Xray = require('x-ray');
const x = new Xray();
const Download = require('download');

program
    .version('0.0.42')
    .option('-l, --list', 'affiche la liste de tous les mangas', getFullMangaList)
    .option('-d, --download <url>', 'download chapters from url exemple(-d http://japscan.com/mangas/one-piece/volume-1/)', downloadChapters)
    .option('-c, --chapter <url>', 'affiche la liste des chapitres d un manga  exemple(-c http://japscan.com/mangas/one-piece/)',  ListChapter)
    .parse(process.argv);

if (program.chapter) ListChapter(program.chapter);

if (program.download) downloadChapters(program.download);

process.on('uncaughtException', (err) => {
    console.log(err);
});

function getFullMangaList() {
    var manga_list_url = 'http://japscan.com/mangas';
    var manga_list = {};

    console.log("Loading manga list ...");

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

    return getAllList.then((results) => {
        for (var i = 0, len = results.length; i < len; i++) {
            if(results[i].url.includes("/mangas/"))
            {
                manga_list[(results[i].title)] = (results[i].url);
                console.log(results[i].title+" => "+results[i].url)
            }
        }

        console.log("Manga list loaded !");

        return manga_list;
    });
}


function ListChapter(url) {

    var Chapter_list = {};
    const getAllList = new Promise((resolve, reject) => {
        x(url, '#liste_chapitres a',
            [{
                title: '@text',
                url: '@href',
                valeur: 'Chapitre'
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
            if(results[i].url.includes("/volume-"))
            {
                results[i].valeur = 'Volume';
                Chapter_list[results[i].valeur +" ; "+(results[i].title)] = (results[i].url);
                console.log(results[i].url);

            }
            else {
                results[i].valeur = 'Chapitre';
                Chapter_list[results[i].valeur +" ; "+(results[i].title)] = (results[i].url);
                console.log(results[i].url);
            }
        }

    });

}

function downloadChapters(url) {
    const getAllPage = new Promise((resolve, reject) => {
        x(url, '#pagination a ',
            [{

                url: '@href',
                valeur: '@text'

            }]
        )((err, results) => {
            if (err) {
                reject(new Error(err));

            } else {
                resolve(results);
            }
        });
    });

    getAllPage.then((results) =>{
        let longueur = results[results.length-3].valeur;
        console.log(longueur);
        for (let i = 1; i <= longueur; i++){

            x(url+i+".html", 'img#image@src')((err, image) =>{
                return new Promise((resolve, reject) =>{
                    if(err){
                        reject(new Error(err));
                    }
                    let filename = i+".png";
                    let download = new Download();
                    download.get(image);
                    download.rename(filename);
                    download.dest('./download/' + url.substr(39, 300));
                    console.log(url.substr(39, 150));
                    resolve(download.run());
                });
            });
        }
    });
}