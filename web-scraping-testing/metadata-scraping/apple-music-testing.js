const axios = require('axios');
const fs = require('fs');
const jwt = require("jsonwebtoken");
var errors = fs.createWriteStream("apple-music-errors.txt", {flags:'a'});


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
    // Create search term ( i.e. /search?Charli+XCX+how+i'm+feeling+now)
    let search = `${artist.replace(/ /g, '+')}+${name.replace(/ /g, '+')}`;
    
    // Get API response using token and get first result
    let response = await axios.get(`https://api.music.apple.com/v1/catalog/us/search?term=${search}&limit=5`, {headers: {Authorization: `Bearer ${jwtToken}`}});
    let album;
    let albums = response.data.results.albums.data;
    //console.log(albums);
    for (let result of albums) {
        //console.log(result);
        if (result.attributes.name == name && result.attributes.artistName == artist) {
            album = result;
            break;
        }
    }
    console.log(typeof(album));
    if (album === undefined) throw new Error(`Error finding release date:${artist} - ${name}`);

    console.log(`${album.attributes.name} ---- ${album.attributes.releaseDate}`);
}

