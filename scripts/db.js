const MongoClient = require("mongodb").MongoClient;

const Mongo = {
  url: "mongodb://localhost:27017",
  // url: "mongodb+srv://kpax:kpax123@cluster0-wse70.mongodb.net/test?retryWrites=true&w=majority",
  dbName: "test",
  client: null,
  db: null,
  collectionName: "test",
  projects: null,
  updateProject(item) {
    var col = this.projects;
    col.findOne({ id: item.id }, (err, document) => {
      if (err || !document) {
        console.log("new item");
        item.lastModified = new Date();
        col.insertOne(item);
      } else {
        if (document.hash !== item.hash) {
          console.log("update item", document._id);
          col.updateOne(
            { _id: document._id },
            {
              $set: item,
              $currentDate: { lastModified: true }
            }
          );
        } else {
          console.log("no changes", document._id);
        }
      }
    });
  },
  connect(cb) {
    if (typeof cb !== "function") cb = () => {};
    if (Mongo.db) return cb(this);
    console.log("Connecting Mongo...");
    MongoClient.connect(Mongo.url, function(err, client) {
      if(err) console.log('error', err);
      Mongo.client = client;
      Mongo.db = client.db(Mongo.dbName);
      Mongo.projects = Mongo.db.collection(Mongo.collectionName);
      console.log("Connected Mongo...");
      return cb(this);
    });
  }
};

module.exports = Mongo;
