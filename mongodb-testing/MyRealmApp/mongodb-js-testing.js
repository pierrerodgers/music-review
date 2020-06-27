const Realm = require("realm");

const appId = "musicreview-atyeb"; // replace this with your App ID
const appConfig = {
  id: appId,
  timeout: 10000,
};

const TaskModel = {
    name: "Task",
    primaryKey: "_id",
    properties: {
        _id: "object id?",
        name: "string",
        description: "string",
    },
};

async function run() {
    let user;
    let realm;
    let tasks;

    try {
        const app = new Realm.App(appConfig);
        console.log('app opened')
        const credentials = Realm.Credentials.anonymous();

        user = await app.logIn(credentials);
        console.log('user logged in')
        const config = {
            schema: [TaskModel],
            sync: {
                user: user,
                partitionValue: 'tasks',
            },
        };

        realm = await Realm.open(config);

        

        console.log(`Logged in with the user: ${user.identity}`);

        realm.write( () => {
            realm.create("Task", {
                name: "Buy milk, eggs, and bread",
                status: "open"
            });
        });



    } finally {
        user.logOut();
        realm.close();
    }

}

run().catch(error => console.log(error));