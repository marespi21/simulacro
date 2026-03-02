import mongoose from "mongoose";

export const connectMongo = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/saludplus");

    console.log("MongoDB connected");
  } catch (error) {
    console.error("Mongo connection error:", error);
    process.exit(1);
  }
};