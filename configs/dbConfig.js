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

// /api/v1
// mongodb+srv://data_base:3wDDBqJpF4B8NAZW@cluster0.mjewgzf.mongodb.net/users?appName=Cluster0

// mahirthecoder.bd@gmail.com
// acggrmko tyze jshm

// db21zycb0
// 475217717918117
// m4cCnshRQZYdfEX_sR_m7FJAedY

