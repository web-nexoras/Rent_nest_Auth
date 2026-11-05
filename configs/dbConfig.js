const mongoose = require("mongoose");

const dbConfig = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Database connected successfully");
    return true;
  } catch (err) {
    console.log(`Database connection failed: ${err}`);
    return false;
  }
};

module.exports = dbConfig;
