//const scraper = require('./aoty-scraper');
const axios = require('axios');
const fs = require('fs');
//const { getAotyScores } = require('./aoty-scraper');


const chartsUrl = 'http://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=5e7132f2eb9c579f0f81b7d6d8c10d99&format=json'
async function getChartsScores() {
    const response = await axios.get(chartsUrl);
    //console.log(response.data.artists.artist);

    response.data.artists.artist.map(async artist  =>  {
        //console.log(`${artist.name} ==> ${artist.mbid}`);

        if (artist.mbid) {
            const albumsUrl = `http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&mbid=${artist.mbid}&api_key=5e7132f2eb9c579f0f81b7d6d8c10d99&format=json`;
            //console.log(albumsUrl);
            const response = await axios.get(albumsUrl);
            const albums = response.data.topalbums.album;
            //console.log(albums);
            try {
                await scraper.getAotyScores(artist.name, albums[0].name);
                console.log(`${artist.name} -- ${albums[0].name}`);
                console.log(); console.log(); console.log(); console.log();
            }
            catch{

            }
            
            /*albums.map( async album => {
                //onsole.log(album);
                //console.log(album.name);
                //console.log(artist.name);
                try {
                    scraper.getAotyScores(artist.name, album.name);
                }
                catch {
                    //console.log('error using my function')
                }
                // getAotyScores(artist.name, album.name);
            });*/
        }
        /*const albumsUrl = `http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&mbid=${artist.mbid}&api_key=YOUR_API_KEY&format=json`;

        const response = await axios.get(albumsUrl);

        console.log(response);*/
    })
    //const chartsJson = await response.toJson();
    //console.log(chartsJson.artists);
    /*for (var key in chartsJson) {

    }*/
}

async function getAlbumReleaseDate(artist, name) {
    const key = await fs.readFileSync('key.txt', 'utf-8');
    
    name = `how i'm feeling now`.replace(/ /g, '%20');

    const albumUrl = `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${name}&api_key=${key}&format=json`
    
    const response = await axios.get(albumUrl);

    let results = response.data.results.albummatches.album;
    console.log(results[0]);


}
console.log('hello');

getAlbumReleaseDate().catch(err => console.log(err));