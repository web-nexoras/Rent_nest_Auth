const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const requiredEnvVars = ["DB_URL", "JWT_SEC", "CLIENT_URL"];
const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  console.error("Add them to the project .env file and restart the server.");
  process.exit(1);
}

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

app.use(errorHandler);

dbConfig();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
