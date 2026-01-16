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
  const { username, email, password } = req.body;

  // 🔍 เช็ก username ซ้ำ (เหมือน login)
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.render("register", {
      error: "Username นี้มีผู้ใช้งานแล้ว"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    username,
    email,
    password: hashedPassword,
    role: "user"
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