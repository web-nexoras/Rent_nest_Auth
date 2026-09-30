# Rent Nest Project Review

**Review scope:** routes, auth flow, controllers, models, middleware, and project configuration. README files were excluded from the assessment.
**Source code changed:** No. This review note is the only file created.

## Findings

### 1. High - No API flow to provision an admin or approve tenants

New accounts are created with the schema's default role (`tenant`) and default approval status (`pending`). The signup controller does not accept or assign an admin role. I found no admin-provisioning endpoint or tenant approve/reject endpoint in the registered routes/controllers. Tenant assignment rejects tenants who are not approved, and approved-only routes block pending tenants.

**Impact:** Unless an admin is inserted or promoted directly in MongoDB, the available API has no path to create its first admin. Even with a manually created admin, there is no API endpoint to approve a tenant, so the normal signup-to-approved-tenant flow cannot complete through this codebase.

**Relevant files:** [controllers/auth/signUp.js](../controllers/auth/signUp.js), [models/authSchema.js](../models/authSchema.js), [controllers/unit/assignTenant.js](../controllers/unit/assignTenant.js), [middlewares/requireApproved.js](../middlewares/requireApproved.js), [routes/index.js](../routes/index.js).

### 2. Observed API gap - Payment and maintenance modules have no registered endpoints

Payment and maintenance schemas exist, but their controller folders are empty. The root router registers only auth, notice, and unit routes. Therefore this server currently exposes no payment or maintenance API endpoints. Whether that is a defect depends on the intended scope of this backend.

**Relevant files:** [models/paymentSchema.js](../models/paymentSchema.js), [models/maintenanceSchema.js](../models/maintenanceSchema.js), [routes/index.js](../routes/index.js).

### 3. Medium - Mixed-case email can break verification, OTP resend, and password reset

The user schema lowercases email addresses on save, and sign-in/signup lookup normalize to lowercase. OTP verification, OTP resend, and forgot-password lookup use the submitted email without lowercasing it.

**Reproduction:** Sign up with a valid mixed-case address such as `User@Example.com`, then submit that same spelling to `/verify-otp`, `/resend-otp`, or `/forget-password`. MongoDB stores `user@example.com`, so those exact-match lookups can fail even though the account exists.

**Relevant files:** [models/authSchema.js](../models/authSchema.js), [controllers/auth/signUp.js](../controllers/auth/signUp.js), [controllers/auth/verifyOtp.js](../controllers/auth/verifyOtp.js), [controllers/auth/resendOtp.js](../controllers/auth/resendOtp.js), [controllers/auth/forgetPass.js](../controllers/auth/forgetPass.js), [controllers/auth/SignIn.js](../controllers/auth/SignIn.js).

### 4. Medium - Access cookie expires before its JWT, with no refresh endpoint

The access cookie is configured for 15 minutes, while its JWT is valid for 2 hours. A refresh token is issued for 15 days (with a 7-day cookie), but no refresh route exists and the auth middleware only reads the access-token cookie.

**Impact:** A browser loses the access cookie after 15 minutes and has no API flow to exchange the refresh token for a new one, so the user must sign in again. The configured JWT and cookie lifetimes also disagree, making the intended session duration unclear.

**Relevant files:** [controllers/auth/SignIn.js](../controllers/auth/SignIn.js), [helpers/auth/authUtils.js](../helpers/auth/authUtils.js), [middlewares/authMiddleware.js](../middlewares/authMiddleware.js), [routes/authRoute/authAllRoutes.js](../routes/authRoute/authAllRoutes.js).

### 5. Medium - Signup reports OTP delivery success when sending fails

Signup catches and logs mail transport errors, but still returns HTTP 201 and says the OTP was sent. The user record and OTP are already stored, so the user is left with a pending account and a success message despite receiving no email. Resend is a possible recovery path, but the initial response is misleading and the failure is hidden from the caller.

**Relevant file:** [controllers/auth/signUp.js](../controllers/auth/signUp.js).

### 6. Medium - Invalid unit values can become HTTP 500 responses

Unit controllers check that rent is present but do not reject negative values. The schema rejects negative `rentAmount`, `sizeSqft`, and `bedrooms`; those Mongoose validation errors reach the global error handler, which defaults unknown errors to status 500.

**Reproduction:** Submit a negative `rentAmount` to unit creation (or a negative numeric field to unit update) as an authorized admin. The input is invalid, but the API reports an internal-server error instead of a client validation response.

**Relevant files:** [controllers/unit/createUnit.js](../controllers/unit/createUnit.js), [controllers/unit/updateUnit.js](../controllers/unit/updateUnit.js), [models/unitSchema.js](../models/unitSchema.js), [middlewares/errorHandler.js](../middlewares/errorHandler.js).

### 7. Security risk - OTP endpoints have no application-level attempt throttling

OTP values contain four digits and expire after five minutes. I found no rate-limit middleware on signup, OTP verification, or resend routes, despite `express-rate-limit` being a dependency.

**Impact:** The API itself does not slow repeated OTP guesses or repeated email sends. A reverse proxy or gateway could mitigate this externally, but no such protection is configured in this project.

**Relevant files:** [helpers/auth/authUtils.js](../helpers/auth/authUtils.js), [controllers/auth/verifyOtp.js](../controllers/auth/verifyOtp.js), [controllers/auth/resendOtp.js](../controllers/auth/resendOtp.js), [routes/authRoute/authAllRoutes.js](../routes/authRoute/authAllRoutes.js), [package.json](../package.json).

## Areas checked without a finding

- The unit and notice route index files apply `authMiddleware` and `checkActive` before their route handlers. Admin routes also have role checks; the initial concern that these routers lacked authentication was incorrect and is not listed as a finding.
- The signup controller does not accept the requested role from the client, so an ordinary signup request cannot directly self-assign the `admin` role.
- Auth middleware excludes the password field when loading the current user.

## Verification limits

- VS Code diagnostics reported no errors.
- `package.json` defines `npm test` as a placeholder that exits with “no test specified”; there is no usable automated test suite configured there.
- Runtime/API behavior was not exercised, and the JavaScript syntax-check command was skipped. Findings above are based on the code paths and configuration inspected.