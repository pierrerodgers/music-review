const axios = require('axios');
const cheerio = require('cheerio');

async function urlToCheerio(url) {
    const { data } = await axios.get(url);
    
    return cheerio.load(data);

}

async function getAlbumLink(artist, title) {
    // Search page by album title, match to artist by filtering html
    const url = `https://www.albumoftheyear.org/search/albums/?q=${title.replace(/ /g, '%20')}`;
    console.log(url);
    let $ = await urlToCheerio(url);

    const resultsArr = $('.albumBlock .albumTitle');
    let albumLink = ' ';

    for (let i = 0; i < resultsArr.length; i++) {
        
        if (resultsArr[i].parent.attribs.href.includes(`${artist.replace(/ /g, '-').toLowerCase()}`)) {
            albumLink = resultsArr[i].parent.attribs.href;
            break;
        }

    }
    if (albumLink == ' ') throw 'error';
    else return `http://www.albumoftheyear.org${albumLink}`;
}

async function getAotyScores(artist, title) {
    try{
        let albumLink = await getAlbumLink(artist, title);
        console.log(albumLink);
    }
    catch {
        console.log('error finding album');
    }
    

}

testingArray = [['Charli XCX',  "how i'm feeling now"], ['Khruangbin', 'Mordechai'], 
['HAIM', 'Women In Music Pt. III'], ['Weyes Blood', 'Titanic Rising'], ['Perfume Genius', 'Set my heart on fire immediately'], 
['Phoebe Bridgers', 'Punisher'], ['Lady Gaga', 'Chromatica'], ['Yves Tumor', 'Heaven to a tortured mind'], 
['Moses Sumney', 'grae'], ['Rina Sawayama', 'Sawayama'], ['TOPS', 'I feel alive'],
['The 1975', 'Notes on a conditional form']];

testingArray.map( async album =>  {
    getAotyScores(album[0], album[1]);

})