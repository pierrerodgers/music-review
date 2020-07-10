const axios = require('axios');
const fs = require('fs');
const jwt = require("jsonwebtoken");

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
    artist = artist.replace(/ /g, '+');
    name = name.replace(/ /g, '+');
    let search = `${artist}+${name}`;

    let response = await axios.get(`https://api.music.apple.com/v1/catalog/us/search?term=${search}&limit=3`, {headers: {Authorization: `Bearer ${jwtToken}`}});
    //console.log(response.data);
    let album = response.data.results.albums.data[0];
    //console.log(albums);
    console.log(`${album.attributes.name} ---- ${album.attributes.releaseDate}`);
}

testingArray = [['Charli XCX',  "how i'm feeling now"], ['Khruangbin', 'Mordechai'], 
['HAIM', 'Women In Music Pt. III'], ['Weyes Blood', 'Titanic Rising'], ['Perfume Genius', 'Set my heart on fire immediately'], 
['Phoebe Bridgers', 'Punisher'], ['Lady Gaga', 'Chromatica'], ['Yves Tumor', 'Heaven to a tortured mind'], 
['Moses Sumney', 'grae'], ['Rina Sawayama', 'Sawayama'], ['TOPS', 'I feel alive'],
['The 1975', 'Notes on a conditional form']];

testingArray.map( album => {
    getAlbumReleaseDate(album[0], album[1]);
})