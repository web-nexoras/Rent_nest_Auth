require("dotenv").config();
const express = require("express");
const router = require("./routes");
const cookieParser = require("cookie-parser");
const dbConfig = require("./configs/dbConfig");
const { errorHandler } = require("./middlewares/errorHandler");
const { sendMonthlyRentReminders } = require("./helpers/reminders/rentReminderService");
const unitSchema = require("./models/unitSchema");
const { generateStandardBuildingUnits } = require("./helpers/units/unitGenerator");

const cors = require("cors");
const PORT = process.env.PORT || 8000;

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === "null" || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const error = new Error("Not allowed by CORS");
      error.statusCode = 403;
      return callback(error);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(router);

app.use(errorHandler);

dbConfig().then(async (connected) => {
  if (!connected) return;

  // Auto-initialize the 48 standard building units (Floors A–L) if the database has 0 units
  try {
    const unitCount = await unitSchema.countDocuments({});
    if (unitCount === 0) {
      const blueprint = generateStandardBuildingUnits();
      await unitSchema.insertMany(blueprint, { ordered: false });
      console.log(`Initialized ${blueprint.length} standard building units (A-101 to L-1204)`);
    }
  } catch (err) {
    console.error("Building unit auto-seed check failed:", err.message);
  }

  let lastRunDate = "";
  const reminderHour = Number(process.env.RENT_REMINDER_HOUR ?? 9);
  setInterval(() => {
    const now = new Date();
    const date = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    if (now.getHours() !== reminderHour || lastRunDate === date) return;
    lastRunDate = date;
    sendMonthlyRentReminders().catch((error) =>
      console.error("Rent reminder job failed:", error.message),
    );
  }, 60 * 1000);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
