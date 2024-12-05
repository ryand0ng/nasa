const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
require('dotenv').config();

const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.rkvjp.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

let collection;
(async() => {
    const client = new MongoClient(uri);
    await client.connect();
    collection = client.db(process.env.MONGO_DB_NAME).collection(process.env.MONGO_COLLECTION);
})();

app.get('/', async (req, res) => {
    const response = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`
    );
    const data = await response.json();
    const comments = await collection.find().toArray();
    res.render('index', { apod: data, comments: comments });
});

app.post('/comment', async (req, res) => {
    const text = req.body.text;
    const comment = { text: text, date: new Date() };
    await collection.insertOne(comment);
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
