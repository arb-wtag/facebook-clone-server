const express = require("express");
const {
  register,
  login,
  logout,
  checkLogin,
  validateRegister,
  validateLogin,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const { authLimiter } = require("../middlewares/rateLimiterMiddleware");

const router = express.Router();

router.post("/register", validateRegister, register); //
router.post("/login", authLimiter, validateLogin, login); //
router.post("/logout", logout); //
router.get("/check-login", authMiddleware, checkLogin); //

module.exports = router;
