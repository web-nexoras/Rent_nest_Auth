const baseUrl = process.env.BASE_URL || "/api/v1";

const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Rent Nest — Commercial Property & Rental Management API",
    version: "2.0.0",
    description:
      "Enterprise-grade REST API for **Rent Nest** featuring Redis read-through caching, Dual Identifier Auth (Email or Phone + strict regex + 6-char password gate), 48-Unit Building Matrix (`A-101` to `L-1204`), Fixed Unit Rent enforcement, SSLCommerz Online Payment Gateway, and 2-Stage (Due Day + 10th of the Month) Overdue & Reminder Automation.",
    contact: {
      name: "Rent Nest Engineering",
    },
  },
  servers: [
    {
      url: baseUrl,
      description: "API Base Path (Relative — works on any host/port)",
    },
    {
      url: `http://localhost:${process.env.PORT || 5000}${baseUrl}`,
      description: "Local Development Server",
    },
  ],
  tags: [
    { name: "Health", description: "Server & database readiness checks" },
    {
      name: "Auth & Profile",
      description:
        "Sign up, OTP, Email/Phone Sign in, Password Reset & Profile (Frontend: LoginPage, SignupPage, VerifyOtpPage, ProfilePage)",
    },
    {
      name: "Dashboard",
      description:
        "Admin & Tenant Executive Summaries (Frontend: AdminDashboardPage, TenantDashboardPage)",
    },
    {
      name: "Tenants",
      description:
        "Admin Direct Tenant Onboarding, Full Edit, Approval & Status (Frontend: AdminTenantsPage)",
    },
    {
      name: "Units",
      description:
        "48-Unit Building Seeder, Live Flat Matrix & Unit CRUD (Frontend: AdminUnitsPage, TenantUnitPage)",
    },
    {
      name: "Payments & SSLCommerz",
      description:
        "Fixed-Rent Payment Submission, SSLCommerz Gateway, Verification, Overdue & Reminders (Frontend: TenantPaymentsPage, AdminPaymentsPage, AdminReportsPage)",
    },
    {
      name: "Maintenance",
      description:
        "Repair Tickets & Status Tracking (Frontend: TenantMaintenancePage, AdminMaintenancePage)",
    },
    {
      name: "Notices",
      description:
        "Building Announcements & Resident Comments (Frontend: NoticesPage, NoticeDetailPage)",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "accTkn",
        description:
          "HTTP-only JWT access token cookie set automatically by `/auth/signin`",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: {
            type: "string",
            example: "Validation or authorization error message",
          },
        },
      },
      SignInRequest: {
        type: "object",
        required: ["identifier", "password"],
        properties: {
          identifier: {
            type: "string",
            example: "01712345678",
            description:
              "Valid Email address OR Phone number (013-019XXXXXXXX / +8801XXXXXXXXX)",
          },
          password: {
            type: "string",
            minLength: 6,
            example: "password123",
            description: "Minimum 6 characters required",
          },
        },
      },
      SignUpRequest: {
        type: "object",
        required: ["name", "email", "phone", "password"],
        properties: {
          name: {
            type: "string",
            minLength: 3,
            maxLength: 25,
            example: "Rahim Uddin",
          },
          email: {
            type: "string",
            format: "email",
            example: "rahim@gmail.com",
          },
          phone: { type: "string", example: "01712345678" },
          password: { type: "string", minLength: 6, example: "secret123" },
        },
      },
      AdminCreateTenantRequest: {
        type: "object",
        required: ["name", "email", "phone", "password"],
        properties: {
          name: { type: "string", example: "Karim Ahmed" },
          email: {
            type: "string",
            format: "email",
            example: "karim@gmail.com",
          },
          phone: { type: "string", example: "01812345678" },
          password: { type: "string", minLength: 6, example: "welcome123" },
          unitId: {
            type: "string",
            description: "Optional vacant Unit ObjectId to assign immediately",
            example: "672fa91c8e91bc0012a34567",
          },
          nidNumber: { type: "string", example: "1994123456789" },
          occupation: { type: "string", example: "Software Engineer" },
          presentAddress: { type: "string", example: "Uttara, Dhaka" },
          permanentAddress: { type: "string", example: "Sylhet" },
        },
      },
      AdminUpdateTenantRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Karim Ahmed Updated" },
          email: {
            type: "string",
            format: "email",
            example: "karim.new@gmail.com",
          },
          phone: { type: "string", example: "01899887766" },
          password: {
            type: "string",
            minLength: 6,
            description: "Optional: resets tenant password if provided",
          },
          unitId: {
            type: "string",
            nullable: true,
            description:
              "Pass a vacant Unit ID to reassign flat, or empty string to unassign",
          },
          approvalStatus: {
            type: "string",
            enum: ["pending", "approved", "rejected"],
          },
          isActive: { type: "boolean" },
          nidNumber: { type: "string" },
          occupation: { type: "string" },
          presentAddress: { type: "string" },
          permanentAddress: { type: "string" },
        },
      },
      SubmitPaymentRequest: {
        type: "object",
        required: ["month", "paymentMethod"],
        properties: {
          month: {
            type: "string",
            example: "2026-11",
            description: "Billing month in YYYY-MM format",
          },
          paymentMethod: {
            type: "string",
            enum: ["bKash", "Nagad", "Rocket", "Upay", "Bank", "Cash"],
            example: "bKash",
          },
          transactionId: {
            type: "string",
            example: "TRX987654321",
            description:
              "Required for all methods except Cash (Amount is strictly locked to the assigned unit's fixed rent)",
          },
        },
      },
      SslInitRequest: {
        type: "object",
        required: ["month"],
        properties: {
          month: {
            type: "string",
            example: "2026-11",
            description:
              "Billing month in YYYY-MM format (Amount is automatically locked to unit's rentAmount)",
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "API & MongoDB health check",
        responses: {
          200: { description: "API and Database are healthy" },
          503: { description: "Database disconnected" },
        },
      },
    },
    "/auth/signup": {
      post: {
        tags: ["Auth & Profile"],
        summary:
          "Register a new tenant account & start sending a 4-digit OTP email (Page: SignupPage.jsx)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignUpRequest" },
            },
          },
        },
        responses: {
          201: { description: "Account created; verification email is being sent asynchronously" },
          400: {
            description:
              "Validation failed (strict email/phone regex or password < 6 chars)",
          },
          409: { description: "Email or phone already exists" },
        },
      },
    },
    "/auth/verify-otp": {
      post: {
        tags: ["Auth & Profile"],
        summary: "Verify 4-digit email OTP (Page: VerifyOtpPage.jsx)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "otp"],
                properties: {
                  email: { type: "string", example: "rahim@gmail.com" },
                  otp: { type: "string", example: "1234" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Email verified" },
          400: { description: "Invalid or expired OTP" },
        },
      },
    },
    "/auth/resend-otp": {
      post: {
        tags: ["Auth & Profile"],
        summary: "Resend 4-digit verification OTP (Page: VerifyOtpPage.jsx)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string" } },
              },
            },
          },
        },
        responses: { 200: { description: "OTP resent" } },
      },
    },
    "/auth/signin": {
      post: {
        tags: ["Auth & Profile"],
        summary:
          "Sign in using Email OR Phone Number + 6-char password (Page: LoginPage.jsx)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignInRequest" },
            },
          },
        },
        responses: {
          200: {
            description:
              "Sets HTTP-only cookies (accTkn, refTkn) and returns user object",
          },
          400: {
            description:
              "Invalid email/phone format or password < 6 characters",
          },
          401: { description: "Invalid credentials" },
          403: { description: "Email unverified or account inactive" },
        },
      },
    },
    "/auth/forget-password": {
      post: {
        tags: ["Auth & Profile"],
        summary:
          "Send password reset link to email (Page: ForgotPasswordPage.jsx)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string" } },
              },
            },
          },
        },
        responses: {
          200: { description: "Reset email dispatched if account exists" },
        },
      },
    },
    "/auth/reset-password/{token}": {
      patch: {
        tags: ["Auth & Profile"],
        summary: "Reset password with token (Page: ResetPasswordPage.jsx)",
        parameters: [
          {
            name: "token",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["password"],
                properties: { password: { type: "string", minLength: 6 } },
              },
            },
          },
        },
        responses: { 200: { description: "Password reset successful" } },
      },
    },
    "/auth/refresh-token": {
      post: {
        tags: ["Auth & Profile"],
        summary:
          "Silently rotate access token using refTkn cookie (Client: lib/axios.js)",
        responses: { 200: { description: "Access token refreshed" } },
      },
    },
    "/auth/log-out": {
      post: {
        tags: ["Auth & Profile"],
        security: [{ cookieAuth: [] }],
        summary: "Clear auth cookies & sign out (Component: Sidebar / Topbar)",
        responses: { 200: { description: "Logged out" } },
      },
    },
    "/auth/get-profile": {
      get: {
        tags: ["Auth & Profile"],
        security: [{ cookieAuth: [] }],
        summary:
          "Get current authenticated user profile & assigned unit (Page: ProfilePage.jsx)",
        responses: { 200: { description: "Current user profile" } },
      },
    },
    "/auth/update-profile": {
      put: {
        tags: ["Auth & Profile"],
        security: [{ cookieAuth: [] }],
        summary: "Update own profile & avatar image (Page: ProfilePage.jsx)",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  occupation: { type: "string" },
                  nidNumber: { type: "string" },
                  presentAddress: { type: "string" },
                  permanentAddress: { type: "string" },
                  profileImage: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Profile updated" } },
      },
    },
    "/admin": {
      get: {
        tags: ["Dashboard"],
        security: [{ cookieAuth: [] }],
        summary:
          "Admin Executive Dashboard KPIs, Expected vs Collected Revenue & 6-Month Trend [Redis Cached] (Page: AdminDashboardPage.jsx)",
        responses: { 200: { description: "Admin dashboard metrics" } },
      },
    },
    "/admin/tenant": {
      get: {
        tags: ["Dashboard"],
        security: [{ cookieAuth: [] }],
        summary:
          "Tenant Dashboard Summary, 10th Overdue Countdown & Reminder Alerts [Redis Cached] (Page: TenantDashboardPage.jsx)",
        responses: { 200: { description: "Tenant dashboard summary" } },
      },
    },
    "/admin/tenants": {
      get: {
        tags: ["Tenants"],
        security: [{ cookieAuth: [] }],
        summary:
          "List & search all tenants with pagination [Redis Cached] (Page: AdminTenantsPage.jsx)",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["pending", "approved", "rejected"],
            },
          },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Paginated tenant list" } },
      },
    },
    "/admin/tenants/create": {
      post: {
        tags: ["Tenants"],
        security: [{ cookieAuth: [] }],
        summary:
          "Admin Direct Tenant Creation + Immediate Flat Assignment (Page: AdminTenantsPage.jsx / AdminUnitsPage.jsx)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminCreateTenantRequest" },
            },
          },
        },
        responses: {
          201: {
            description:
              "Tenant created, auto-approved, assigned to unit, and emailed credentials",
          },
          409: { description: "Email, phone, or unit already taken" },
        },
      },
    },
    "/admin/tenants/{id}": {
      patch: {
        tags: ["Tenants"],
        security: [{ cookieAuth: [] }],
        summary:
          "Admin Full Edit of Any Tenant (Name, Email, Phone, Password, NID, Unit Reassign) (Page: AdminTenantsPage.jsx)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminUpdateTenantRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Tenant updated and unit assignment synchronized",
          },
        },
      },
      delete: {
        tags: ["Tenants"],
        security: [{ cookieAuth: [] }],
        summary:
          "Remove tenant account & free assigned unit (Page: AdminTenantsPage.jsx)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Tenant removed" } },
      },
    },
    "/admin/tenants/{id}/approval": {
      patch: {
        tags: ["Tenants"],
        security: [{ cookieAuth: [] }],
        summary:
          "Approve or reject a pending tenant registration with optional unit assignment (Page: AdminTenantsPage.jsx)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["approvalStatus"],
                properties: {
                  approvalStatus: {
                    type: "string",
                    enum: ["approved", "rejected"],
                  },
                  unitId: {
                    type: "string",
                    description: "Optional vacant unit ID",
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Approval status updated" } },
      },
    },
    "/admin/tenants/{id}/toggle-active": {
      patch: {
        tags: ["Tenants"],
        security: [{ cookieAuth: [] }],
        summary:
          "Activate or deactivate a tenant account (Page: AdminTenantsPage.jsx)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Tenant active state toggled" } },
      },
    },
    "/unit/seed-building": {
      post: {
        tags: ["Units"],
        security: [{ cookieAuth: [] }],
        summary:
          "Initialize all 48 standard building units (Floors A–L: A-101..L-1204 with tiered sizes & fixed rents) (Page: AdminUnitsPage.jsx)",
        responses: { 201: { description: "48 units initialized" } },
      },
    },
    "/unit/status-matrix": {
      get: {
        tags: ["Units"],
        security: [{ cookieAuth: [] }],
        summary:
          "Live Flat & Payment Status Matrix (Vacant, Paid, Pending, Due, Overdue past 10th) [Redis Cached] (Page: AdminDashboardPage.jsx / AdminUnitsPage.jsx)",
        parameters: [
          {
            name: "month",
            in: "query",
            schema: { type: "string", example: "2026-11" },
          },
        ],
        responses: {
          200: { description: "Full building unit matrix and summary counts" },
        },
      },
    },
    "/unit/all-unit": {
      get: {
        tags: ["Units"],
        security: [{ cookieAuth: [] }],
        summary:
          "Paginated list of rental units [Redis Cached] (Page: AdminUnitsPage.jsx)",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 12 },
          },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["vacant", "occupied"] },
          },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Paginated units" } },
      },
    },
    "/unit/create": {
      post: {
        tags: ["Units"],
        security: [{ cookieAuth: [] }],
        summary:
          "Create a new rental unit with up to 3 photos (Page: AdminUnitsPage.jsx)",
        responses: { 201: { description: "Unit created" } },
      },
    },
    "/unit/update-unit/{id}": {
      patch: {
        tags: ["Units"],
        security: [{ cookieAuth: [] }],
        summary:
          "Update unit specifications, fixed rent, or photos (Page: AdminUnitsPage.jsx)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Unit updated" } },
      },
    },
    "/unit/del-unit/{id}": {
      delete: {
        tags: ["Units"],
        security: [{ cookieAuth: [] }],
        summary: "Delete a vacant unit (Page: AdminUnitsPage.jsx)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Unit deleted" } },
      },
    },
    "/unit/assign-tenant/{id}": {
      patch: {
        tags: ["Units"],
        security: [{ cookieAuth: [] }],
        summary:
          "Assign an approved tenant to a vacant unit (Page: AdminUnitsPage.jsx)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Tenant assigned; unit includes the assignment month",
          },
        },
      },
    },
    "/unit/unassign-tenant/{id}": {
      patch: {
        tags: ["Units"],
        security: [{ cookieAuth: [] }],
        summary:
          "Unassign tenant from unit and mark unit vacant (Page: AdminUnitsPage.jsx)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Tenant unassigned" } },
      },
    },
    "/unit/my-unit": {
      get: {
        tags: ["Units"],
        security: [{ cookieAuth: [] }],
        summary:
          "Get tenant's own assigned unit & fixed rent schedule [Redis Cached] (Page: TenantUnitPage.jsx)",
        responses: { 200: { description: "Assigned unit details" } },
      },
    },
    "/payment/submit": {
      post: {
        tags: ["Payments & SSLCommerz"],
        security: [{ cookieAuth: [] }],
        summary:
          "Submit manual rent payment for the assignment month onward (Amount strictly locked to assigned unit's rentAmount) (Page: TenantPaymentsPage.jsx)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SubmitPaymentRequest" },
            },
          },
        },
        responses: {
          201: { description: "Payment submitted with unit's fixed rent" },
        },
      },
    },
    "/payment/ssl/init": {
      post: {
        tags: ["Payments & SSLCommerz"],
        security: [{ cookieAuth: [] }],
        summary:
          "Initialize SSLCommerz Online Payment Session with locked unit rent (Page: TenantPaymentsPage.jsx / TenantDashboardPage.jsx)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SslInitRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Returns SSLCommerz gatewayUrl and locked amount",
          },
        },
      },
    },
    "/payments/subscription/success": {
      post: {
        tags: ["Payments & SSLCommerz"],
        summary:
          "SSLCommerz Success Callback — Auto-verifies payment, emails receipt, and redirects to frontend",
        responses: {
          302: { description: "Redirects to /tenant/payments?ssl=success" },
        },
      },
    },
    "/payment/my-payments": {
      get: {
        tags: ["Payments & SSLCommerz"],
        security: [{ cookieAuth: [] }],
        summary:
          "Get tenant's payment history from the current unit's assignment month onward [Redis Cached] (Page: TenantPaymentsPage.jsx)",
        responses: { 200: { description: "List of tenant payments" } },
      },
    },
    "/payment/receipt/{id}": {
      get: {
        tags: ["Payments & SSLCommerz"],
        security: [{ cookieAuth: [] }],
        summary:
          "Get official verified payment receipt [Redis Cached] (Page: TenantPaymentsPage.jsx)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Receipt details" } },
      },
    },
    "/payment/all-payments": {
      get: {
        tags: ["Payments & SSLCommerz"],
        security: [{ cookieAuth: [] }],
        summary:
          "Admin paginated payment ledger [Redis Cached] (Page: AdminPaymentsPage.jsx)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["pending", "verified", "rejected"],
            },
          },
          {
            name: "month",
            in: "query",
            schema: { type: "string", example: "2026-11" },
          },
        ],
        responses: { 200: { description: "Paginated payments" } },
      },
    },
    "/payment/verify/{id}": {
      patch: {
        tags: ["Payments & SSLCommerz"],
        security: [{ cookieAuth: [] }],
        summary:
          "Verify a pending manual payment & email receipt (Page: AdminPaymentsPage.jsx)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Payment verified" } },
      },
    },
    "/payment/reject/{id}": {
      patch: {
        tags: ["Payments & SSLCommerz"],
        security: [{ cookieAuth: [] }],
        summary: "Reject a pending payment (Page: AdminPaymentsPage.jsx)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Payment rejected" } },
      },
    },
    "/payment/overdue": {
      get: {
        tags: ["Payments & SSLCommerz"],
        security: [{ cookieAuth: [] }],
        summary:
          "List unpaid/overdue tenants (10th of the month rule + reminder history) [Redis Cached] (Page: AdminReportsPage.jsx)",
        parameters: [
          {
            name: "month",
            in: "query",
            schema: { type: "string", example: "2026-11" },
          },
        ],
        responses: {
          200: { description: "Overdue tenants with reminderCount" },
        },
      },
    },
    "/payment/monthly-report": {
      get: {
        tags: ["Payments & SSLCommerz"],
        security: [{ cookieAuth: [] }],
        summary:
          "Monthly financial collection report [Redis Cached] (Page: AdminReportsPage.jsx)",
        parameters: [
          {
            name: "month",
            in: "query",
            schema: { type: "string", example: "2026-11" },
          },
        ],
        responses: { 200: { description: "Monthly collection breakdown" } },
      },
    },
    "/payment/remind/{tenantId}": {
      post: {
        tags: ["Payments & SSLCommerz"],
        security: [{ cookieAuth: [] }],
        summary:
          "Send 1-click rent/overdue reminder email & in-app alert to a tenant (Page: AdminDashboardPage.jsx / AdminReportsPage.jsx)",
        parameters: [
          {
            name: "tenantId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  month: { type: "string", example: "2026-11" },
                  note: {
                    type: "string",
                    example: "Please clear your rent by the 10th.",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Reminder sent and reminderCount incremented" },
        },
      },
    },
    "/payment/remind-all": {
      post: {
        tags: ["Payments & SSLCommerz"],
        security: [{ cookieAuth: [] }],
        summary:
          "Send bulk rent/overdue reminders to all unpaid occupied flats (Page: AdminDashboardPage.jsx / AdminReportsPage.jsx)",
        responses: { 200: { description: "Bulk reminders dispatched" } },
      },
    },
    "/maintenance/create": {
      post: {
        tags: ["Maintenance"],
        security: [{ cookieAuth: [] }],
        summary:
          "Submit maintenance ticket with up to 3 photos (Page: TenantMaintenancePage.jsx)",
        responses: { 201: { description: "Maintenance ticket created" } },
      },
    },
    "/maintenance/getmy": {
      get: {
        tags: ["Maintenance"],
        security: [{ cookieAuth: [] }],
        summary:
          "Get tenant's maintenance tickets [Redis Cached] (Page: TenantMaintenancePage.jsx)",
        responses: { 200: { description: "Tenant maintenance tickets" } },
      },
    },
    "/maintenance/getall": {
      get: {
        tags: ["Maintenance"],
        security: [{ cookieAuth: [] }],
        summary:
          "Admin list all maintenance tickets [Redis Cached] (Page: AdminMaintenancePage.jsx)",
        responses: { 200: { description: "All maintenance requests" } },
      },
    },
    "/maintenance/update/{id}": {
      patch: {
        tags: ["Maintenance"],
        security: [{ cookieAuth: [] }],
        summary:
          "Update maintenance status (pending / in-progress / resolved) (Page: AdminMaintenancePage.jsx)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Status updated" } },
      },
    },
    "/maintenance/del/{id}": {
      delete: {
        tags: ["Maintenance"],
        security: [{ cookieAuth: [] }],
        summary:
          "Delete/cancel a maintenance ticket (Page: AdminMaintenancePage.jsx / TenantMaintenancePage.jsx)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Maintenance ticket deleted" } },
      },
    },
    "/notice/getall": {
      get: {
        tags: ["Notices"],
        security: [{ cookieAuth: [] }],
        summary: "List building notices [Redis Cached] (Page: NoticesPage.jsx)",
        responses: { 200: { description: "Paginated notices" } },
      },
    },
    "/notice/single/{id}": {
      get: {
        tags: ["Notices"],
        security: [{ cookieAuth: [] }],
        summary:
          "Get single notice with comments [Redis Cached] (Page: NoticeDetailPage.jsx)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Notice details" } },
      },
    },
    "/notice/create": {
      post: {
        tags: ["Notices"],
        security: [{ cookieAuth: [] }],
        summary: "Publish a new building notice (Page: NoticesPage.jsx)",
        responses: { 201: { description: "Notice published" } },
      },
    },
    "/notice/comment/{id}": {
      post: {
        tags: ["Notices"],
        security: [{ cookieAuth: [] }],
        summary: "Add comment on a notice (Page: NoticeDetailPage.jsx)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 201: { description: "Comment added" } },
      },
    },
  },
};

module.exports = { swaggerSpec };
