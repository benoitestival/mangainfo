const Xray = require('x-ray');
const x = new Xray();

let manga_list = [];

getFullMangaList();
//displayMangaList();

function getFullMangaList() {
    let manga_list_url = 'http://japscan.com/mangas';
    x(manga_list_url, '.table .row a',
      [{
        title: '',
        url: '@href'
      }]
    )((err, results) => {
      if (err) throw err;
        for (var i = 0, len = results.length; i < len; i++) {
            if(results[i].url.includes("/mangas/"))
            {
                manga_list.push(results[i].url);
            }
        }
        console.log(manga_list);
    });
}