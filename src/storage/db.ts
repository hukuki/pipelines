import mongoose from "mongoose";

const uri = process.env.MONGO_DB_URI || "mongodb://localhost:27017/scraper";

mongoose.connect(uri);
const connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

connection.once("error", () => {
  console.log("MongoDB database connection failed");
});

export default connection;