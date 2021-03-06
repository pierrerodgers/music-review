const axios = require('axios');
const cheerio = require('cheerio');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
var errors = fs.createWriteStream("errors.txt", {flags:'a'});

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

        const reviewRow = $('#criticReviewContainer .albumReviewRow, #moreCricitReviews .albumReviewRow');
        reviewRow.map( (index, element) => {


            const reviewerArr = $('.albumReviewHeader > a > span', element);
            const scoresArr = $('.albumReviewRating > span', element);
            const dateArr = $('.albumReviewRow > [itemprop="dateCreated"]', element);
            const linkArr = $('.albumReviewLinks .extLink > a', element);
            let link;
            if (linkArr.length == 0) link = '';
            else link = linkArr[0].attribs.href;
            
            let review = {
                reviewer: reviewerArr[0].firstChild.data,
                score: scoresArr[0].firstChild.data,
                date: dateArr[0].attribs.content,
                link : link,
            }

            reviews.push(review);
        })

        console.log(`reviews length: ${reviews.length}`);

        return reviews;
    
    
    
    }
    catch (error) {
        errors.write(`${album.artist} -- ${album.name} ------ error finding reviews (${error})\n`);

        console.log(error);
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

    while ($('div .large-font').length == 0) { //this returns 1 when end of list reached
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

    for (let album of albums) {
        album.reviews = await getScoresByAlbum(album);
        if (album.reviews == undefined) album.reviews = [];
        //console.log(album.reviews);
    }

    return albums;
}


async function addYearToDB(year) {
    const albums = await processYear(year);
    
    const dbUrl = 'mongodb://localhost:27017';

    const dbName = 'music';

    MongoClient.connect(dbUrl, async (err, client) => {
        if (err) throw error;
        let db = client.db(dbName);

        for (let album of albums) {
            try {
                console.log(`adding album: ${album}`);

                // Find artist in db, add if it doesnt exist, fill artistId field
                let artistDoc = await db.collection('artists').findOne({name: album.artist});
                let artistId;
                if (artistDoc) {
                    artistId = artistDoc._id;
                }
                else {
                    let artist = await db.collection('artists').insertOne({name: album.artist});
                    artistId = artist.insertedId;
                }
                console.log(`artistid: ${artistId}`)

                // Find album in db, add if it doesn't exist, fill albumId field
                let albumDoc = await db.collection('albums').findOne({name: album.name, artist: album.artist});
                let albumId;
                if (albumDoc) albumId = albumDoc._id;
                else {
                    let insertedAlbum = await db.collection('albums').insertOne({name: album.name, artist: artistId, });
                    albumId = insertedAlbum.insertedId;
                }
                console.log(`album: ${albumId}`)


                // Add every review the album has/add reviewer if needed
                for (let review of album.reviews) {
                    // Find reviewer in db, add if it doesn't exist, fill reviewerId field
                    let reviewerId;
                    let reviewerDoc = await db.collection('reviewers').findOne({name: review.reviewer});
                    if (reviewerDoc) reviewerId = reviewerDoc._id;
                    else {
                        // Link will have to be modified one-by-one in db
                        let reviewer = await db.collection('reviewers').insertOne({name: review.reviewer, link: `${review.link}`});
                        reviewerId = reviewer.insertedId;
                    }

                    // Add review to db

                    let date = new Date(review.date);

                    let reviewToAdd = {
                        reviewer: reviewerId,
                        artist: artistId,
                        album: albumId,
                        link: review.link,
                        score: review.score,
                        date: date
                    };


                    db.collection('reviews').insertOne(reviewToAdd);


                }
            }
            catch (error) {
                errors.write(`${album.artist} -- ${album.title} ------ error adding to mongodb (${error})\n`);
                console.log(error);
            }
        

        }

        client.close();

    });


}

//addYearToDB(2019);

//addYearToDB(2000).catch(error => console.log(error));
/*for ( var i = 2001; i < 2019; i++) {
    addYearToDB(i);
}*/

printReviewers();

async function printReviewers() {
    const dbUrl = 'mongodb://localhost:27017';
    const dbName = 'music';

    MongoClient.connect( dbUrl, async (error, client) => {
        if (error) throw error;
        let db = client.db(dbName);

        let reviewers = await db.collection("reviewers").find().toArray();
        console.log(typeof(reviewers));

        let reviewersFile = fs.createWriteStream("reviewers.txt", {flags:'a'});

        reviewers.map( reviewer => {
            console.log(reviewer);
            reviewersFile.write(`${reviewer.name}\n`);
        })
    })
}


module.exports = {
    getAotyScores: getAotyScores,
}