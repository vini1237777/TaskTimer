import mongoose from "mongoose";
import { MONGODB_URI } from "$env/static/private";

let connected = false;

export async function connectMongo() {
  if (connected) return;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing.");
  }

  await mongoose.connect(MONGODB_URI);
  connected = true;
}
