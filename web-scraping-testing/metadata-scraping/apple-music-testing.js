const axios = require('axios');
const fs = require('fs');
const jwt = require("jsonwebtoken");
const { ObjectID } = require('mongodb');
var errors = fs.createWriteStream("apple-music-errors.txt", {flags:'a'});

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'music';


const privateKey = fs.readFileSync("AuthKey_KDNARVQ7Z5.p8").toString(); //your MusicKit private key
const jwtToken = jwt.sign({}, privateKey, {
  algorithm: "ES256",
  expiresIn: "180d",
  issuer: "FL2XWDE655", //your 10-character Team ID, obtained from your developer account
  header: {
    alg: "ES256",
    kid: "KDNARVQ7Z5" //your MusicKit Key ID
  }
});


async function getAppleMusicAlbum(artist,name) {
    try {
        console.log(`${artist} -- ${name}`);
        // Create search term ( i.e. /search?Charli+XCX+how+i'm+feeling+now)
        let regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
        let artistString = artist.replace(regex, '').replace(/ /g, '+');
        let albumString = name.replace(regex, '').replace(/ /g, '+');
        let search = `${artistString}+${albumString}`;
        
        // Get API response using token 
        let response = await axios.get(`https://api.music.apple.com/v1/catalog/us/search?term=${search}&limit=5`, {headers: {Authorization: `Bearer ${jwtToken}`}});
        console.log(response.status);
        let albums = response.data.results.albums.data;
        
        //Find first matching result 
        let album = albums.find( album => {
            let cleanedInputName = name.toLowerCase().replace(regex, '');
            let cleanedInputArtist = artist.toLowerCase().replace(regex,'');

            let cleanedOutputName = album.attributes.name.toLowerCase().replace(regex, '');
            let cleanedOutPutArtist = album.attributes.artistName.toLowerCase().replace(regex, '');
            
            return (cleanedInputArtist == cleanedOutPutArtist && cleanedInputName == cleanedOutputName);
        });

        if (album === undefined) throw new Error(`Error finding apple music data:${artist} - ${name}`);

        return album;
    }
    catch (err) {
        // Write error to file if needed
        errors.write(`error with ${artist} - ${name}:${err.toString()}\n`);
    }
}

async function getAppleMusicMetadata(album, artist) {
    
    //Get apple music data
    let appleMusicAlbum = await getAppleMusicAlbum(artist.name, album.name);

    // Create date and log
    let releaseDate = (appleMusicAlbum) ? new Date(appleMusicAlbum.attributes.releaseDate) : null;
    console.log(`${album.name} ---- ${releaseDate}`);

    // Get genre data
    let genres = (appleMusicAlbum) ? appleMusicAlbum.attributes.genreNames : [];
    console.log(genres);

    // Get record label data
    let recordLabel = (appleMusicAlbum)? appleMusicAlbum.attributes.recordLabel : null;
    console.log(recordLabel);

    // Get Apple Music link
    let appleMusicUrl = (appleMusicAlbum) ? appleMusicAlbum.attributes.url : '';
    let streamingUrls;
    if (typeof album.streamingUrls === 'undefined') {
        streamingUrls = {'appleMusic' : appleMusicUrl};
    }
    else {
        streamingUrls = album.streamingUrls;
        streamingUrls.appleMusic = appleMusicUrl;
    }

    // Add to album document
    album.releaseDate = releaseDate;
    album.genres = genres;
    album.recordLabel = recordLabel;
    album.streamingUrls = streamingUrls;

    return album;
}

async function updateDbMetadata() {
    MongoClient.connect(url,  async (err, client) => {
        if (err) throw err;
        let db = client.db(dbName);

        let albums = await db.collection('albums').find().toArray();
        for (let album of albums) {           
            // Find artist
            let artist = await db.collection('artists').findOne({_id:album.artist});
            let updatedAlbum = await getAppleMusicMetadata(album, artist);
            await db.collection('albums').updateOne({_id: album._id}, {$set: updatedAlbum}, {upsert:true}).catch( err => console.log(err));
            console.log();
        }

    });

}

updateDbMetadata().catch(err => console.log(err));
//getAppleMusicAlbum('Employed To Serve', 'Eternal Forward Motion');