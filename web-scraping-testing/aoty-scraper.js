const axios = require('axios');
const cheerio = require('cheerio');

async function urlToCheerio(url) {
    const { data } = await axios.get(url);
    
    return cheerio.load(data);

}

async function getAotyScores(artist, title) {
    // Search page by album title, match to artist by filtering html
    const url = `https://www.albumoftheyear.org/search/albums/?q=${title.replace(/ /g, '%20')}`;
    console.log(url);
    let $ = await urlToCheerio(url);
    
}

testingArray = [['Charli XCX',  "how i'm feeling now"], ['Khruangbin', 'Mordechai'], 
['HAIM', 'Women In Music Pt. III'], ['Weyes Blood', 'Titanic Rising'], ['Perfume Genius', 'Set my heart on fire immediately'], 
['Phoebe Bridgers', 'Punisher'], ['Lady Gaga', 'Chromatica'], ['Yves Tumor', 'Heaven to a tortured mind'], 
['Moses Sumney', 'grae'], ['Rina Sawayama', 'Sawayama'], ['TOPS', 'I feel alive'],
['The 1975', 'Notes on a conditional form']];

testingArray.map( async album =>  {
    getAotyScores(album[0], album[1]);

})