const MongoClient = require('mongodb').MongoClient;   
const dbUrl = 'mongodb://localhost:27017';

const dbName = 'music';

async function findDups() {
    MongoClient.connect(dbUrl, async (err, client) => {
        if (err) throw err;
        let db = client.db(dbName);
    
        let reviews = await db.collection('reviews').find();
        //console.log(reviews);
        let total = 0;
        await reviews.forEach( async function(review) {
            //console.log(review);
            //let count = await db.collection('reviews').find({artist:review.artist, date:review.date}).count();
            
            let count = await db.collection('albums').find({_id:review.album}).count();
            if (count == 0) {
                total++;
                console.log(total);
                db.collection('reviews').deleteOne({_id:review._id});
            }

            
            /*if (count > 1){
                console.log(review);
            }*/
        })

        console.log(total);
    
    
    });
}

findDups();