# Rent Nest — Commercial Property & Rental Management Backend API

**Rent Nest** is an enterprise-grade, domain-driven REST API built with **Node.js, Express 5, MongoDB (Mongoose), Redis (`ioredis`), and SSLCommerz**. It powers a dual-portal SaaS platform for **Property Administrators (Landlords)** and **Residents (Tenants)**.

---

## 1. Complete Project & Business Flow

### A. 48-Unit Building Architecture (`A-101` to `L-1204`)
The building is structured across **12 Floors (`Floor A` through `Floor L`)** with **4 tiered units per floor (`48 units total`)**. When the server starts on an empty database (or when the Admin clicks **"Initialize Building Units"** via `POST /api/v1/unit/seed-building`), all 48 units are automatically created with realistic sizes and fixed monthly rents:

| Unit Slot | Unit Category | Size (`Sqft`) | Bedrooms | Fixed Base Rent (`BDT`) | Floor Premium |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`-01`** *(e.g. `A-101`, `B-201`)* | **Corner Family Suite** | `1,650 sqft` | 3 Bed | `৳28,000 / mo` | `+৳500` (Floors E–H), `+৳1,000` (Floors I–L) |
| **`-02`** *(e.g. `A-102`, `B-202`)* | **Standard Family Residence** | `1,350 sqft` | 3 Bed | `৳22,000 / mo` | `+৳500` (Floors E–H), `+৳1,000` (Floors I–L) |
| **`-03`** *(e.g. `A-103`, `B-203`)* | **Executive Couple Suite** | `1,050 sqft` | 2 Bed | `৳16,500 / mo` | `+৳500` (Floors E–H), `+৳1,000` (Floors I–L) |
| **`-04`** *(e.g. `A-104`, `B-204`)* | **Compact Urban Studio** | `800 sqft` | 2 Bed | `৳12,500 / mo` | `+৳500` (Floors E–H), `+৳1,000` (Floors I–L) |

---

### B. Hybrid Admin-Controlled Onboarding Flow (Model 2)
Rent Nest supports two secure onboarding workflows so random visitors can never access private building data without administrator authorization:

```text
[PATH 1: Admin Direct Onboarding]
Admin opens Dashboard / Units Page
       ↓
Clicks "Add Tenant" (Enters Name, Email, Phone, Password & selects a Vacant Flat e.g. A-101)
       ↓
POST /api/v1/admin/tenants/create
       ↓
Account is created as Verified + Approved & Unit A-101 becomes Occupied immediately
       ↓
Welcome Email with login credentials is sent to the Tenant
       ↓
Tenant signs in with Email OR Phone Number → Full Dashboard Unlocked!

[PATH 2: Self-Signup + Admin Approval]
Tenant signs up (/api/v1/auth/signup) → Verifies 4-digit Email OTP (/api/v1/auth/verify-otp)
       ↓
Tenant can sign in, but business routes are gated by `requireApproved` (Pending Status Screen)
       ↓
Admin reviews pending tenant → Approves & assigns a Vacant Flat (/api/v1/admin/tenants/:id/approval)
       ↓
Tenant Dashboard & Fixed-Rent Billing Unlocked!
```

- **Full Admin Override (`PATCH /api/v1/admin/tenants/:id`):** The administrator can edit any tenant's name, email, phone number, NID, occupation, address, reset their password, or move/reassign them to a different flat at any time.

---

### C. Strict Dual Sign-In (Email OR Phone Number + Hard Regex + 6-Char Gate)
- **Dual Identifier (`POST /api/v1/auth/signin`):** Users can sign in using **either their Email address OR their Phone number** (`017XXXXXXXX` / `+88017XXXXXXXX`), paired with their password.
- **Hard Regex Validation (`helpers/auth/authUtils.js`):**
  - **Email Regex:** Blocks malformed emails, consecutive dots, and invalid TLDs.
  - **Phone Regex:** Validates Bangladesh mobile operators (`013`–`019`) and international E.164 numbers, normalizing phone formats automatically.
  - **Password Gate:** Minimum 6 characters enforced on both frontend (submit button remains locked until valid) and backend.

---

### D. Fixed Rent Enforcement & SSLCommerz Online Payment Flow
1. **Strict Rent Lock:** Every flat has a fixed `rentAmount`. When a tenant pays rent (`POST /api/v1/payment/submit` or `POST /api/v1/payment/ssl/init`), the backend **ignores any client-supplied amount** and strictly locks the payment amount to `unit.rentAmount` from the database.
2. **Assignment-based Billing:** Each unit stores the month it was assigned. Tenant payment history and both payment channels start from that month, including the assignment month. Existing occupied units without a stored assignment month use the current month until they are reassigned.
3. **Two Payment Channels:**
   - **Option 1 — Instant Online Payment via SSLCommerz (`POST /api/v1/payment/ssl/init`):**
     - Redirects the tenant to the SSLCommerz Gateway (bKash, Nagad, Rocket, Cards).
     - Upon completion (`POST /api/v1/payments/subscription/success`), the backend validates the transaction, **automatically marks the payment as `verified`**, emails the official receipt, invalidates the Redis cache, and redirects the tenant back to their payment receipt.
   - **Option 2 — Manual / Cash Submission (`POST /api/v1/payment/submit`):**
     - After completing the bank/mobile transfer, the tenant submits its transaction reference (or submits Cash without one). Payment starts as `pending` until the Admin clicks **Verify** (`PATCH /api/v1/payment/verify/:id`).

---

### E. 10th of the Month Overdue Rule & 2-Stage Smart Reminder Engine
```text
Day 1 to Due Day (Default Day 5)  ──► Status: "Due" (Normal billing window)
After Due Day (Day 6 to Day 10)   ──► Stage 1 Alert: 1st Gentle Due Alert sent (Email + In-App Banner)
After 10th of Month (Day 11+)     ──► Stage 2 OVERDUE: Flat is marked OVERDUE (Red Badge)
                                      Automated daily reminders + Admin 1-Click "Send Reminder" button
```
- **Live Building Matrix (`GET /api/v1/unit/status-matrix`):** Shows the real-time status of all 48 flats—how many are **Vacant**, **Paid (Verified)**, **Pending Verification**, **Due**, or **Overdue (Past 10th)**, along with how many reminders (`reminderCount`) have been sent to each tenant.

---

### F. High-Speed Redis Caching Layer (`configs/redisConfig.js` & `middlewares/redisCache.js`)
```text
GET Request ──► Redis Cache Check (`rn:<namespace>:<user>:<url>`)
                   ├── HIT  ──► Returns JSON in <5ms (`X-Cache: HIT`)
                   └── MISS ──► Queries MongoDB ──► Stores in Redis with TTL (`X-Cache: MISS`)

POST / PUT / PATCH / DELETE ──► `clearCacheOnSuccess()` automatically purges affected namespaces!
```
- If `REDIS_URL` is configured in `.env`, it connects via `ioredis`. If Redis is unavailable locally, it transparently falls back to an in-memory TTL store so the server never crashes.

---

## 2. Domain-Driven Folder Structure

Every feature domain (`auth`, `dashboard`, `tenants`, `units`, `payments`, `maintenance`, `notice`) is isolated in its own directory:

```text
Rent_nest_Auth/
├── configs/
│   ├── cloudinary.js               # Cloudinary configuration
│   ├── dbConfig.js                 # MongoDB Atlas connection
│   ├── redisConfig.js              # ioredis client + automatic memory fallback
│   └── swaggerConfig.js            # OpenAPI 3.0.3 specification (Swagger UI)
│
├── middlewares/
│   ├── adminOnly.js                # Admin role guard
│   ├── asyncHandler.js             # Async controller wrapper
│   ├── authMiddleware.js           # JWT cookie verifier
│   ├── checkActive.js              # Active account guard
│   ├── errorHandler.js             # Centralized error handler
│   ├── rateLimit.js                # Auth rate limiter
│   ├── redisCache.js               # Read-through cacheGet() & clearCacheOnSuccess()
│   └── requireApproved.js          # Approved tenant guard
│
├── models/
│   ├── authSchema.js               # User (Admin & Tenant) schema
│   ├── unitSchema.js               # Rental Unit schema
│   ├── paymentSchema.js            # Payment & SSLCommerz transaction schema
│   ├── rentReminderSchema.js       # 2-stage Due Alert & Overdue Reminder tracking schema
│   ├── maintenanceSchema.js        # Maintenance request schema
│   └── noticeSchema.js             # Building notice & comments schema
│
├── helpers/
│   ├── auth/
│   │   ├── authUtils.js            # Strict Email/Phone Regex, OTP, JWT & hash helpers
│   │   └── cookies.js              # HTTP-only cookie options
│   ├── units/
│   │   └── unitGenerator.js        # 48-Unit Building Blueprint (Floors A–L)
│   ├── sslcommerz/
│   │   └── sslCommerzService.js    # SSLCommerz Session Init & Validation API helper
│   ├── reminders/
│   │   └── rentReminderService.js  # Automated & manual rent reminder service
│   ├── email/
│   │   ├── emailTemp.js            # HTML email templates
│   │   └── mailService.js          # Nodemailer transport
│   ├── cloudinary/
│   │   └── cloudinaryUtils.js      # Cloudinary upload/delete helpers
│   ├── month.js                    # YYYY-MM utilities
│   ├── numbers.js                  # Numeric validation helper
│   ├── pagination.js               # Query pagination helper
│   └── upload.js                   # Multer memory upload config
│
├── controllers/
│   ├── auth/                       # SignUp, VerifyOTP, SignIn (Email/Phone), Forgot/Reset, Profile
│   ├── dashboard/                  # Admin (`dashboardStats.js`) & Tenant (`dashboardSummary.js`)
│   ├── tenants/                    # Admin Tenant CRUD (`createTenantByAdmin`, `updateTenantByAdmin`, etc.)
│   ├── units/                      # Unit CRUD, `seedBuildingUnits`, `getUnitStatusMatrix`, `assignTenant`
│   ├── payments/                   # Fixed-rent `submitPayment`, `sslcommerz/`, `sendRentReminder`, Reports
│   ├── maintenance/                # Admin & Tenant Maintenance controllers
│   └── notice/                     # Building Notices & Comments controllers
│
├── routes/
│   ├── index.js                    # Mounts Swagger UI (`/api-docs`) + all domain routers
│   ├── authRoute/
│   ├── dashboardRoute/
│   ├── unitRoute/
│   ├── paymentRoute/
│   ├── maintenanceRoute/
│   └── noticeRoute/
│
├── .env.example
├── package.json
└── server.js
```

---

## 3. Interactive Swagger API Documentation

Start the backend server and open Swagger UI in your browser to inspect schemas and test all 48 endpoints interactively:

- **Swagger UI:** `http://localhost:5000/api-docs` (or `http://localhost:5000/api/v1/docs`)
- **OpenAPI JSON Spec:** `http://localhost:5000/api-docs.json`

---

## 4. Endpoint-to-Frontend Page Mapping

| Domain | Endpoint (`BASE_URL=/api/v1`) | Controller | Frontend Page |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST /auth/signin` | `controllers/auth/SignIn.js` | `LoginPage.jsx` *(Email or Phone + 6-char gate)* |
| **Auth** | `POST /auth/signup` | `controllers/auth/signUp.js` | `SignupPage.jsx` |
| **Auth** | `POST /auth/verify-otp` | `controllers/auth/verifyOtp.js` | `VerifyOtpPage.jsx` |
| **Auth** | `GET /auth/get-profile` & `PUT /auth/update-profile` | `controllers/auth/getProfile.js` | `ProfilePage.jsx` |
| **Dashboard** | `GET /admin` | `controllers/dashboard/admin/dashboardStats.js` | `AdminDashboardPage.jsx` |
| **Dashboard** | `GET /admin/tenant` | `controllers/dashboard/tenant/dashboardSummary.js` | `TenantDashboardPage.jsx` |
| **Tenants** | `GET /admin/tenants` | `controllers/tenants/getAllTenants.js` | `AdminTenantsPage.jsx` |
| **Tenants** | `POST /admin/tenants/create` | `controllers/tenants/createTenantByAdmin.js` | `AdminTenantsPage.jsx` / `AdminUnitsPage.jsx` |
| **Tenants** | `PATCH /admin/tenants/:id` | `controllers/tenants/updateTenantByAdmin.js` | `AdminTenantsPage.jsx` *(Full Edit & Flat Move)* |
| **Tenants** | `PATCH /admin/tenants/:id/approval` | `controllers/tenants/updateApprovalStatus.js` | `AdminTenantsPage.jsx` |
| **Units** | `POST /unit/seed-building` | `controllers/units/seedBuildingUnits.js` | `AdminUnitsPage.jsx` *(48-Unit Generator)* |
| **Units** | `GET /unit/status-matrix` | `controllers/units/getUnitStatusMatrix.js` | `AdminDashboardPage.jsx` / `AdminUnitsPage.jsx` |
| **Units** | `GET /unit/all-unit` | `controllers/units/getAllUnits.js` | `AdminUnitsPage.jsx` |
| **Units** | `GET /unit/my-unit` | `controllers/units/getMyUnit.js` | `TenantUnitPage.jsx` |
| **Payments** | `POST /payment/ssl/init` | `controllers/payments/sslcommerz/initSslPayment.js` | `TenantPaymentsPage.jsx` / `TenantDashboardPage.jsx` |
| **Payments** | `POST /payment/submit` | `controllers/payments/submitPayment.js` | `TenantPaymentsPage.jsx` *(Fixed Rent Locked)* |
| **Payments** | `GET /payment/my-payments` & `GET /payment/receipt/:id` | `controllers/payments/getMyPayments.js` | `TenantPaymentsPage.jsx` |
| **Payments** | `GET /payment/all-payments` & `PATCH /payment/verify/:id` | `controllers/payments/getAllPayments.js` | `AdminPaymentsPage.jsx` |
| **Payments** | `GET /payment/monthly-report` & `GET /payment/overdue` | `controllers/payments/getMonthlyReport.js` | `AdminReportsPage.jsx` |
| **Payments** | `POST /payment/remind/:tenantId` & `POST /payment/remind-all` | `controllers/payments/sendRentReminder.js` | `AdminDashboardPage.jsx` / `AdminReportsPage.jsx` |
| **Maintenance** | `POST /maintenance/create` & `GET /maintenance/getmy` | `controllers/maintenance/getMyMaintenance.js` | `TenantMaintenancePage.jsx` |
| **Maintenance** | `GET /maintenance/getall` & `PATCH /maintenance/update/:id` | `controllers/maintenance/getAllMaintenance.js` | `AdminMaintenancePage.jsx` |
| **Notices** | `GET /notice/getall` & `POST /notice/create` | `controllers/notice/getAllNotices.js` | `NoticesPage.jsx` |
| **Notices** | `GET /notice/single/:id` & `POST /notice/comment/:id` | `controllers/notice/singleNotice.js` | `NoticeDetailPage.jsx` |

---

## 5. Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (.env)
cp .env.example .env

# 3. Run server in development mode
npm run dev
```
