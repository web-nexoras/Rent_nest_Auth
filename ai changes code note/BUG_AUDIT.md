# Rent Nest — Bug Audit Notes

## জরুরি / High impact

### 3. Approved tenant অন্য tenant-এর maintenance request মুছতে পারে

- **ফাইল:** `routes/maintenanceRoute/allMaintenance.js:39`, `controllers/maintenance/deleteMaintenance.js:5-24`
- Route-এর `requireApproved` admin ও approved tenant উভয়কেই যেতে দেয়। Controller কেবল ID দিয়ে request খুঁজে মুছে দেয়; owner/admin authorization নেই। ফলে approved tenant অন্যের request ID দিয়ে সেটি delete করতে পারে।

### 5. OTP brute-force ও resend abuse ঠেকানোর সীমা নেই

- **ফাইল:** `helpers/auth/authUtils.js:9-12`, `routes/authRoute/authAllRoutes.js:24-26`
- OTP মাত্র 4 digit; verify/resend endpoint-এ rate limit, attempt counter বা lockout নেই। অনুমান করে OTP বের করার এবং ইচ্ছেমতো ইমেইলে OTP পাঠানোর চেষ্টা throttling ছাড়া চালানো যায়। `express-rate-limit` dependency থাকলেও route-এ প্রয়োগ দেখা যায়নি।


### 8. Case-insensitive email ব্যবহার signup-এর পর OTP verify/resend-এ ব্যর্থ হতে পারে

- **ফাইল:** `models/authSchema.js` email field, `controllers/auth/signUp.js:54-69`, `controllers/auth/verifyOtp.js:17-24`, `controllers/auth/resendOtp.js:18-24`
- Schema email lowercase করে save করে; কিন্তু verify/resend query request-এর email অপরিবর্তিত রাখে। User uppercase/mixed-case email দিয়ে signup করে একই casing-এ OTP verify বা resend করলে lowercase database value-এর সঙ্গে match নাও হতে পারে। Signin/forgot-password-এ lowercase করা আছে, OTP endpoint দুটিতে নেই।

### 9. Signup-এ OTP email পাঠাতে ব্যর্থ হলেও সফলতা ও “OTP sent” response ফেরে

- **ফাইল:** `controllers/auth/signUp.js:72-90`
- Mail error catch করে শুধু log করা হয়; user record ও OTP তৈরি থাকার পরও `201` এবং “OTP has been sent” ফেরে। Mail service ব্যর্থ হলে user জানে না যে resend দরকার; এটি signup completion flow-কে বিভ্রান্ত করে।

### 10. Profile update ও authentication route deactivated account-কে সব জায়গায় আটকায় না

- **ফাইল:** `routes/authRoute/authAllRoutes.js:30-33`, `middlewares/checkActive.js`
- Notice/unit/maintenance route group-এ `checkActive` আছে, কিন্তু `/auth/get-profile` ও `/auth/update-profile`-এ শুধু `authMiddleware` আছে। Deactivated user valid token থাকলে profile পড়তে/পরিবর্তন করতে পারে।

### 11. Unit/tenant assignment একাধিক document save করে transaction ছাড়া

- **ফাইল:** `controllers/unit/assignTenant.js:64-69`, `controllers/teant/updateApprovalStatus.js`-এর approval/assignment অংশ
- Unit ও tenant দুইটি document আলাদাভাবে save হয়। প্রথম save সফল, দ্বিতীয়টি ব্যর্থ হলে `unit.assignedTenant` এবং `tenant.assignedUnit` একে অপরের সঙ্গে মেলে না। একই unit/tenant-এ সমসাময়িক request এলে check-then-save race-এর কারণে একাধিক assignment-ও হতে পারে।

### 12. Maintenance ID validation নেই: malformed ID-তে 500 হতে পারে

- **ফাইল:** `controllers/maintenance/getSingleMaintenance.js:5-10`, `controllers/maintenance/deleteMaintenance.js:5-9`
- `findById(id)`-এর আগে ObjectId validation নেই। ভুল format-এর ID এলে Mongoose CastError error handler-এ গিয়ে `500` দিতে পারে, যেখানে client input-এর জন্য `400` হওয়া উচিত।

### 13. Image upload-এ file size/type সীমা নেই

- **ফাইল:** `routes/authRoute/authAllRoutes.js:4,33`, `routes/unitRoute/allUnitsRoutes.js:4,19,23`, `routes/maintenanceRoute/allMaintenance.js:4,30-34`
- Multer default memory storage ব্যবহার করছে; file-size limit বা MIME/type filter নেই। Unit/maintenance-এ সর্বোচ্চ file count আছে, কিন্তু বড় file memory-তে buffer হতে পারে। Profile endpoint-এ একটিমাত্র file নেওয়া হয়, কিন্তু তার size/type validation নেই। এতে অতিরিক্ত memory ব্যবহার, upload failure এবং অপ্রত্যাশিত file upload-এর ঝুঁকি আছে।

### 14. Cloudinary delete helper deletion শেষ হওয়া পর্যন্ত অপেক্ষা করে না

- **ফাইল:** `helpers/cloudinary/cloudinaryUtils.js:14-23`, callers: `controllers/unit/updateUnit.js:124`, `controllers/auth/updateProfile.js:59`
- `destroyFromCloudinary` callback API call শুরু করে কিন্তু Promise/return value দেয় না। Caller-এর `await` তাই actual deletion-এর জন্য অপেক্ষা করে না; deletion error caller-এ ধরা পড়ে না, শুধু callback log করে। ফল: পুরোনো image Cloudinary-তে থেকে যেতে পারে এবং update সফল দেখালেও deletion পরে ব্যর্থ হতে পারে।

### 15. Forgot-password email-এ expiry 10 মিনিট বলা, server-এ 15 মিনিট

- **Файл:** `controllers/auth/forgetPass.js:46`, `helpers/email/emailTemp.js:34`
- Database token expiry 15 মিনিট, email template-এ 10 মিনিট লেখা। User-কে ভুল expiry জানানো হয়।

## Validation ও error response-এর অসঙ্গতি

### 16. কয়েকটি endpoint-এ malformed/missing body বা ভুল data type 500 ঘটাতে পারে

- **ফাইলের উদাহরণ:** `controllers/auth/signUp.js`, `SignIn.js`, `verifyOtp.js`, `resendOtp.js`, `forgetPass.js`, `resetPass.js`, `updateProfile.js`; `controllers/unit/createUnit.js`; `controllers/maintenance/createMaintenance.js`
- অনেক controller সরাসরি `req.body` destructure করে বা user-provided value-তে `.trim()`/`.toLowerCase()`/`.length` চালায়। Body অনুপস্থিত বা field string না হলে validation response-এর বদলে TypeError/500 হতে পারে। Notice controller-এ এই ধরনের body/type guard ইতিমধ্যে আছে, কিন্তু pattern বাকি controller-গুলোতে একরকম নয়।

### 17. Invalid maintenance category ও অন্যান্য model validation error 500 হিসেবে ফেরে

- **ফাইল:** `controllers/maintenance/createMaintenance.js:15-22,74`, `models/maintenanceSchema.js`
- Create controller category কেবল উপস্থিত কি না দেখে; enum-এ না থাকলে Mongoose validation failure error handler-এ গিয়ে সাধারণত `500` হয়। Client-এর invalid input-কে `400` হিসেবে ফেরত দেওয়ার আলাদা mapping নেই। একই ধরনের Mongoose validation/cast error অন্য create/update endpoint-এও 500 হতে পারে।

### 18. Pagination input-এ সীমা/validation অনুপস্থিত (unit list)

- **ফাইল:** `controllers/unit/getAllUnits.js:4-8`
- `page` ও `limit` arbitrary number থেকে নেয়; upper/lower bound নেই। Negative বা অস্বাভাবিক বড় value query error, resource-heavy query বা ভুল `totalPages` result দিতে পারে।

## Startup / deployment নির্ভর

### 19. Database connection সফল হওয়ার আগেই HTTP server listen করে

- **ফাইল:** `server.js:28-32`, `configs/dbConfig.js`
- `dbConfig()` asynchronous connection শুরু করে, কিন্তু await না করেই `app.listen()` চলে। Database unavailable/slow হলে server ready দেখাতে পারে, অথচ প্রথম request-গুলো database error পাবে। Startup connection failure-এ process-ও বন্ধ হয় না।

### 20. Cross-site frontend হলে `SameSite=Strict` cookie পাঠানো নাও হতে পারে

- **ফাইল:** `controllers/auth/SignIn.js:10-12`, `server.js:14-19`
- Frontend ও API আলাদা site/domain-এ deploy হলে Strict cookie policy browser-কে cookie পাঠানো থেকে আটকাতে পারে; CORS-এ credentials enable থাকলেই cookie cross-site যাবে না। একই site-এ frontend/API থাকলে এই সমস্যা প্রযোজ্য নাও হতে পারে—deploy topology যাচাই দরকার।

## Review scope note

- উপরের তালিকা source inspection-এ দৃশ্যমান issue; business policy, production env এবং database data না দেখে কিছু behavior-এর প্রত্যাশা নিশ্চিত করা যায় না।
- Automated test suite কার্যকর নয়: `package.json`-এর `test` script শুধু “no test specified” বলে exit code 1 দেয়। এই audit-এ test চালানো হয়নি।
