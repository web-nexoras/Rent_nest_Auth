# Code changes ও সমস্যা সমাধান

এই নোটে এই review-তে করা পরিবর্তনগুলো এবং পাওয়া সমস্যাগুলো এক জায়গায় রাখা হয়েছে।

## কী সমস্যা পাওয়া গিয়েছিল

1. `routes/authRoute/index.js`-এ signup endpoint ভুল করে `signIn.js` import করছিল। ফলে `/signup` route register হচ্ছিল না।
2. `routes/index.js` শুধু auth routes mount করছিল; notice routes কখনো API-তে যুক্তই ছিল না।
3. Notice controller-গুলোর কয়েকটি `models/noticeSchema` import করছিল, কিন্তু প্রকৃত ফাইলের নাম `models/noticeShcema.js`। ফাইল নামের বানান না মেলায় request চলার সময় module error হতো। `addComment`-এ model-কে destructure করাও ভুল ছিল।
4. `middlewares/roleCheckMiddleware.js`-এ role যাচাইয়ের কাজ ছিল না। Notice write routes-এ authentication/authorization-ও প্রয়োগ করা ছিল না।
5. Forgot-password route login করা user চাইত, যা password ভুলে যাওয়া user-কে reset শুরু করতে বাধা দিত।
6. Single notice route-এ `:id` ছিল না, অথচ controller `req.params.id` পড়ত। Delete comment route-এও `commentId` parameter অনুপস্থিত ছিল।
7. `configs/dbConfig.js`-এর comment-এ database/email/cloud service-এর credential সরাসরি রাখা ছিল। সেগুলো সরানো হয়েছে। যদি এগুলো আগে commit বা share হয়ে থাকে, সংশ্লিষ্ট provider-এ credential rotate করতে হবে।
8. Database connection failure log করে server চালু থাকে। বর্তমান update-এ আগের এই আচরণ রাখা হয়েছে।
9. অজানা URL-এর জন্য JSON 404 response যোগ করা হয়েছে।
10. Mongoose save hook-এ `next()` callback ব্যবহার করা হচ্ছিল। বর্তমান Mongoose-এ এটি `next is not a function` error দিচ্ছিল। Auth ও unit model-এর save hookগুলো callback-বিহীন sync/async hook-এ বদলানো হয়েছে।
11. OTP resend controller-এ undefined `normalizedEmail` variable ছিল, যা resend request-এ 500 দিত। Signup, verify, resend-এ email lowercase/trim এবং verify-তে OTP string trim করা হয়েছে, যাতে input casing/number format-এর অমিল না হয়।
12. Signin email trim/lowercase করা হয়েছে, এবং password সঠিক হওয়ার আগে approval/verification state আর প্রকাশ হয় না। Public signup থেকে admin role নেওয়া হয় না; admin provision করার জন্য `scripts/provisionAdmin.js` যোগ করা হয়েছে। `.env`-এ `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `ADMIN_PHONE` সেট করে `node scripts/provisionAdmin.js` চালালে ওই email-এর account admin/approved হিসেবে তৈরি বা আপডেট হবে।
13. Signup এখন `role` গ্রহণ করে: role না পাঠালে tenant, আর admin role-এর জন্য `.env`-এ `ADMIN_SIGNUP_SECRET` এবং request-এর `adminSignupSecret` মিলতে হবে। ফলে role বাছাই করা যায়, কিন্তু secret ছাড়া signup দিয়ে নিজেকে admin বানানো যায় না।

## কী কী পরিবর্তন করেছি

- Signup route-কে `signUp.js`-এর সঙ্গে যুক্ত করেছি।
- `BASE_URL` না থাকলে `/api/v1` fallback দিয়ে auth ও notice route mount করেছি।
- Notice API-তে authentication বাধ্যতামূলক করেছি। Create/update/delete notice শুধু `admin`; comment যোগ ও delete করা শুধু `tenant` করতে পারে। Comment delete-এ controller comment-এর মালিকানাও যাচাই করে।
- `roleCheckMiddleware`-এ missing authentication-এর জন্য 401 এবং অনুমোদিত role না হলে 403 response যোগ করেছি।
- Forgot password-কে public করেছি; reset password token দিয়েই সীমাবদ্ধ।
- Notice model import, route parameter, এবং `req.cookies` অনুপস্থিত থাকলে auth middleware crash হওয়ার সমস্যা ঠিক করেছি। JWT secret না থাকলে configuration error central handler-এ পাঠানো হয়।
- Database connection-এর আগের আচরণ রাখা হয়েছে। Hardcoded DNS resolver override সরিয়েছি, যাতে host-এর DNS configuration অকারণে বদলাতে না হয়।

## গুরুত্বপূর্ণ route path

`BASE_URL=/api/v1` হলে:

- Auth: `/api/v1/auth/...`
- Notice: `/api/v1/notice/...`
- Single notice: `GET /api/v1/notice/single-notice/:id`
- Comment delete: `DELETE /api/v1/notice/del-comment/:id/:commentId`

Login-এর পর cookie-তে access token পাঠাতে হবে। Notice create/update/delete-এ admin role এবং comment add-এ tenant role লাগবে।

## Setup যাচাই করুন

`.env`-এ `DB_URL`, `JWT_SEC`, `BASE_URL`, `CLIENT_URL`, mail ও Cloudinary settings সঠিকভাবে দিন। `BASE_URL`-এর উদাহরণ `/api/v1`। `.env` Git-এ commit করবেন না। README-এর কিছু endpoint পুরোনো/পরিকল্পিত feature-এর তালিকা; সেগুলো বর্তমান implementation-এর সম্পূর্ণ তালিকা নয়।

## এই পরিবর্তনে যা যাচাই করা হয়েছে

- পরিবর্তিত JavaScript ফাইলগুলোতে `node --check` চালানো হয়েছে।
- Live API/database integration চালিয়ে দেখা হয়নি; `.env`-এর service credential এখানে ব্যবহার করে request করা হয়নি।
