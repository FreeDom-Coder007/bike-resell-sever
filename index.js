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

function verifyJWT(req, res, next){

   const authHeader = req.headers.authorization
   if(!authHeader){
      return res.status(401).send('unauthorized access')
   }
   const token = authHeader.split(' ')[1]

   jwt.verify(token, process.env.JWT_ACCESS_KEY, function(err, decoded){
      if(err){
         return res.status(401).send({message: 'forbidden access'})
      }
      req.decoded = decoded
      next()
   })

}

async function run(){
  try{
    const advertisedProductsCollection = client.db('bikeReSale').collection('advertisedProducts')
    const categoriesCollection = client.db('bikeReSale').collection('categories')
    const productsCollection = client.db('bikeReSale').collection('products')
    const reportedProductsCollection = client.db('bikeReSale').collection('reportedProdcuts')
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

    // Reported Products api
    app.post('/reported-products', async(req, res) => {
       const product = req.body
       const result = await reportedProductsCollection.insertOne(product)
       res.send(result)
    })
    app.get('/reported-products', async(req, res) => {
       const query = {} 
       const result = await reportedProductsCollection.find(query).toArray()
       res.send(result)
    })
    app.delete('/reportedProducts/:name', async(req, res) => {
       const productName = req.params.name
       const filter = {product_name: productName}
       const result = await reportedProductsCollection.deleteOne(filter)
       res.send(result)
    })
    app.delete('/reported-products/:name', async(req, res) => {
       const productName = req.params.name
       const filter = {product_name: productName}
       const result = await productsCollection.deleteOne(filter)
       res.send(result)
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
    

    //-------- Users API
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
    app.get('/users/:email', async(req, res) => {
       const email = req.params.email
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
    app.get('/bookings', verifyJWT, async(req, res) => {
       const email = req.query.email
       const decodedEmail = req.decoded.email

       if(!decodedEmail){
         return res.status(403).send({message: 'forbidden access'})
       }

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
    app.delete('/bookings/:id', async(req, res) => {
       const id = req.params.id
       const filter = {_id: ObjectId(id)}
       const result = await bookingsCollection.deleteOne(filter)
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

    app.get('/jwt', async(req, res) => {
      const email = req.query.email
      const query = {email: email}
      const user = await usersCollection.findOne(query)
      if(user){
         const token = jwt.sign({email}, process.env.JWT_ACCESS_KEY, {expiresIn: '2h'})
         res.send({accessToken: token}) 
      }
      res.status(401).send('Unathorized access')
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