const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 4000
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken')

//Middle Wares
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.BIKE_RESALE_USER}:${process.env.BIKE_RESALE_PASSWORD}@cluster0.gijesb3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(){
   
}

async function run(){
  try{
    const advertisedProductsCollection = client.db('bikeReSale').collection('advertisedProducts')
    const categoriesCollection = client.db('bikeReSale').collection('categories')
    const productsCollection = client.db('bikeReSale').collection('products')
    const usersCollection = client.db('bikeReSale').collection('users')
    const bookingsCollection = client.db('bikeReSale').collection('bookings')
    

    app.post('/advertised-products', async(req, res) => {
       const product = req.body
       const result = await advertisedProductsCollection.insertOne(product)
       res.send(result)
    })
    app.get('/advertised-products', async(req, res) => {
       const query = {}
       const products = await advertisedProductsCollection.find(query).toArray()
       res.send(products)
    })

    app.get('/product-categories', async(req, res) => {
       const query = {}
       const categories = await categoriesCollection.find(query).toArray()
       res.send(categories)
    })
    
    app.get('/category/:id', async(req, res) => {
      const id = req.params.id
      const filter = {_id: ObjectId(id)}
      const result = await categoriesCollection.findOne(filter)
      res.send(result)
    })
    //-----Products Collection api
    app.post('/products', async(req, res) => {
       const product = req.body
       console.log(product)
       const result = await productsCollection.insertOne(product)
       res.send(result)
    })
    app.get('/products', async(req, res) => {
       const categoryName = req.query.categoryName
       const query = {category_name: categoryName}
       const result = await productsCollection.find(query).toArray()
       res.send(result)
    })
    app.get('/myProducts', async(req, res) => {
       const sellerName = req.query.sellerName
       const query = {seller_name: sellerName} 
       const result = await productsCollection.find(query).toArray()
       res.send(result)
    })
    app.delete('/products/:id', async(req, res) => {
       const id = req.params.id
       const filter = {_id: ObjectId(id)}
       const result = await productsCollection.deleteOne(filter)
       res.send(result)
    })
   //  app.put('/products/:name', async(req, res) => {
   //     const productName = req.params.name
   //     const filter = {productName: productName}
   //     const bookedProduct = await bookingsCollection.findOne(filter)

   //     if(!bookedProduct){
   //        return;
   //     }
   //     const option = {upsert: true}
   //     const updatedDoc = {
   //        $set: {
   //           status: 'Booked'
   //        }
   //     }
   //     const result = await productsCollection.updateOne(filter, updatedDoc, option)
   //     res.send(result)
   //  })
    

    app.post('/users', async(req, res) => {
       const user = req.body
       const email = req.query.email 
       const query = {email: email}
       const alredySavedUser = await usersCollection.find(query).toArray()
       if(alredySavedUser.length){
          return res.send({acknowledged: false});
       }
       const result = await usersCollection.insertOne(user)
       res.send(result)
    })
    app.get('/users', async(req, res) => {
       const email = req.query.email
       const query = {email: email}
       const user = await usersCollection.findOne(query)
       res.send(user)
    })
    app.get('/allBuyers', async(req, res) => {
       const query = {role: 'Buyer'}
       const result = await usersCollection.find(query).toArray()
       res.send(result)
    })
    app.get('/allSellers', async(req, res) => {
       const query = {role: 'Seller'}
       const result = await usersCollection.find(query).toArray()
       res.send(result)
    })
    app.delete('/users/:id', async(req, res) => {
       const id = req.params.id
       const filter = {_id: ObjectId(id)}
       const result = await usersCollection.deleteOne(filter)
       res.send(result)
    })    

    app.post('/bookings', async(req, res) => {
       const booking = req.body
       const result = await bookingsCollection.insertOne(booking)
       res.send(result)
    })
    app.get('/bookings', async(req, res) => {
       const email = req.query.email
       const filter = {email: email}
       const result = await bookingsCollection.find(filter).toArray()
       res.send(result)
    })
    app.get('/bookings/:id', async(req, res) => {
       const id = req.params.id
       const filter = {_id: ObjectId(id)}
       const result = await bookingsCollection.findOne(filter)
       res.send(result)
    })

    app.post('/create-payment-intent', async(req, res) => {
       const product = req.body;
       const price = product.resellPrice;
       const amount = price * 100

       const paymentIntent = await stripe.paymentIntents.create({
          currency: 'usd',
          amount: amount,
          "payment_method_types": [
            "card"
          ], 
       })
       res.send({
          clientSecret: paymentIntent.client_secret,
       });
    })

  }
  finally{}
}

run()
.catch(error => console.log(error))

app.get('/', (req, res) => {
  res.send('Bike ReSale Server running')
})
app.listen(port, () => {
  console.log('Bike ReSale Server running on:', port)
})