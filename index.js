const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

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

    const postToyCollection = client.db("A11-toys").collection("postToy");

    app.get("/toys", async (req, res) => {
      const cursor = postToyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You are successfully connected to MongoDB!"
    );

    // search toys

    // Creating index on two fields

    // const indexKeys = { name: 1 };

    // Replace field1 and field2 with your actual field names

    // const indexOptions = { name: "nameToys" };

    // Replace index_name with the desired index name

    // const result = await postToyCollection.createIndex(indexKeys, indexOptions);

    app.get("/toySearchByTitle/:text", async (req, res) => {
      const searchText = req.params.text;

      const result = await postToyCollection
        .find({
          $or: [
            { name: { $regex: searchText, $options: "i" } },

            // to search for sellername field, you can add this
            // { sellerName: { $regex: searchText, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });

    //show data in alltoys page

    app.get("/alltoys", async (req, res) => {
      // Set a default limit of 20 if not specified
      const limit = parseInt(req.query.limit) || 20;
      const result = await postToyCollection
        .find({})
        .sort({ price: -1 })
        .limit(limit)
        .toArray();
      res.send(result);
    });

    //show data in mytoys page based on email

    app.get("/mytoys", async (req, res) => {
      // console.log(req.query.sellerEmail);
      let query = {};
      if (req.query?.sellerEmail) {
        query = { sellerEmail: req.query.sellerEmail };
      }
      const result = await postToyCollection.find(query).toArray();
      res.send(result);
    });

    // show all toys in shop page

    app.get("/alltoys/:text", async (req, res) => {
      // console.log(req.params.text);
      if (
        req.params.text == "sports" ||
        req.params.text == "truck" ||
        req.params.text == "police"
      ) {
        const result = await postToyCollection
          .find({ subCategory: req.params.text })
          .sort({ createdAt: -1 })
          .toArray();
        // console.log(result);
        return res.send(result);
      }
      const result = await postToyCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // sending data to server

    app.post("/postToy", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      // validating body

      if (!body) {
        return res.status(404).send({ message: "body data not found" });
      }
      const result = await postToyCollection.insertOne(body);
      res.send(result);
    });

    // update using modal

    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          sellerName: body.sellerName,
          name: body.name,
          price: body.price,
          rating: body.rating,
          quantity: body.quantity,
          description: body.description,
          subCategory: body.subCategory,
          URL: body.URL,
        },
      };
      const result = await postToyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // delete toy

    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await postToyCollection.deleteOne(query);
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
