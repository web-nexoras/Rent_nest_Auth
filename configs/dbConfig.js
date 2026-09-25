const mongoose = require("mongoose");

const dbConfig = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((err) => {
      console.log(`Database connection failed: ${err}`);
    });
};

module.exports = dbConfig;