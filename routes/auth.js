const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  await User.create({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    role: "user" // ค่าเริ่มต้น
  });

  res.redirect("/");
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.render("login", { error: "ไม่พบบัญชีผู้ใช้" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render("login", { error: "รหัสผ่านไม่ถูกต้อง" });
  }

  // เก็บข้อมูลลง session
  req.session.userId = user._id;
  req.session.username = user.username;
  req.session.role = user.role;

  // 🔀 redirect ตาม role
  if (user.role === "admin") {
    res.redirect("/users");
  } else {
    res.redirect("/users/me");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
