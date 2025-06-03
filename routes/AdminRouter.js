const express = require("express");
const User = require("../db/userModel");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/login", async (req, res) => {
    const { login_name, password } = req.body;

    const user = await User.findOne({ login_name: login_name });

    if (!user) {
        res.status(401).json({
            message: "Sai mã định danh",
        });
        return;
    }

    if (user["password"] !== password) {
        res.status(401).json({
            message: "Sai mật khẩu",
        });
        return;
    }

    const token = jwt.sign({ user: user }, "123456789", {
        expiresIn: "7d",
    });

    console.log(user);

    res.json({
        token: token,
        user: user,
    });
});

router.post("/logout", (req, res) => {
    res.status(200).json({
        msg: "Logout Success",
    });
});

router.get("/me", authMiddleware, async (req, res) => {
    const user = req.user;
    res.json({
        user: user,
    });
});

router.post("/register", async (req, res) => {
    const {
        login_name,
        password,
        first_name,
        last_name,
        location,
        description,
        occupation,
    } = req.body;
    const user = await User.findOne({ login_name: login_name });

    if (user) {
        res.status(400).json({
            message: "Tài khoản đã tồn tại",
        });
        return;
    }

    const newUser = new User({
        login_name,
        password,
        first_name,
        last_name,
        location,
        description,
        occupation,
    });
    await newUser.save();

    const token = jwt.sign({ user: newUser }, "123456789", {
        expiresIn: "7d",
    });

    res.status(200).json({
        message: "Đăng ký thành công",
        token: token,
        user: newUser,
    });
});

module.exports = router;
