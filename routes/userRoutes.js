const express = require("express");
const { getProfile, updateProfile } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get("/:id", getProfile); //
router.put("/:id", authMiddleware, upload.single("photo"), updateProfile); //

module.exports = router;
