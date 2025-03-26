const express = require("express");
const {
  createPost,
  getAllPosts,
  getUserPosts,
  getGroupPosts,
  deletePost,
} = require("../controllers/postController");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/", authMiddleware, upload.array("images", 5), createPost); //
router.get("/", authMiddleware, getAllPosts); //
router.get("/user/:user_id", getUserPosts); //
//router.get('/group/:group_id',getGroupPosts);
router.delete("/:id", authMiddleware, deletePost); //

module.exports = router;
