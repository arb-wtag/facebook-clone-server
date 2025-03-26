const pool = require("../database/db");
const sharp = require("sharp");
const fs = require("fs");

const getProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query(
      "SELECT id, username, email, photo, bio FROM users WHERE id=$1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const { username, bio } = req.body;
    //const photo = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;
    //console.log(req.user.id,id);
    const imagePath = `uploads/compressed-${Date.now()}.jpg`;

    await sharp(req.file.path)
      .resize({ width: 800 })
      .jpeg({ quality: 70 })
      .toFile(imagePath);

    fs.unlink(req.file.path, (error) => {
      if (error) console.error("Error deleting original file:", error);
    });

    const photo = `http://localhost:5000/${imagePath}`;
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: "Unauthorized action" });
    }
    await pool.query(
      "UPDATE users SET username=$1, bio=$2, photo=$3, modified_at=NOW() WHERE id=$4",
      [username, bio, photo, id]
    );
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProfile, updateProfile };
