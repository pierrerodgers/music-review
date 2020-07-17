const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'music';
const { ObjectID } = require('mongodb');
const { getAppleMusicMetadata, getAppleMusicArtistLink } = require('./apple-music-metadata.js');
const { getSpotifyMetadata, getSpotifyArtistLink, getSpotifyArtistMetadata } = require('./spotify-metadata.js');
const { getAlbumArtwork } = require('./last-fm-testing');
const fs = require('fs');

var errors = fs.createWriteStream("artist-streaming-errors.txt", {flags:'a'});


async function updateAppleMusicMetadata() {
    MongoClient.connect(url,  async (err, client) => {
        if (err) throw err;
        let db = client.db(dbName);
        
        // Only fetch those without metadata 
        let albums = await db.collection('albums').find({releaseDate:null}).toArray();
        for (let album of albums) {           
            // Find artist
            let artist = await db.collection('artists').findOne({_id:album.artist});
            
            try {
                let updatedAlbum = await getAppleMusicMetadata(album, artist);
                await db.collection('albums').updateOne({_id: album._id}, {$set: updatedAlbum}, {upsert:true}).catch( err => console.log(err));
                console.log();
            }
            catch (err) {
                errors.write(err.toString());
            }
            
        }

        client.close();

    });
}

async function updateSpotifyMetadata() {
    MongoClient.connect(url,  async (err, client) => {
        if (err) throw err;
        let db = client.db(dbName);
        
        // Only fetch those without metadata 
        let albums = await db.collection('albums').find().toArray();
        for (let album of albums) {           
            // Find artist
            let artist = await db.collection('artists').findOne({_id:album.artist});
            
            try {
                let updatedAlbum = await getSpotifyMetadata(album, artist);
                console.log(updatedAlbum);
                //await db.collection('albums').updateOne({_id: album._id}, {$set: updatedAlbum}, {upsert:true}).catch( err => console.log(err));
                console.log();
            }
            catch (err) {
                console.log(err);
                //errors.write(err.toString());
            }
            
        }
        client.close();


    });
}

async function updateDbMetadata() {
    MongoClient.connect(url,  async (err, client) => {
        if (err) throw err;
        let db = client.db(dbName);
        
        let albums = await db.collection('albums').find().toArray();

        // Count to track progress
        let count = 0;
        let total = albums.length;
        for (let album of albums) {           
            count++;
            console.log(`${count} albums / ${total}`);
            // Find artist
            let artist = await db.collection('artists').findOne({_id:album.artist});
            
            try {
                
                let updatedAlbum = await getSpotifyMetadata(album, artist);
                if (album.releaseDate == null) updatedAlbum = await getAppleMusicMetadata(updatedAlbum, artist);

                await db.collection('albums').updateOne({_id: album._id}, {$set: updatedAlbum}, {upsert:true}).catch( err => console.log(err));
                console.log();
            }
            catch (err) {
                errors.write(err.toString());
            }
            
        }

        client.close();

    });
}

async function updateDbAlbumArtwork() {
    MongoClient.connect(url,  async (err, client) => {
        if (err) throw err;
        let db = client.db(dbName);
        
        let albums = await db.collection('albums').find().toArray();

        // Count to track progress
        let count = 0;
        let total = albums.length;
        for (let album of albums) {           
            count++;
            console.log(`${count} albums / ${total}`);
            // Find artist
            let artist = await db.collection('artists').findOne({_id:album.artist});
            
            try {
                
                let artworkUrl = await getAlbumArtwork(artist.name, album.name);

                album.artwork = (artworkUrl) ? artworkUrl : null;
                await db.collection('albums').updateOne({_id: album._id}, {$set: album}, {upsert:true}).catch( err => console.log(err));
                console.log();
            }
            catch (err) {
                errors.write(err.toString());
            }
            
        }

        client.close();

    });
}

async function updateDbArtistLinks() {
    MongoClient.connect(url,  async (err, client) => {
        if (err) throw err;
        let db = client.db(dbName);
        
        let artists = await db.collection('artists').find().toArray();

        // Count to track progress
        let count = 0;
        let total = artists.length;
        for (let artist of artists) {           
            count++;
            console.log(`${count} artists / ${total}`);
            try {
                
                let spotifyArtist = await getSpotifyArtistMetadata(artist.name).catch(err => errors.write(err.toString()));
                let appleMusicUrl = await getAppleMusicArtistLink(artist.name).catch(err => errors.write(err.toString()));

                if (spotifyArtist === undefined && appleMusicUrl === undefined) throw new Error();

                let streamingUrls = {'spotify': spotifyArtist.streaming, 'appleMusic': appleMusicUrl};
                artist.streamingUrls = streamingUrls;

                artist.image = (spotifyArtist) ? spotifyArtist.image : '';


                await db.collection('artists').updateOne({_id: artist._id}, {$set: artist}, {upsert:true}).catch( err => console.log(err));
                console.log();
            }
            catch (err) {
                errors.write(err.toString());
            }
            
        }

        client.close();

    });
}
updateDbArtistLinks().catch(err=>console.log(err));
//updateDbAlbumArtwork().catch(err => console.log(err));
//updateDbMetadata().catch( err => console.log(err));
//updateSpotifyMetadata().catch( err => console.log(err));
//updateDbMetadata().catch(err => console.log(err));
//getAppleMusicAlbum('Employed To Serve', 'Eternal Forward Motion');