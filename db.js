const mongoose = require("mongoose");
const db = require("./config/keys").mongoURI;
const { MongoMemoryServer } = require("mongodb-memory-server");

class LiveDB {
  static startDB() {
    mongoose
      .connect(db, { useNewUrlParser: true })
      .then(resp => console.log("MongoDB Connected..."))
      .catch(err => console.log(err));
  }

  static closeDB() {
    mongoose.connection.close(() => {
      console.log("Mongoose default connection closed...");
    });
  }
}

class TestDB {
  constructor() {
    this.db = null;
    this.server = new MongoMemoryServer();
    this.connection = null;
  }

  /**
   * Start the server and establish a connection
   */
  async startDB() {
    const mongoUri = await this.server.getConnectionString();
    this.connection = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useFindAndModify: false
    });
  }

  async stopDB() {
    await this.connection.disconnect();
    return this.server.stop();
  }
}

module.exports = {
  LiveDB,
  TestDB
};
