const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/borne";
    const isAtlas = uri.includes("mongodb+srv") || uri.includes("mongodb.net");

    try {
        const opts = {};
        if (isAtlas) {
            opts.retryWrites = true;
            opts.w = "majority";
        }

        const conn = await mongoose.connect(uri, opts);
        const host = conn.connection.host;
        console.log(`MongoDB connected: ${host}${isAtlas ? " (Atlas)" : ""}`);
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
