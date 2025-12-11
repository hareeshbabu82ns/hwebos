import mongoose from "mongoose";

export const connectDB = async () => {
  // Prefer provided MONGODB_URI, otherwise use the Docker Compose service hostname 'mongodb'
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://mongodb:27017/hmac";
  console.log("MONGODB env value:", process.env.MONGODB_URI);
  const maxAttempts = 10;
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      console.log("Attempting to connect to MongoDB with URI:", uri);
      await mongoose.connect(uri);
      console.log("MongoDB connected");
      return;
    } catch (error) {
      attempt++;
      console.error(
        `MongoDB connection attempt ${attempt}/${maxAttempts} failed:`,
        error instanceof Error ? error.message : String(error)
      );
      if (attempt >= maxAttempts) {
        console.error(
          "MongoDB connection error: max attempts reached, exiting."
        );
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};
