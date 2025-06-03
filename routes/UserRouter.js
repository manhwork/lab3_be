const express = require("express");
const User = require("../db/userModel");
const Photo = require("../db/photoModel");
const mongoose = require("mongoose");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/list", async (request, response) => {
    try {
        const users = await User.find().select("_id first_name last_name");
        response.status(200).json(users);
    } catch (error) {
        response.status(400).json({ message: error.message });
    }
});

router.get("/:id", async (request, response) => {
    try {
        const user = await User.findById(request.params.id).select(
            "_id first_name last_name location description occupation"
        );
        response.status(200).json(user);
    } catch (error) {
        response.status(400).json({ message: error.message });
    }
});

router.get("/photosOfUser/:id", async (request, response) => {
    const user_id = request.params.id;
    try {
        const photos = await Photo.find({ user_id: user_id })
            .populate({
                path: "comments.user_id",
                select: "_id first_name last_name",
                model: "Users",
            })
            .lean();

        const photosWithUserInfo = photos.map((photo) => {
            const photoObj = { ...photo };
            photoObj.comments = photoObj.comments.map((comment) => {
                const { user_id, ...commentWithoutUserId } = comment;
                return {
                    ...commentWithoutUserId,
                    user: user_id,
                };
            });
            return photoObj;
        });

        response.status(200).json(photosWithUserInfo);
    } catch (error) {
        response.status(400).json({ message: error.message });
    }
});

router.get("/stats/:id", async (request, response) => {
    const user_id = request.params.id;
    try {
        const photoCount = await Photo.countDocuments({ user_id: user_id });

        const photos = await Photo.find().lean();

        let commentCount = 0;
        for (const photo of photos) {
            const userComments = photo.comments.filter(
                (comment) => comment.user_id.toString() === user_id
            );
            commentCount += userComments.length;
        }

        const stats = {
            user_id: user_id,
            photo_count: photoCount,
            comment_count: commentCount,
        };

        response.status(200).json(stats);
    } catch (error) {
        response.status(400).json({ message: error.message });
    }
});

router.post("/", async (req, res) => {
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
