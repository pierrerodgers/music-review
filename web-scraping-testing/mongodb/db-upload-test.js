const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

const dbName = 'music';

MongoClient.connect(url, (err, client) => {
    if (err) throw error;
    let db = client.db(dbName);

    db.collection('reviewers').find().toArray( (err, result) => {
        if (err) throw error;
        console.log(result);

    });
    client.close();
});