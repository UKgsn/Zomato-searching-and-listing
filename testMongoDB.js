const { MongoClient } = require('mongodb');

// Use your local MongoDB connection string
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('zoma'); // Use your actual database name
        const collection = db.collection('resto'); // Use your actual collection name

        // Fetch all documents to inspect
        const allDocs = await collection.find().toArray();
        console.log('All documents:', JSON.stringify(allDocs, null, 2)); // Print in a readable format

        // Test with a known value
        const searchQuery = { 'restaurant.name': /Chili's/i }; // Update this query to match your data
        const searchResults = await collection.find(searchQuery).toArray();
        console.log('Search results:', searchResults);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

run();
