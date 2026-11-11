const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("../configs/swaggerConfig");
const router = express.Router();

const baseUrl = process.env.BASE_URL || "/api/v1";
const authRoutes = require("./authRoute");
const noticeRoutes = require("./noticeRoute");
const unitRoutes = require("./unitRoute");
const paymentRoutes = require("./paymentRoute");
const maintenanceRoutes = require("./maintenanceRoute");
const dashboardRoutes = require("./dashboardRoute");

const swaggerUiOptions = {
  customSiteTitle: "Rent Nest API — Interactive Swagger Docs",
  customCss: `.swagger-ui .topbar { background-color: #0B1120; }`,
  swaggerOptions: {
    persistAuthorization: true,
    withCredentials: true,
  },
};

// Interactive Swagger UI & raw OpenAPI JSON spec
router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
router.use(`${baseUrl}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
router.get("/api-docs.json", (req, res) => res.status(200).json(swaggerSpec));
router.get(`${baseUrl}/docs.json`, (req, res) => res.status(200).json(swaggerSpec));

const health = (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  return res.status(dbReady ? 200 : 503).json({
    success: dbReady,
    message: dbReady ? "Rent Nest API is running" : "Database is not connected",
    docs: `/api-docs`,
  });
};

router.get("/health", health);
router.get(`${baseUrl}/health`, health);

// Keep database-backed routes from entering Mongoose's query buffer while
// Atlas is disconnected. Health and documentation routes remain available.
router.use(baseUrl, (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  return res.status(503).json({
    success: false,
    message: "Database is unavailable. Please try again shortly.",
  });
});

router.use(baseUrl, authRoutes);
router.use(baseUrl, noticeRoutes);
router.use(baseUrl, unitRoutes);
router.use(baseUrl, paymentRoutes);
router.use(baseUrl, maintenanceRoutes);
router.use(baseUrl, dashboardRoutes);

router.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = router;
