import mongoose from "mongoose";
import { MONGODB_URI } from "$env/static/private";

let connected = false;

export async function connectMongo() {
  if (connected) return;
  await mongoose.connect(MONGODB_URI);
  connected = true;
}
