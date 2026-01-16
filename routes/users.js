const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

// 👑 ADMIN: ดู user ทั้งหมด
router.get("/", auth, adminOnly, async (req, res) => {
  const users = await User.find();

  res.render("users", {
    users,
    session: req.session
  });
});

// 👤 USER: ดูข้อมูลตัวเอง
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.session.userId);

  res.render("userHome", {
    user,
    session: req.session
  });
});

// 👑 ADMIN: แก้ไข user
router.get("/edit/:id", auth, adminOnly, async (req, res) => {
  const user = await User.findById(req.params.id);

  res.render("editUser", {
    user,
    session: req.session
  });
});

router.post("/edit/:id", auth, adminOnly, async (req, res) => {
  const updateData = {
    username: req.body.username,
    email: req.body.email
  };

  if (req.body.password && req.body.password !== "") {
    updateData.password = await bcrypt.hash(req.body.password, 10);
  }

  await User.findByIdAndUpdate(req.params.id, updateData);
  res.redirect("/users");
});

module.exports = router;
