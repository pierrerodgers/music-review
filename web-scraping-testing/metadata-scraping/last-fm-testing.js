//const scraper = require('./aoty-scraper');
const axios = require('axios');
const fs = require('fs');
//const { getAotyScores } = require('./aoty-scraper');


async function getAlbumArtwork(artist, name) {
    const key = fs.readFileSync('last-fm-key.txt', 'utf-8');

    let regex = /[!"#$%&'()*+,-./:;<=>?’@[\]^_`{|}~]/g;
    let artistString = artist.replace(regex, '').replace(/ /g, '%20');
    let albumString = name.replace(regex, '').replace(/ /g, '%20');
    
    const albumUrl = `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${albumString}&artist=${artistString}&api_key=${key}&format=json`
    
    const response = await axios.get(albumUrl);

    let albums = response.data.results.albummatches.album;

    let album = albums.find( album => {
        // Clean all of punctuation
        // Clean any instance of 'and'
        // Clean all spaces
        let cleanedInputName = name.toLowerCase().replace(regex, '').replace(/ and /g, '').replace(/ /g, '');
        let cleanedInputArtist = artist.toLowerCase().replace(regex,'').replace(/ and /g, '').replace(/ /g, '');;

        let cleanedOutputName = album.name.toLowerCase().replace(regex, '').replace(/ and /g, '').replace(/ /g, '');;
        let cleanedOutPutArtist = album.artist.toLowerCase().replace(regex, '').replace(/ and /g, '').replace(/ /g, '');;

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
    
    if (album === undefined) throw new Error(`Error finding lastfm image data:${artist} - ${name}\n`);

    let image = album.image.find( image => {return image.size == 'extralarge'} );
    if (image === undefined) throw new Error(`Error finding lastfm image data:${artist} - ${name}\n`);
    
    console.log(image['#text'].replace('300x300', '1024x1024'));

    return image['#text'].replace('300x300', '1024x1024');

}

async function getArtistImage(artistName) {
    const key = fs.readFileSync('last-fm-key.txt', 'utf-8');

    let regex = /[!"#$%&'()*+,-./:;<=>?’@[\]^_`{|}~]/g;
    let artistString = artistName.replace(regex, '').replace(/ /g, '%20');
    
    const albumUrl = `http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${artistString}&api_key=${key}&format=json`
    
    const response = await axios.get(albumUrl);
    console.log(response.data);

    let artists = response.data.results.artistmatches.artist;
    console.log(artists);

    let artist = artists.find( artist => {
        // Clean all of punctuation
        // Clean any instance of 'and'
        // Clean all spaces
        let cleanedInputArtist = artistName.toLowerCase().replace(regex,'').replace(/ and /g, '').replace(/ /g, '');;

        let cleanedOutPutArtist = artist.name.toLowerCase().replace(regex, '').replace(/ and /g, '').replace(/ /g, '');;

        console.log(cleanedInputArtist);
        console.log(cleanedOutPutArtist);
        
        
        // Test for .includes() instead of match
        // Should cover cases like '[name] Deluxe Edition' or multiple artist features
        return (
            (cleanedOutPutArtist.includes(cleanedInputArtist) || cleanedInputArtist.includes(cleanedOutPutArtist))
        );
    });
    
    if (artist === undefined) throw new Error(`Error finding lastfm image data:${artist}\n`);
    console.log(artist.image);
    let image = artist.image.find( image => {return image.size == 'extralarge'} );
    if (image === undefined) throw new Error(`Error finding lastfm image data:${artist} \n`);
    
    console.log(image['#text'].replace('300x300', '1024x1024'));

    return image['#text'].replace('300x300', '1024x1024');
}


module.exports = {
    getAlbumArtwork:getAlbumArtwork,
}