const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;



// middlewere
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wgjsrij.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })

    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {

    try {

        const serviceCollection = client.db('luckyPointDbUser').collection('services');
        const reviewCollection = client.db('luckyPointDbUser').collection('reviews');

        // JWT TOKEN

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' })
            res.send({ token })
        })


        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.send(service);

        })

        // Add service
        app.post('/services', async (req, res) => {
            const review = req.body;
            const result = await serviceCollection.insertOne(review);
            res.send(result);
        })


        // Load logged user review.

        app.get('/reviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded;

            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }


            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query)
            const reviews = await cursor.toArray();
            res.send(reviews);
        })


        // get review
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const review = await reviewCollection.findOne(query);
            res.send(review);

        })


        // Add review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })


        // review update

        app.put('/updatereview/:id', async (req, res) => {
            const filter = { _id: ObjectId(id) };
            const review = req.body;
            const option = { upsert: true };
            const updatedReview = {
                $set: {
                    message: review.message,
                }
            }
            const result = await reviewCollection.updateOne(filter, updatedReview, option);
            res.send(result)

        })

        // review delete
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const reviews = await reviewCollection.deleteOne(query);
            res.send(reviews);

        })



    }

    finally {

    }

}

run().catch(error => console.error(error));














app.get('/', (req, res) => {
    res.send('lucky point server running...')
})



app.listen(port, () => {
    console.log(`lucky server running on ${port}`)
})