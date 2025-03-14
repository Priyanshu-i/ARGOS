const mongoose = require("mongoose");

let isConnected = false; // Track connection status

const connectDB = async () => {
    try {
        if (isConnected) {
            console.log("⚡ Using existing MongoDB connection");
            return;
        }

        const db = await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        isConnected = db.connections[0].readyState;
        console.log(`✅ Connected to MongoDB - Database: ${db.connection.name}`);
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message || error);
        throw new Error("Failed to connect to MongoDB");
    }
};

module.exports = connectDB;
