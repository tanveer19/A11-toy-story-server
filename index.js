const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3nmy0xp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const toyCollection = client.db("A11-toys").collection("toys");
    const postToyCollection = client.db("A11-toys").collection("postToy");

    app.get("/toys", async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // show all toys in shop page

    app.get("/alltoys/:text", async (req, res) => {
      console.log(req.params.text);
      if (
        req.params.text == "sports" ||
        req.params.text == "truck" ||
        req.params.text == "police"
      ) {
        const result = await postToyCollection
          .find({ subCategory: req.params.text })
          .toArray();
        console.log(result);
        return res.send(result);
      }
      const result = await postToyCollection.find({}).toArray();
      res.send(result);
    });

    //show data in alltoys page

    app.get("/alltoys", async (req, res) => {
      const result = await postToyCollection.find({}).toArray();
      res.send(result);
    });

    // app.get("/mytoys/:email", async (req, res) => {
    //   console.log(req.params.email);
    //   const result = await toyCollection
    //     .find({ sellerEmail: req.params.email })
    //     .toArray();
    //   res.send(result);
    // });

    // sending data to server

    app.post("/postToy", async (req, res) => {
      const body = req.body;

      // validating body

      if (!body) {
        return res.status(404).send({ message: "body data not found" });
      }
      const result = await postToyCollection.insertOne(body);
      console.log(result);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("toy running");
});

app.listen(port, () => {
  console.log(`toy running on port ${port}`);
});
