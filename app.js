const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const port = 5001;

// MongoDB connection URI
const mongoUri = 'mongodb://localhost:27017';
const dbName = 'zoma';
const collectionName = 'resto';

// Set up EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Function to fetch restaurants with pagination
async function fetchRestaurants(query = '', page = 1, limit = 10) {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        let searchQuery = {};
        if (query) {
            const idQuery = ObjectId.isValid(query) ? new ObjectId(query) : null;
            if (idQuery) {
                searchQuery = { _id: idQuery };
            } else {
                searchQuery = {
                    $or: [
                        { 'restaurant.id': query },
                        { 'restaurant.name': new RegExp(query, 'i') } // Case-insensitive search
                    ]
                };
            }
        }

        console.log('Search query:', searchQuery);
        const totalCount = await collection.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalCount / limit);
        const restaurants = await collection.find(searchQuery).skip((page - 1) * limit).limit(limit).toArray();
        console.log('Search results:', restaurants);
        return { restaurants, totalPages, currentPage: page };
    } catch (err) {
        console.error(`Failed to fetch data: ${err}`);
    } finally {
        await client.close();
    }
}

// Function to fetch filtered restaurants with pagination
async function fetchFilteredRestaurants(filters, page = 1, limit = 10) {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        let searchQuery = {};

        if (filters.country) {
            searchQuery['restaurant.location.country_id'] = Number(filters.country); // Use country_id
        }
        
        if (filters.average_cost) {
            const [minCost, maxCost] = filters.average_cost.split('-').map(Number);
            searchQuery['restaurant.average_cost_for_two'] = {};
            if (minCost) searchQuery['restaurant.average_cost_for_two'].$gte = minCost;
            if (maxCost) searchQuery['restaurant.average_cost_for_two'].$lte = maxCost;
        }
        
        if (filters.cuisines) {
            searchQuery['restaurant.cuisines'] = new RegExp(filters.cuisines, 'i');
        }

        console.log('Search query:', searchQuery);
        const totalCount = await collection.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalCount / limit);
        const restaurants = await collection.find(searchQuery).skip((page - 1) * limit).limit(limit).toArray();
        console.log('Search results:', restaurants);
        return { restaurants, totalPages, currentPage: page };
    } catch (err) {
        console.error(`Failed to fetch data: ${err}`);
    } finally {
        await client.close();
    }
}

//catch

// Function to fetch unique country details
async function fetchUniqueCountries() {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        // Fetch distinct country IDs
        const countryIds = await collection.distinct('restaurant.location.country_id');
        const countryDetails = countryIds.map(id => {
            switch (id) {
                case 1: return { code: id, name: 'India' };
                case 14: return { code: id, name: 'Australia' };
                case 30: return { code: id, name: 'Brazil' };
                case 37: return { code: id, name: 'Canada' };
                case 94: return { code: id, name: 'Indonesia' };
                case 148: return { code: id, name: 'New Zealand' };
                case 162: return { code: id, name: 'Philippines' };
                case 166: return { code: id, name: 'Qatar' };
                case 184: return { code: id, name: 'Singapore' };
                case 189: return { code: id, name: 'South Africa' };
                case 191: return { code: id, name: 'Sri Lanka' };
                case 208: return { code: id, name: 'Turkey' };
                case 214: return { code: id, name: 'UAE' };
                case 215: return { code: id, name: 'United Kingdom' };
                case 216: return { code: id, name: 'United States' };
                default: return { code: id, name: 'Unknown' };
            }
        });
        
        return countryDetails;
    } catch (err) {
        console.error(`Failed to fetch countries: ${err}`);
    } finally {
        await client.close();
        console.timeEnd('fetchRestaurantById');
    }
}
// //catch

// const NodeCache = require('node-cache');
// const restaurantCache = new NodeCache({ stdTTL: 3600 }); 

// async function fetchRestaurantById(id) {
//     const cacheKey = `restaurant_${id}`;

//     console.time('fetchRestaurantById');

//     // Check cache first
//     let restaurant = restaurantCache.get(cacheKey);

//     if (restaurant) {
//         console.log("Cache hit for restaurant ID:", id);
//         console.timeEnd('fetchRestaurantById');  
//         return restaurant;
//     }

//     const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
//     try {
//         await client.connect();
//         console.log("Connected to MongoDB");
//         const db = client.db(dbName);
//         const collection = db.collection(collectionName);
//         restaurant = await collection.findOne({ 'restaurant.id': id });

//         if (restaurant) {
//             restaurantCache.set(cacheKey, restaurant);
//             console.log("Cache set for restaurant ID:", id);
//         }

//         return restaurant;
//     } catch (err) {
//         console.error(`Failed to fetch restaurant: ${err}`);
//     } finally {
//         await client.close();
//         console.timeEnd('fetchRestaurantById'); 
//     }
// }




    //Function to fetch restaurant by ID
    async function fetchRestaurantById(id) {
        const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            await client.connect();
            console.log("Connected to MongoDB");
            //console.time('fetchRestaurantById');
            console.time('dbRetrieve');
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            const restaurant = await collection.findOne({ 'restaurant.id': id });
            return restaurant;
        } catch (err) {
            console.error(`Failed to fetch restaurant: ${err}`);
        } finally {
            await client.close(); 
            //console.timeEnd('fetchRestaurantById');
            console.timeEnd('dbRetrieve');
        } 
    }



// Route to render the home page with restaurant list and search form
app.get('/', async (req, res) => {
    const query = req.query.query || '';
    const page = parseInt(req.query.page, 10) || 1;
    const { restaurants, totalPages, currentPage } = await fetchRestaurants(query, page);
    const countries = await fetchUniqueCountries(); // Fetch unique countries for filter options
    const startPage = Math.max(1, currentPage - 4);
    const endPage = Math.min(totalPages, currentPage + 5); 
    //res.json(restaurants);
    res.render('index', { restaurants, query, countries, totalPages, currentPage, startPage, endPage, selectedCountry: '', averageCost: '', cuisines: '' });
});

// Route to handle search functionality via form submission
app.get('/search', async (req, res) => {
    const query = req.query.query || '';
    const page = parseInt(req.query.page, 10) || 1;
    const { restaurants, totalPages, currentPage } = await fetchRestaurants(query, page);
    const countries = await fetchUniqueCountries();
    const startPage = Math.max(1, currentPage - 4);
    const endPage = Math.min(totalPages, currentPage + 5);
    //res.json(restaurants);
    res.render('index', { restaurants, query, countries, totalPages, currentPage, startPage, endPage, selectedCountry: '', averageCost: '', cuisines: '' });
});      
     
// Route to handle filters with pagination
app.get('/filter', async (req, res) => {
    const filters = { 
        country: req.query.country || '',
        average_cost: req.query.average_cost || '',
        cuisines: req.query.cuisines || ''
    };
    const page = parseInt(req.query.page, 10) || 1;
    const { restaurants, totalPages, currentPage } = await fetchFilteredRestaurants(filters, page);
    const countries = await fetchUniqueCountries(); // Fetch unique countries for filter options
    const startPage = Math.max(1, currentPage - 4);
    const endPage = Math.min(totalPages, currentPage + 5);
    res.render('index', { restaurants, query: '', countries, totalPages, currentPage, startPage, endPage, selectedCountry: filters.country, averageCost: filters.average_cost, cuisines: filters.cuisines });
});

// Route to handle clear filters
app.get('/clear-filters', async (req, res) => {
    // Redirect to home page without any query parameters
    res.redirect('/');
});


// Route to render details of a specific restaurant by ID
app.get('/restaurant/:id', async (req, res) => {
    const restaurant = await fetchRestaurantById(req.params.id);
    if (!restaurant) {
        return res.status(404).send('Restaurant not found');
    }
    //res.json(restaurant);    
    res.render('restaurant', { restaurant });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
