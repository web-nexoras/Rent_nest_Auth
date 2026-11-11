const mongoose = require("mongoose");

const dbConfig = async () => {
  if (!process.env.DB_URL) {
    console.error("Database connection failed: DB_URL is not configured");
    return false;
  }

  try {
    await mongoose.connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("Database connected successfully");
    return true;
  } catch (err) {
    // Avoid printing the connection string, which may contain credentials.
    console.error(`Database connection failed (${err.name}): ${err.message}`);
    const servers = err.reason?.servers;
    if (servers && typeof servers.values === "function") {
      for (const server of servers.values()) {
        const cause = server.error;
        if (cause) {
          console.error(
            `MongoDB server detail (${cause.name || "Error"}${cause.code ? `, ${cause.code}` : ""}): ${cause.message}`,
          );
        }
      }
    }
    return false;
  }
};

module.exports = dbConfig;
