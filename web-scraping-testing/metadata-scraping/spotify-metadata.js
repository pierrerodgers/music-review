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
    
    console.log(response.data.albums);


}

getSpotifyAlbum('Charli XCX', 'Charli').catch(err => {console.log(err.response.data);});