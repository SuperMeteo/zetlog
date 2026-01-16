const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

/* =====================
   GET: Login page
===================== */
router.get("/", (req, res) => {
  res.render("login");
});

/* =====================
   GET: Register page
===================== */
router.get("/register", (req, res) => {
  res.render("register");
});

/* =====================
   POST: Register
===================== */
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 🔍 เช็ก username ซ้ำ
    const existUsername = await User.findOne({ username });
    if (existUsername) {
      return res.render("register", {
        error: "Username นี้มีผู้ใช้งานแล้ว"
      });
    }

    // 🔍 เช็ก email ซ้ำ
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.render("register", {
        error: "Email นี้ถูกใช้ไปแล้ว"
      });
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ สร้าง user ใหม่
    await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user" // ⭐ role เริ่มต้น
    });

    // สมัครสำเร็จ → กลับไป login
    res.redirect("/");

  } catch (err) {
    // 🛑 กัน MongoDB duplicate (กรณี Atlas)
    if (err.code === 11000) {
      if (err.keyPattern?.username) {
        return res.render("register", {
          error: "Username นี้มีผู้ใช้งานแล้ว"
        });
      }
      if (err.keyPattern?.email) {
        return res.render("register", {
          error: "Email นี้ถูกใช้ไปแล้ว"
        });
      }
    }

    console.error(err);
    res.render("register", {
      error: "เกิดข้อผิดพลาด กรุณาลองใหม่"
    });
  }
});

/* =====================
   POST: Login
===================== */
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

  // ⭐ เก็บ session
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

/* =====================
   Logout
===================== */
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
