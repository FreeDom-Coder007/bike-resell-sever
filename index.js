const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()

//Middle Wares
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.BIKE_RESALE_USER}:${process.env.BIKE_RESALE_PASSWORD}@cluster0.gijesb3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){

}

run()
.catch(error => console.log(error))

app.get('/', (req, res) => {
  res.send('Bike ReSale Server running')
})
app.listen(port, () => {
  console.log('Bike ReSale Server running on:', port)
})