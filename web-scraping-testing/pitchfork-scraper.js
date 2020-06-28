const axios = require('axios');
const cheerio = require('cheerio');

async function getHtml(url) {
    const { data } = await axios.get(url);
    return data;
}

async function getPitchforkScore(artist, title) {
    try{
        // Strip artist string of punctuation/capitalisation and add -
        // i.e. Charli XCX --> charli-xcx
        let artistString = artist.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        artistString = artistString.replace(/ /g, '-').toLowerCase();

        //Same for the title
        // i.e. how i'm feeling now --> how-im-feeling-now
        let titleString = title.replace(/[.,\/#!$'%\^&\*;:{}=\-_`~()]/g,"");
        titleString = titleString.replace(/ /g, '-').toLowerCase();
        
        // Construct review URL
        const reviewUrl = `http://www.pitchfork.com/reviews/albums/${artistString}-${titleString}`;

        // Get html response and load into cheerio
        const response = await getHtml(reviewUrl);
        const $ = cheerio.load(response);

        // Get score from html (class = score)
        const score = await $('.score').text();

        return score;
    }
    catch {
        return '-';
    }
}

testingArray = [['Charli XCX',  "how i'm feeling now"], ['Khruangbin', 'Mordechai'], 
['HAIM', 'Women In Music Pt. III'], ['Weyes Blood', 'Titanic Rising'], ['Perfume Genius', 'Set my heart on fire immediately'], 
['Phoebe Bridgers', 'Punisher'], ['Lady Gaga', 'Chromatica'], ['Yves Tumor', 'Heaven to a tortured mind'], 
['Moses Sumney', 'grae'], ['Rina Sawayama', 'Sawayama'], ['TOPS', 'I feel alive']];

testingArray.map( async album =>  {
    const score = await getPitchforkScore(album[0], album[1]);

    console.log(`${score} === ${album[1]} by ${album[0]}.`);


})
