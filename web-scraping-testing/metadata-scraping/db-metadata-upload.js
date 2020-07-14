const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'music';
const { ObjectID } = require('mongodb');
const { getAppleMusicMetadata } = require('./apple-music-metadata.js');
const fs = require('fs');

var errors = fs.createWriteStream("apple-music-errors-3.txt", {flags:'a'});


async function updateDbMetadata() {
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

    });

}

updateDbMetadata().catch(err => console.log(err));
//getAppleMusicAlbum('Employed To Serve', 'Eternal Forward Motion');