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

  try {
    // 🔍 เช็กก่อน (เพื่อ UX)
    const userByUsername = await User.findOne({ username });
    if (userByUsername) {
      return res.render("register", {
        error: "Username นี้มีผู้ใช้งานแล้ว"
      });
    }

    const userByEmail = await User.findOne({ email });
    if (userByEmail) {
      return res.render("register", {
        error: "Email นี้ถูกใช้ไปแล้ว"
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

  } catch (err) {
    // 🔥 กัน MongoDB Atlas duplicate
    if (err.code === 11000) {
      if (err.keyPattern.username) {
        return res.render("register", {
          error: "Username นี้มีผู้ใช้งานแล้ว"
        });
      }
      if (err.keyPattern.email) {
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