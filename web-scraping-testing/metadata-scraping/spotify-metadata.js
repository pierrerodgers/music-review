const axios = require('axios');
const fs = require('fs');
const clientID = fs.readFileSync('spotify-client-id.txt').toString().replace('\n','');
const clientSecret = fs.readFileSync('spotify-client-secret.txt').toString().replace('\n','');


async function getSpotifyToken() {
    let response = await axios({
        url: 'https://accounts.spotify.com/api/token',
        method: 'post',
        params: {
          grant_type: 'client_credentials'
        },
        headers: {
          'Accept':'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: clientID,
          password: clientSecret,
        }
    });
    console.log(response.data.access_token);
    return response.data.access_token;
}

async function getSpotifyAlbum(artist, name) {
    let token = await getSpotifyToken();
    console.log(token);
    
    let regex = /[!"#$%&'()*+,-./:;<=>?’@[\]^_`{|}~]/g;
    let artistString = artist.replace(regex, '').replace(/ /g, '%20');
    let albumString = name.replace(regex, '').replace(/ /g, '%20');

    let url = `https://api.spotify.com/v1/search?q=${artistString}%20${albumString}&type=album`;
    let response = await axios.get(url, {headers: {Authorization: `Bearer ${token}`}});
    
    let albums = response.data.albums.items;
    
    // Filter out single albums
    albums = albums.filter(album => {return (album.album_type != 'single')});
    //console.log(albums);

    //Find first matching result 
    let album = albums.find( album => {
        // Clean all of punctuation
        // Clean any instance of 'and'
        // Clean all spaces
        let cleanedInputName = name.toLowerCase().replace(regex, '').replace(/ and /g, '').replace(/ /g, '');
        let cleanedInputArtist = artist.toLowerCase().replace(regex,'').replace(/ and /g, '').replace(/ /g, '');;

        let cleanedOutputName = album.name.toLowerCase().replace(regex, '').replace(/ and /g, '').replace(/ /g, '');;
        let cleanedOutPutArtist = album.artists[0].name.toLowerCase().replace(regex, '').replace(/ and /g, '').replace(/ /g, '');;

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

    if (album === undefined) throw new Error(`Error finding spotify data:${artist} - ${name}\n`);

    return album;

}

async function getSpotifyMetadata(album, artist) {
    // Album is an album object, artist is the artist object
    try {
        //Get spotify data
        let spotifyAlbum = await getSpotifyAlbum(artist.name, album.name);

        // Get Spotify url
        let spotifyUrl = (spotifyAlbum) ? spotifyAlbum.external_urls.spotify : '';
        let streamingUrls;
        if (typeof album.streamingUrls === 'undefined') {
            streamingUrls = {'spotify' : spotifyUrl};
        }
        else {
            streamingUrls = album.streamingUrls;
            streamingUrls.spotify = spotifyUrl;
        }
        console.log(streamingUrls);

        // Add to album document
        album.streamingUrls = streamingUrls;

        return album;
    }
    
    catch (err) {
        throw err;
    }
}

async function getSpotifyArtist(artistName) {
    // artist parameter is artist name
    
    let token = await getSpotifyToken();
    
    let regex = /[!"#$%&'()*+,-./:;<=>?’@[\]^_`{|}~]/g;
    let artistString = artistName.replace(regex, '').replace(/ /g, '%20');

    let url = `https://api.spotify.com/v1/search?q=${artistString}&type=artist`;
    let response = await axios.get(url, {headers: {Authorization: `Bearer ${token}`}});
    
    let artists = response.data.artists.items;

    //Find first matching result 
    let spotifyArtist = artists.find( artist => {
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

    if (spotifyArtist === undefined) throw new Error(`Error finding spotify data:${artist}\n`);

    return spotifyArtist;

}

async function getSpotifyArtistMetadata(artistName) {
    let artist = await getSpotifyArtist(artistName);
    let url = artist.external_urls.spotify;
    let artistImage = (artist.images) ? artist.images[0].url: '';

    let artistObject = {streaming: url, image:artistImage};
    return artistObject;
}

//getSpotifyAlbum('Charli XCX', 'Charli').catch(err => {console.log(err);});

module.exports = {
    getSpotifyAlbum: getSpotifyAlbum,
    getSpotifyMetadata: getSpotifyMetadata,
    getSpotifyArtist : getSpotifyArtist,
    getSpotifyArtistMetadata: getSpotifyArtistMetadata,
}