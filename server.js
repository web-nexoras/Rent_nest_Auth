require("dotenv").config();

const express = require("express");
const router = require("./routes");
const cookieParser = require("cookie-parser");
const dbConfig = require("./configs/dbConfig");
const { errorHandler } = require("./middlewares/errorHandler");

const cors = require("cors");
const PORT = process.env.PORT || 8000;

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
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});
app.use(errorHandler);

dbConfig();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
