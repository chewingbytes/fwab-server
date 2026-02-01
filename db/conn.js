import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://admin:password123@localhost:27017/stargazing?authSource=admin";
const client = new MongoClient(uri);

let conn;

try {
  console.log("Connecting to MongoDB...");
  conn = await client.connect();
  console.log("Connected successfully to MongoDB");
} catch (e) {
  console.error("Failed to connect to MongoDB", e);
  process.exit(1); // Exit the process with an error code
}

const db = conn.db("stargazing");

// Optional: Use event listeners to monitor connection status
client.on('serverOpening', () => console.log('MongoDB server connection opened'));
client.on('serverClosed', () => console.log('MongoDB server connection closed'));
client.on('serverDescriptionChanged', (event) =>
  console.log('MongoDB server description changed:', event)
);

export default db;
