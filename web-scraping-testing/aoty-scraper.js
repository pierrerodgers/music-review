const axios = require('axios');
const cheerio = require('cheerio');

async function urlToCheerio(url) {
    const { data } = await axios.get(url);
    
    return cheerio.load(data);

}

async function getAlbumLink(artist, title) {
    // Search page by album title, match to artist by filtering html
    const url = `https://www.albumoftheyear.org/search/albums/?q=${title.replace(/ /g, '%20').toLowerCase()}`;
    let $ = await urlToCheerio(url);

    const resultsArr = $('.albumBlock .albumTitle');
    let albumLink = ' ';

    for (let i = 0; i < resultsArr.length; i++) {
        
        if (resultsArr[i].parent.attribs.href.includes(`${artist.replace(/ /g, '-').toLowerCase()}`)) {
            albumLink = resultsArr[i].parent.attribs.href;
            break;
        }

    }
    if (albumLink == ' ') throw 'error in getAlbumLink function';
    else return `http://www.albumoftheyear.org${albumLink}`;
}

async function getAotyScores(artist, title) {
    try{
        /*console.log(artist);
        console.log(title);*/
        let albumLink = await getAlbumLink(artist, title);
        
        const $ = await urlToCheerio(albumLink);

        // Reviews stored in divs: id=criticReviewContainer and #criticReviewContainer child #moreCricitReviews (YES TYPO)
        // Review class: .albumReviewRow

        
        const reviewerArr = $('.albumReviewHeader > a > span');
        const scoresArr = $('.albumReviewRating > span');
        const dateArr = $('.albumReviewRow > [itemprop="dateCreated"]');
        const linkArr = $('.albumReviewLinks .extLink > a');

        reviewerArr.map( (index, element) => {
            console.log(element.firstChild.data);
            console.log(scoresArr[index].firstChild.data);
            console.log(dateArr[index].attribs.content);
            console.log(linkArr[index].attribs.href);
        });
    
       
    
    
    
    
    }
    catch (error) {
        //console.log(error);
    }
    

}
if (process.argv.length != 4) console.log('Usage: node aoty-scraper.js "<Artist Name>" "<Album Title>"');
else {
    getAotyScores(process.argv[2], process.argv[3]);
}/*
testingArray = [['Charli XCX',  "how i'm feeling now"], ['Khruangbin', 'Mordechai'], 
['HAIM', 'Women In Music Pt. III'], ['Weyes Blood', 'Titanic Rising'], ['Perfume Genius', 'Set my heart on fire immediately'], 
['Phoebe Bridgers', 'Punisher'], ['Lady Gaga', 'Chromatica'], ['Yves Tumor', 'Heaven to a tortured mind'], 
['Moses Sumney', 'grae'], ['Rina Sawayama', 'Sawayama'], ['TOPS', 'I feel alive'],
['The 1975', 'Notes on a conditional form']];

testingArray.map( async album =>  {
    await getAotyScores(album[0], album[1]);
    console.log(album);

})*/

module.exports = {
    getAotyScores: getAotyScores,
}