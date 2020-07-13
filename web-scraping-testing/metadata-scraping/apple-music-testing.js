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

async function getAlbumReleaseDate(artist, name) {
    try {
        // Create search term ( i.e. /search?Charli+XCX+how+i'm+feeling+now)
        let regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
        let artistString = artist.replace(regex, '').replace(/ /g, '+');
        let albumString = name.replace(regex, '').replace(/ /g, '+');
        let search = `${artistString}+${albumString}`;
        
        // Get API response using token and get first result
        let response = await axios.get(`https://api.music.apple.com/v1/catalog/us/search?term=${search}&limit=5`, {headers: {Authorization: `Bearer ${jwtToken}`}});
        console.log(response.status);
        let albums = response.data.results.albums.data;
        let album = albums.find( album => album.attributes.name == name && album.attributes.artistName == artist);
        // Throw error if needed
        if (album === undefined) throw new Error(`Error finding release date:${artist} - ${name}`);
        
        // Create date and log
        let date = new Date(album.attributes.releaseDate);

        console.log(`${album.attributes.name} ---- ${date}`);
        return date;
    }
    catch (err) {
        // Write error to file if needed
        errors.write(`error with ${artist} - ${name}:${err.toString()}\n`);
    }
    
    
}

async function updateDbReleaseDates() {
    MongoClient.connect(url,  async (err, client) => {
        if (err) throw err;
        let db = client.db(dbName);

        let albums = await db.collection('albums').find().toArray();
        
        for (let album of albums) {
            // Find artist
            let artist = await db.collection('artists').findOne({_id:album.artist});
            album.releaseDate = await getAlbumReleaseDate(artist.name, album.name);
            await db.collection('albums').update({_id: album._id}, album).catch( err => console.log(err));
        }

    });

}

updateDbReleaseDates();
