# 🏠 Rent Nest — Backend

A scalable RESTful backend for **Rent Nest**, a property and rental management system built for **Admins and Tenants**.

The backend manages tenant authentication, approval, rental units, rent payments, notices, maintenance requests, and dashboard data through a structured REST API.

> **Core Business Flow:**  
> Tenant Registration → Admin Approval → Unit Assignment → Rent Payment → Admin Verification

---

## 🚀 Overview

**Rent Nest Backend** is designed with a modular MVC-style architecture to keep business logic organized, reusable, and maintainable.

The system provides separate access levels for:

- 👤 **Tenant**
- 🛡️ **Admin**

Tenants can register, manage their profile, view their assigned unit, submit rent payments, read notices, and create maintenance requests.

Admins can approve tenants, manage rental units, verify payments, publish notices, manage maintenance requests, and access system-level dashboard statistics.

---

# 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express.js** | REST API framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |
| **Multer** | File upload handling |
| **Postman** | API testing |
| **Git / GitHub** | Version control |

### Planned / Optional

- Cloudinary / Amazon S3 — file storage
- Docker — containerization
- Cron Jobs — automated tasks
- Email service — notifications and reminders

---

# 🏗️ Project Architecture

The backend follows a modular **MVC-style architecture**.

```text
src/
│
├── config/
│   └── db.js
│
├── models/
│   ├── User.js
│   ├── Unit.js
│   ├── Payment.js
│   ├── Notice.js
│   └── MaintenanceRequest.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── uploadMiddleware.js
│
├── controllers/
│   ├── authController.js
│   ├── unitController.js
│   ├── paymentController.js
│   ├── noticeController.js
│   ├── maintenanceController.js
│   └── dashboardController.js
│
├── routes/
│   ├── authRoutes.js
│   ├── unitRoutes.js
│   ├── paymentRoutes.js
│   ├── noticeRoutes.js
│   ├── maintenanceRoutes.js
│   └── dashboardRoutes.js
│
├── utils/
│   └── generateToken.js
│
└── index.js
```

### Architecture Flow

```text
Request
   ↓
Route
   ↓
Middleware
   ↓
Controller
   ↓
Model
   ↓
MongoDB
   ↓
Response
```

This separation keeps routing, authorization, business logic, and database operations organized.

---

# 🔐 Authentication & Authorization

Rent Nest uses **JWT-based authentication**.

### Authentication Flow

```text
Tenant Registration
        ↓
Account Created
        ↓
Approval Status: pending
        ↓
Admin Reviews Tenant
        ↓
Approved
        ↓
Unit Assigned
        ↓
Tenant Accesses Business Features
```

### Authentication Middleware

#### `protect`

- Verifies JWT
- Authenticates the current user
- Attaches user information to `req.user`

#### `adminOnly`

Allows access only to Admin users.

#### `requireApproved`

Prevents unapproved tenants from accessing protected business features.

Admins automatically pass this middleware.

---

# 👥 User Roles

Rent Nest has two primary roles.

## 👤 Tenant

A tenant can:

- Register an account
- Login
- Manage their profile
- View their assigned unit
- Submit rent payments
- View payment history
- View notices
- Comment on notices
- Submit maintenance requests
- View their own maintenance requests
- View their dashboard summary

## 🛡️ Admin

An admin can:

- Login
- Manage their profile
- View pending tenants
- Approve / reject tenants
- Assign tenants to units
- Manage rental units
- View all payments
- Verify / reject payments
- Manage notices
- View maintenance requests
- Update maintenance status
- View dashboard statistics

---

# 🗄️ Database Models

## 👤 User

Stores Admin and Tenant information.

| Field | Type | Description |
|---|---|---|
| `name` | String | User name |
| `email` | String | Unique email |
| `phone` | String | Contact number |
| `password` | String | Hashed password |
| `role` | Enum | `admin` / `tenant` |
| `approvalStatus` | Enum | `pending` / `approved` / `rejected` |
| `assignedUnit` | ObjectId | Reference to Unit |
| `isActive` | Boolean | Account status |
| `presentAddress` | String | Current address |
| `permanentAddress` | String | Permanent address |
| `nidNumber` | String | National ID |
| `occupation` | String | Occupation |
| `profileImage` | String | Profile image |

---

## 🏠 Unit

Represents a rental unit/property.

| Field | Type | Description |
|---|---|---|
| `unitNumber` | String | Unique unit number |
| `floor` | String | Floor |
| `sizeSqft` | Number | Unit size |
| `bedrooms` | Number | Number of bedrooms |
| `rentAmount` | Number | Monthly rent |
| `status` | Enum | `vacant` / `occupied` |
| `assignedTenant` | ObjectId | Assigned tenant |
| `description` | String | Unit description |
| `images` | Array | Image URLs |
| `createdAt` | Date | Creation date |
| `updatedAt` | Date | Update date |

---

## 💳 Payment

Handles monthly rental payments.

| Field | Type | Description |
|---|---|---|
| `tenant` | ObjectId | Tenant reference |
| `unit` | ObjectId | Unit reference |
| `amount` | Number | Payment amount |
| `month` | String | Rent period, e.g. `2026-09` |
| `transactionId` | String | Transaction reference |
| `paymentMethod` | Enum | bKash / Nagad / Bank / Cash |
| `status` | Enum | pending / verified / rejected |
| `verifiedBy` | ObjectId | Admin reference |
| `paidAt` | Date | Submission date |
| `verifiedAt` | Date | Verification date |

---

## 📢 Notice

Stores notices created by Admins.

| Field | Type | Description |
|---|---|---|
| `title` | String | Notice title |
| `description` | String | Notice content |
| `createdBy` | ObjectId | Admin reference |
| `comments` | Array | Tenant comments |
| `createdAt` | Date | Creation date |
| `updatedAt` | Date | Update date |

---

## 🛠️ MaintenanceRequest

Handles tenant maintenance complaints.

| Field | Type | Description |
|---|---|---|
| `tenant` | ObjectId | Tenant reference |
| `unit` | ObjectId | Unit reference |
| `category` | Enum | plumbing / electrical / gas / other |
| `description` | String | Problem description |
| `images` | Array | Uploaded images |
| `status` | Enum | pending / in-progress / resolved |
| `resolvedAt` | Date | Resolution date |

---

# 🌐 REST API

Base URL:

```text
/api
```

---

## 🔐 Authentication & User API

Base route:

```text
/api/auth
```

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register tenant |
| `POST` | `/login` | Public | Login |
| `GET` | `/me` | Private | Get own profile |
| `PUT` | `/me` | Private | Update own profile |
| `GET` | `/pending` | Admin | Get pending tenants |
| `GET` | `/tenants` | Admin | Get all tenants |
| `PATCH` | `/:id/approval` | Admin | Approve / reject tenant |
| `DELETE` | `/:id` | Admin | Remove tenant |

---

## 🏠 Unit API

Base route:

```text
/api/units
```

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Admin | Create unit |
| `GET` | `/` | Admin | Get all units |
| `GET` | `/:id` | Admin / Tenant | Get unit details |
| `PUT` | `/:id` | Admin | Update unit |
| `DELETE` | `/:id` | Admin | Delete unit |
| `PATCH` | `/:id/assign-tenant` | Admin | Assign tenant |

> Tenant access to unit details should be limited to the tenant's assigned unit.

---

## 💰 Payment API

Base route:

```text
/api/payments
```

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Tenant | Submit payment |
| `GET` | `/my` | Tenant | Get own payment history |
| `GET` | `/` | Admin | Get all payments |
| `PATCH` | `/:id/verify` | Admin | Verify payment |
| `PATCH` | `/:id/reject` | Admin | Reject payment |
| `GET` | `/overdue` | Admin | Get overdue tenants |

---

## 📢 Notice API

Base route:

```text
/api/notices
```

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Admin | Create notice |
| `GET` | `/` | Admin / Tenant | Get all notices |
| `PUT` | `/:id` | Admin | Update notice |
| `DELETE` | `/:id` | Admin | Delete notice |
| `POST` | `/:id/comments` | Tenant | Add comment |

---

## 🛠️ Maintenance API

Base route:

```text
/api/maintenance
```

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Tenant | Create maintenance request |
| `GET` | `/my` | Tenant | Get own requests |
| `GET` | `/` | Admin | Get all requests |
| `PATCH` | `/:id/status` | Admin | Update request status |

### Request Status

```text
pending
   ↓
in-progress
   ↓
resolved
```

---

## 📊 Dashboard API

Base route:

```text
/api/dashboard
```

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin` | Admin | Admin statistics |
| `GET` | `/admin/revenue-trend` | Admin | Revenue trend |
| `GET` | `/tenant` | Tenant | Tenant dashboard summary |

> `revenue-trend` is planned as a **V2 enhancement**; the MVP dashboard focuses on core statistics.

---

# 🔑 Permission Matrix

| Action | Tenant | Admin |
|---|:---:|:---:|
| Register | ✅ | — |
| Login | ✅ | ✅ |
| Manage own profile | ✅ | ✅ |
| View assigned unit | ✅ | ✅ |
| Create units | ❌ | ✅ |
| Update units | ❌ | ✅ |
| Delete units | ❌ | ✅ |
| Submit payment | ✅ | ❌ |
| View own payments | ✅ | ❌ |
| Verify payments | ❌ | ✅ |
| Reject payments | ❌ | ✅ |
| View notices | ✅ | ✅ |
| Create notices | ❌ | ✅ |
| Update notices | ❌ | ✅ |
| Delete notices | ❌ | ✅ |
| Comment on notices | ✅ | — |
| Create maintenance request | ✅ | ❌ |
| View own requests | ✅ | ❌ |
| Manage maintenance | ❌ | ✅ |
| Approve tenants | ❌ | ✅ |
| Assign units | ❌ | ✅ |
| View dashboard | Own | Full |

---

# 🚀 Development Roadmap

The project is divided into **MVP (Version 1)** and **V2 Enhancements**.

This approach keeps development focused on the core rental-management workflow before adding advanced features.

---

## 🟢 MVP — Version 1

### 1. Authentication & Approval

- [x] User model
- [x] Tenant registration
- [x] Login / Logout
- [x] Authentication
- [x] Role-based authorization
- [x] Tenant approval workflow

### 2. Unit Management

- [ ] Unit model
- [ ] Create unit
- [ ] Get units
- [ ] Get unit details
- [ ] Update unit
- [ ] Delete unit
- [ ] Assign tenant

### 3. Payment Management

- [ ] Payment model
- [ ] Submit payment
- [ ] Payment history
- [ ] Verify payment
- [ ] Reject payment
- [ ] Overdue tracking

### 4. Notice Management

- [ ] Notice model
- [ ] Create notice
- [ ] View notices
- [ ] Update notice
- [ ] Delete notice
- [ ] Tenant comments

### 5. Maintenance Management

- [ ] Maintenance model
- [ ] Create request
- [ ] View own requests
- [ ] Admin request management
- [ ] Update request status

### 6. Dashboard

- [ ] Admin statistics
- [ ] Tenant summary
- [ ] Unit statistics
- [ ] Tenant statistics
- [ ] Payment collection summary

### 7. Testing & Deployment

- [ ] Complete Postman testing
- [ ] Error handling review
- [ ] Authorization testing
- [ ] Security review
- [ ] Production deployment

---

# 🔵 V2 — Future Enhancements

After completing and stabilizing the MVP:

### 💳 Payment Enhancements

- [ ] Payment receipt / invoice PDF
- [ ] Rent history export
- [ ] CSV / PDF payment reports

### 🔔 Notifications

- [ ] Email notifications
- [ ] Payment reminders
- [ ] Notice alerts
- [ ] In-app notifications
- [ ] Push notifications

### 📊 Analytics & Reports

- [ ] Revenue trend chart
- [ ] Monthly revenue analytics
- [ ] Advanced reports
- [ ] Excel / PDF export

### 🔎 Advanced Search

- [ ] Advanced search
- [ ] Filtering
- [ ] Sorting
- [ ] Pagination improvements

### 👥 Advanced Administration

- [ ] Multi-admin roles
- [ ] Fine-grained permissions
- [ ] Admin activity tracking
- [ ] Audit logs

### ⚙️ Automation

- [ ] Automated overdue reminders
- [ ] Cron jobs
- [ ] Scheduled email notifications

### 💬 Communication

- [ ] In-app chat
- [ ] Tenant ↔ Admin messaging

---

# 🧭 Development Workflow

Each feature is developed independently using the following workflow:

```text
1. Model
   ↓
2. Controller
   ↓
3. Route
   ↓
4. Middleware / Authorization
   ↓
5. Postman Testing
   ↓
6. Error Handling
   ↓
7. Refactoring
   ↓
8. Next Feature
```

### Development Order

```text
Authentication & Approval
          ↓
Unit Management
          ↓
Payment Management
          ↓
Notice Management
          ↓
Maintenance Management
          ↓
Dashboard
          ↓
Testing & Deployment
          ↓
V2 Enhancements
```

---

# 🧪 API Testing

The API is tested using **Postman**.

Testing includes:

- Authentication
- JWT authorization
- Role permissions
- Tenant approval
- Unit ownership
- Payment submission
- Payment verification
- Notice operations
- Maintenance workflow
- Validation errors
- Unauthorized requests
- Not-found responses
- Server errors

---

# ⚙️ Installation & Setup

## 1. Clone the repository

```bash
git clone <your-repository-url>
```

## 2. Navigate to the backend

```bash
cd rent-nest-backend
```

## 3. Install dependencies

```bash
npm install
```

## 4. Create `.env`

```env
PORT=8000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:3000
```

## 5. Start development server

```bash
npm run dev
```

Server:

```text
http://localhost:8000
```

---

# 🔐 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `CLIENT_URL` | Frontend origin |

> **Never commit `.env` to GitHub.**

Recommended `.gitignore`:

```text
node_modules/
.env
.env.*
```

---

# 🔒 Security

The backend follows several security practices:

- Password hashing with bcrypt
- JWT-based authentication
- Role-based authorization
- Protected routes
- Tenant approval validation
- Request validation
- File upload validation
- Centralized error handling
- Environment-based secrets
- `.env` excluded from version control

---

# 📈 Project Status

### Current Development Phase

```text
Authentication & Approval
        ↓
      DONE
        ↓
Unit Management
        ↓
    NEXT STEP
        ↓
Payment Management
        ↓
Notice Management
        ↓
Maintenance Management
        ↓
Dashboard
        ↓
MVP Complete
        ↓
V2 Enhancements
```

---

# 🎯 Project Goals

The main goals of Rent Nest Backend are to:

- Build a real-world REST API
- Practice scalable backend architecture
- Implement secure authentication
- Implement role-based authorization
- Design relational data using MongoDB references
- Handle real-world rental business logic
- Build maintainable controllers and routes
- Practice API testing
- Prepare the backend for frontend integration
- Develop production-oriented backend development skills

---

# 🔮 Future Vision

Rent Nest is designed to grow beyond the initial MVP.

Future versions can introduce:

- Automated payment reminders
- Digital invoices
- Online payment integrations
- Advanced analytics
- Notification systems
- Reporting
- Multi-admin management
- Tenant communication
- Audit and activity tracking

---

# 👨‍💻 Author

**Web Nexoras**

MERN Stack Developer | Full Stack Developer

> Building modern, scalable, and maintainable web applications.

---

## ⭐ Development Philosophy

> **Build the core. Test it properly. Improve it continuously.**

Rent Nest is developed incrementally with a focus on **clean architecture, secure APIs, maintainable code, real-world business logic, and scalable backend development**.

# Current End-to-End Project Flow

This section describes how the implemented backend currently handles a request from sign-up through everyday tenant and admin tasks. The API prefix defaults to `/api/v1` and can be changed with `BASE_URL`.

## 1. Server startup and request handling

1. `server.js` loads environment variables, configures CORS using `CLIENT_URL`, enables JSON and cookie parsing, mounts the routers, and connects to MongoDB.
2. Requests pass through the router mounted in `routes/index.js`. Feature routers are mounted below the API prefix. Unknown URLs return a JSON 404 response. `/health` and `<BASE_URL>/health` report database readiness.
3. Private endpoints read the access token from the `accTkn` cookie. `authMiddleware` verifies the JWT, loads the current user, and attaches that user to `req.user`. Feature routers also apply `checkActive`; role and approval middleware then enforce each endpoint's access rules.
4. Controllers perform validation and database work through Mongoose models. Errors from async controllers flow to the shared error handler.

## 2. Tenant account lifecycle

1. A tenant creates an account through `POST /auth/signup`. The account starts as a tenant awaiting email OTP verification and admin approval.
2. `POST /auth/verify-otp` verifies the email code. `POST /auth/resend-otp` can send another code when needed. OTP and password reset emails use the mail service.
3. The tenant signs in at `POST /auth/signin`. The access token is stored in an HTTP-only cookie by the authentication flow. `POST /auth/refresh-token` refreshes the session and `POST /auth/log-out` clears it.
4. Admins review pending accounts using `GET /admin/pending`, then approve or reject one with `PATCH /admin/tenants/:id/approval`. Approved tenants can use the business endpoints; inactive accounts are blocked by `checkActive`.
5. Authenticated users can read their profile at `GET /auth/get-profile` and update it at `PUT /auth/update-profile`. Profile image upload uses the shared upload middleware and configured Cloudinary storage.

## 3. Unit and tenant assignment flow

1. Admin creates a unit with `POST /unit/create`, and can browse, update, or delete units with the corresponding `/unit` routes.
2. A unit stores its rent amount, optional unit details, occupancy, and `rentDueDay` (defaults to day 1; values from 1 to 31 are supported).
3. Admin assigns an approved tenant through `PATCH /unit/assign-tenant/:id`. The unit and tenant references are kept in sync. Admin can remove the assignment through `/unit/unassign-tenant/:id`.
4. Tenants view their own assigned unit through `GET /unit/my-unit`; access to unit details is restricted by the controller.

## 4. Rent payment and receipt flow

1. An approved tenant with an assigned unit submits a payment using `POST /payment/submit`. The request includes amount, `YYYY-MM` rent month, payment method, and transaction ID (cash payments can generate an ID).
2. The API prevents a second active submission for the same tenant, unit, and month. A rejected payment can be submitted again for that month.
3. Tenants see their history at `GET /payment/my-payments`. Admins review all submissions at `GET /payment/all-payments`, then verify or reject one with `PATCH /payment/verify/:id` or `/payment/reject/:id`.
4. Verification saves the verifier and timestamp, then sends the tenant a receipt email when email credentials are configured. Tenants can retrieve structured receipt details for their own verified payment at `GET /payment/receipt/:id`.
5. Admins can check unpaid tenants at `GET /payment/overdue?month=YYYY-MM` and see collections, outstanding rent, and status counts at `GET /payment/monthly-report?month=YYYY-MM`.

## 5. Tenant dashboard flow

`GET /admin/tenant` is the current tenant dashboard endpoint. It returns the assigned unit, current month's payment state and amount due, recent payments, count and latest items for maintenance requests, and the five newest notices. If the tenant has no unit yet, the response still includes recent notices and returns empty unit/payment/maintenance summary values.

The dashboard's rent due date is calculated from the unit's `rentDueDay` for the current month. A configured day that does not exist in that month (for example day 31 in February) is clamped to that month's last day. The overdue flag becomes true after that due date has passed and the current month's rent is not verified.

## 6. Notice flow

Admins create, edit, and delete notices. Authenticated users can list and view notices. Approved tenants can add comments; approved users can delete comments subject to the controller's ownership rules. The tenant dashboard shows the five newest notices as a preview.

## 7. Maintenance flow

1. Approved tenants submit a maintenance request with category, description, and optional images through `POST /maintenance/create`.
2. Tenants can list their requests at `/maintenance/getmy`, open a request at `/maintenance/single/:id`, and delete their own pending request.
3. Admins view requests at `/maintenance/getall` and change status at `PATCH /maintenance/update/:id`. Status values are `pending`, `in-progress`, and `resolved`.
4. The tenant dashboard summarizes unresolved request count and the three most recently updated requests.

## 8. Admin dashboard and scheduled rent reminders

Admins use `GET /admin` for unit occupancy, tenant approval, current-month collections, overdue tenant count, pending maintenance, and recent revenue trend. Tenant management routes under `/admin/tenants` support listing, approval, activation, and removal.

The reminder job starts after a successful MongoDB connection. At the hour configured by `RENT_REMINDER_HOUR` (defaults to 9, using the server's local timezone), it checks active approved tenants with an assigned unit. If the tenant has no pending or verified payment for the current month, it sends one reminder email for that tenant and month. A database record prevents duplicate monthly reminders across server restarts. Email delivery requires `EMAIL_USER` and `EMAIL_PASS`.

## 9. Main route prefixes

| Feature | Prefix | Examples |
|---|---|---|
| Authentication and profile | `/auth` | `/auth/signup`, `/auth/get-profile` |
| Notices | `/notice` | `/notice/getall`, `/notice/create` |
| Units | `/unit` | `/unit/my-unit`, `/unit/assign-tenant/:id` |
| Payments | `/payment` | `/payment/submit`, `/payment/monthly-report` |
| Maintenance | `/maintenance` | `/maintenance/create`, `/maintenance/getmy` |
| Admin and tenant dashboard | `/admin` | `/admin`, `/admin/tenant`, `/admin/pending` |

All feature paths above are relative to the configured API prefix, which defaults to `/api/v1`.
