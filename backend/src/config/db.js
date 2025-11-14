const mongoose = require('mongoose');

async function connectDB() {
    try {
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in the environment variables');
      }  

      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB Connected Successfully!")
    } catch (error) {
      console.error("MongoDB Connection Error: ", error.message);
      process.exit(1);
    }
}

module.exports = { connectDB };

