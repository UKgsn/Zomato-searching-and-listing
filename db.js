const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Configuration
const JSON_DIR_PATH = "./data_files"; // Replace with the path to your JSON files directory
const MONGO_URI = "mongodb://localhost:27017"; // MongoDB URI
const DATABASE_NAME = "zoma"; // Replace with your database name
const COLLECTION_NAME = "resto"; // Replace with your collection name
const MAX_DOCUMENTS = 1000; // Limit to 100 documents

let documentCount = 0; // Counter for inserted documents

// Load JSON data into MongoDB
async function loadJsonToDatabase() {
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB.");

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    fs.readdir(JSON_DIR_PATH, (err, files) => {
      if (err) {
        console.error("Error reading JSON directory:", err);
        return;
      }

      (async function processFiles() {
        for (const file of files) {
          if (documentCount >= MAX_DOCUMENTS) break;

          const filePath = path.join(JSON_DIR_PATH, file);
          const data = fs.readFileSync(filePath, "utf8");

          try {
            const jsonData = JSON.parse(data);

            if (Array.isArray(jsonData)) {
              for (const item of jsonData) {
                if (documentCount >= MAX_DOCUMENTS) break;
                if (item.restaurants && Array.isArray(item.restaurants)) {
                  for (const restaurant of item.restaurants) {
                    if (documentCount >= MAX_DOCUMENTS) break;
                    await insertDocument(collection, restaurant);
                  }
                }
              }
            } else if (
              jsonData.restaurants &&
              Array.isArray(jsonData.restaurants)
            ) {
              for (const restaurant of jsonData.restaurants) {
                if (documentCount >= MAX_DOCUMENTS) break;
                await insertDocument(collection, restaurant);
              }
            } else {
              console.warn("Skipping non-restaurant data:", jsonData);
            }

            // console.log(Data from ${file} processed.);
          } catch (err) {
            console.error("Error processing data from file:", err);
          }
        }
      })();
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  } finally {
    setTimeout(() => {
      client.close();
      console.log("Disconnected from MongoDB.");
    }, 5000); // Adjust the timeout as necessary
  }
}

// Function to insert document into MongoDB
async function insertDocument(collection, document) {
  try {
    if (documentCount >= MAX_DOCUMENTS) return;
    if (typeof document === "object" && document !== null) {
      await collection.insertOne(document);
      documentCount++;
    } else {
      console.warn("Skipping non-object document:", document);
    }
  } catch (err) {
    console.error("Error inserting document:", err);
  }
}

// Start the process
loadJsonToDatabase();