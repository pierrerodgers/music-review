const axios = require('axios');
const cheerio = require('cheerio')

async function getHtml(url) {
    const response = await axios.get(url);
    console.log(response);
}

async function getPitchforkScore(artist, title) {
    let artistString = artist.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    artistString = artistString.replace(/ /g, '-').toLowerCase();
    console.log(artistString)

    let titleString = title.replace(/[.,\/#!$'%\^&\*;:{}=\-_`~()]/g,"");
    titleString = titleString.replace(/ /g, '-').toLowerCase();
    console.log(titleString);

    const reviewUrl = `http://www.pitchfork.com/reviews/albums/${artistString}-${titleString}`;
    
    await getHtml(reviewUrl).catch(error => console.log(error));


}
getPitchforkScore('Charli xcx', "how i'm feeling now");