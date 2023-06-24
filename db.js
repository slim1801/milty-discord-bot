import { MongoClient, ServerApiVersion } from "mongodb";

const mondoDBPwd = process.env.MONGO_DB_PWD;

const uri = `mongodb+srv://slim:${mondoDBPwd}@cluster0.tcjvsxo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const dbClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function run() {
  try {
    await dbClient.connect();

    await dbClient.db("milty-draft").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch {
    await dbClient.close();
  }
}
