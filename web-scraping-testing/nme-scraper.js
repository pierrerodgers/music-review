const axios = require('axios');
const cheerio = require('cheerio');
const { error } = require('console');

async function getHtml(url) {
    const { data } = await axios.get(url);
    return data;
}

async function getReviewUrl(artist, title) {
    try {
        // First need to search for album review
        const url = `http://www.nme.com/?s=${artist}+${title.substring(0, 6)}+review`.replace(/ /g, '+');

        const response = await getHtml(url).catch( error => console.log(error));
        //console.log(response);
        const $ = cheerio.load(response);

        // Get first entry of search
        const newUrl = $('.entry-title')[0].children[0].attribs.href;

        if (!newUrl.includes('review')) throw 'no review found';
        return newUrl;
    }

    catch {
        throw 'search error'
    }

}

async function getNmeScore(artist,title) {
    try {
        const url = await getReviewUrl(artist, title);
    
        const response = await getHtml(url);

        const $ = cheerio.load(response);

        const score = $('.td-icon-star').length;
        
        return score;
    }
    catch(error) {
        return '-';
    }
    
}

testingArray = [['Charli XCX',  "how i'm feeling now"], ['Khruangbin', 'Mordechai'], 
['HAIM', 'Women In Music Pt. III'], ['Weyes Blood', 'Titanic Rising'], ['Perfume Genius', 'Set my heart on fire immediately'], 
['Phoebe Bridgers', 'Punisher'], ['Lady Gaga', 'Chromatica'], ['Yves Tumor', 'Heaven to a tortured mind'], 
['Moses Sumney', 'grae'], ['Rina Sawayama', 'Sawayama'], ['TOPS', 'I feel alive'],
['The 1975', 'Notes on a conditional form']];

testingArray.map( async album =>  {
    const score = await getNmeScore(album[0], album[1]);

    console.log(`${score} === ${album[1]} by ${album[0]}.`);


})
