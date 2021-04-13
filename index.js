const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')

const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tktro.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const app = express();

app.use(express.json());
app.use(cors());

const port = 5000



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productsCollection = client.db("ema-john").collection("products");
  const ordersCollection = client.db("ema-john").collection("orders");
  app.post('/addProduct', (req, res)=> {
      const products = req.body;
      // console.log(products);
      productsCollection.insertMany(products)
      .then(result => {
          console.log(result.insertedCount);
          req.res(result.insertedCount);
      })
  })
  // console.log('database connected');
  app.get('/products', (req, res)=>{    
    const search = req.query.search
    productsCollection.find({name : {$regex: search} })
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

  app.get('/product/:key', (req, res)=>{    
    productsCollection.find({key: req.params.key})
    .toArray((err, documents) => {
      res.send(documents[0])
    })
  })

  app.post('/productsByKeys', (req, res)=> {
    const productKeys = req.body;
    productsCollection.find({key: {$in : productKeys}})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

  app.post('/addOrder', (req, res)=> {
    const order = req.body;
    ordersCollection.insertOne(order)
    .then( result =>{
      res.send(result.insertedCount > 0)
    })
  })
});

  
console.log(process.env.DB_USER)
app.get('/', (req, res) => {
  res.send('Hello ema john!')
})

app.listen(process.env.PORT || port)