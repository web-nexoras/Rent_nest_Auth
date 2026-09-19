require("dotenv").config();

const express = require("express");
const router = require("./routes");
const cookieParser = require("cookie-parser");
const dbConfig = require("./configs/dbConfig");
const { errorHandler } = require("./middlewares/errorHandler");

const PORT = process.env.PORT || 8000;

const dns = require("dns");
const cors = require("cors");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();


app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(router);
app.use(errorHandler);

dbConfig();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});