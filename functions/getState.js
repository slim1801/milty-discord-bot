import { dbClient } from "../db.js";

export const getState = async (threadId) => {
  const collection = dbClient.db("milty-draft").collection("draft");

  const store = await collection.findOne({ threadId: { $eq: threadId } });

  return { collection, store };
};
