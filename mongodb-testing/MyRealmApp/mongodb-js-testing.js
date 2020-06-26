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