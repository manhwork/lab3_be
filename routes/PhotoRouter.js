const express = require("express");
const Photo = require("../db/photoModel");
const router = express.Router();
const multer = require("multer");

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "public/images/");
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + "-" + file.originalname);
        },
    }),
});

const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, async (request, response) => {});

router.get("/", authMiddleware, async (request, response) => {});

router.post(
    "/commentsOfPhoto/:photo_id",
    authMiddleware,
    async (request, response) => {
        const { photo_id } = request.params;
        const { comment } = request.body;

        if (comment === "") {
            response.status(400).json({ message: "Comment cannot be empty" });
            return;
        }

        try {
            const photo = await Photo.findById(photo_id);
            if (!photo) {
                response.status(404).json({ message: "Photo not found" });
                return;
            }
            photo.comments.push({
                user_id: request.user._id,
                comment: comment,
                date_time: new Date(),
            });
            await photo.save();
            response
                .status(200)
                .json({ message: "Comment added successfully" });
        } catch (error) {
            console.error(error);
            response.status(500).json({ message: "Server error" });
        }
    }
);

router.post(
    "/new",
    authMiddleware,
    upload.single("photo"),
    async (req, res) => {
        const photoPath = req.file.path;
        console.log("Uploaded photo path:", photoPath);
        const newPhotoPath = `http://localhost:8081/${photoPath}`;

        const photo = new Photo({
            file_name: newPhotoPath,
            user_id: req.user._id,
            comments: [],
        });

        try {
            await photo.save();
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: "Server error" });
            return;
        }

        res.json({
            message: "Photo uploaded successfully",
            photo: photo,
        });
    }
);

module.exports = router;
