import mongoose from "mongoose";

let connected = false;
const MONGODB_URI = process.env.MONGODB_URI;

export async function connectMongo() {
  if (connected) return;
  await mongoose.connect(MONGODB_URI);
  connected = true;
}
