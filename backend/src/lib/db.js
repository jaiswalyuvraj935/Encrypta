import mongoose from "mongoose";

export const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error("MongoDB connection failed: MONGO_URI is not defined in the environment.");
        return;
    }

    try {
        const con = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log(`Connected to MongoDB: ${con.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
};