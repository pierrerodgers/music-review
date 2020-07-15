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
    console.log(albums);

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

getSpotifyAlbum('Charli XCX', 'Charli').catch(err => {console.log(err);});