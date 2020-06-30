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
    try {
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

async function getScoresByAlbum(album) {
    try {
        albumLink = album.url;
        
        const $ = await urlToCheerio(albumLink);

        // Reviews stored in divs: id=criticReviewContainer and #criticReviewContainer child #moreCricitReviews (YES TYPO)
        // Review class: .albumReviewRow

        let reviews = [];

        const reviewerArr = $('.albumReviewHeader > a > span');
        const scoresArr = $('.albumReviewRating > span');
        const dateArr = $('.albumReviewRow > [itemprop="dateCreated"]');
        const linkArr = $('.albumReviewLinks .extLink > a');

        reviewerArr.map( (index, element) => {
            let reviewer = element.firstChild.data;
            let score = scoresArr[index].firstChild.data;
            let date = dateArr[index].attribs.content;
            let link = linkArr[index].attribs.href;

            let review = {
                reviewer: reviewer,
                score: score,
                date: date,
                link: link,
            }

            reviews.push(review);
            
        });

        console.log(`reviews length: ${reviews.length}`);

        return reviews;
    
    
    
    }
    catch (error) {
        //console.log(error);
    }
}

/* 
    NEW STRATEGY
    Use aoty yearly release tracker of LPs to get reviews then add to mongodb
*/

async function getAlbumsForYear(year) {
    //List of albums to return
    let albumsArr = [];
    
    // Construction of url
    let page = 1;
    let url = `https://www.albumoftheyear.org/${year}/releases/?type=lp&s=critic&page=${page}`
    
    let $ = await urlToCheerio(url);

    while ($('div .large-font').length == 0 && page <10) { //this returns 1 when end of list reached
        let albumNames = $('.albumBlock .albumTitle');
        let artists = $('.albumBlock .artistTitle');
        
        albumNames.map( (index, albumDiv) => {
            let name = albumDiv.firstChild.data;
            let artist = artists[index].firstChild.data;
            let url = albumDiv.parent.attribs.href;
            
            let album = {
                name: name,
                artist: artist,
                url: `https://www.albumoftheyear.org/${url}`,
            }

            albumsArr.push(album);
        });

        page++;
        url = `https://www.albumoftheyear.org/${year}/releases/?type=lp&s=critic&page=${page}`;
        $ = await urlToCheerio(url);

        console.log(albumsArr.length);

    }

    return albumsArr;

}


async function processYear(year) {
    const albums = await getAlbumsForYear(year);
    albums.map(async album => {
        album.reviews = await getScoresByAlbum(album);
        console.log(album.reviews);
    })

    console.log(albums);
}

processYear(2019);





/*
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