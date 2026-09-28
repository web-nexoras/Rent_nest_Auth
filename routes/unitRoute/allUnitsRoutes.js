const express = require("express");
const router = express.Router();



router.patch('/update-notice/:id',adminOnly  ,updateNotice)

module.exports = router
