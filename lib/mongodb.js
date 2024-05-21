import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

let dbConnection = null;

export const connectMongoDB = async () => {
    if (dbConnection) {
        console.log("Using existing database connection");
        return dbConnection;
    }

    try {
        dbConnection = await mongoose.connect(MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");
        return dbConnection;
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
        throw error; // Rethrow to handle upstream
    }
}

