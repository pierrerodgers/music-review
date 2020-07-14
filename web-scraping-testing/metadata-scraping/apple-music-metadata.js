const axios = require('axios');
const jwt = require("jsonwebtoken");
const fs = require('fs');
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
        let regex = /[!"#$%&'()*+,-./:;<=>?’@[\]^_`{|}~]/g;
        let artistString = artist.replace(regex, '').replace(/ /g, '+');
        let albumString = name.replace(regex, '').replace(/ /g, '+');
        let search = `${artistString}+${albumString}`;
        
        // Get API response using token 
        let response = await axios.get(`https://api.music.apple.com/v1/catalog/us/search?term=${search}&limit=5`, {headers: {Authorization: `Bearer ${jwtToken}`}});
        console.log(response.status);
        let albums = response.data.results.albums.data;
        
        //Find first matching result 
        let album = albums.find( album => {
            // Clean all of punctuation
            // Clean any instance of 'and'
            // Clean all spaces
            let cleanedInputName = name.toLowerCase().replace(regex, '').replace(/ and /g, '').replace(/ /g, '');
            let cleanedInputArtist = artist.toLowerCase().replace(regex,'').replace(/ and /g, '').replace(/ /g, '');;

            let cleanedOutputName = album.attributes.name.toLowerCase().replace(regex, '').replace(/ and /g, '').replace(/ /g, '');;
            let cleanedOutPutArtist = album.attributes.artistName.toLowerCase().replace(regex, '').replace(/ and /g, '').replace(/ /g, '');;

            console.log(cleanedInputName);
            console.log(cleanedOutputName);
            console.log(cleanedInputArtist);
            console.log(cleanedOutPutArtist);
            
            
            // Test for .includes() instead of match
            // Should cover cases like '[name] Deluxe Edition' or multiple artist features
            return (
                (cleanedOutPutArtist.includes(cleanedInputArtist) || cleanedInputArtist.includes(cleanedOutPutArtist))
                && 
                (cleanedOutputName.includes(cleanedInputName) || cleanedInputName.includes(cleanedOutputName))
            );
        });

        if (album === undefined) throw new Error(`Error finding apple music data:${artist} - ${name}\n`);

        return album;
    }
    catch (err) {
        // Write error to file if needed
        throw new Error(`Error with ${artist} -- ${name}: ${err.toString()}`);
        
    }
}

async function getAppleMusicMetadata(album, artist) {
    try {
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
    
    catch (err) {
        throw err;
    }
}

module.exports = {
    getAppleMusicAlbum: getAppleMusicAlbum,
    getAppleMusicMetadata: getAppleMusicMetadata,
}