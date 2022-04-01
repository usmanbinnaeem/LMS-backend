import express from "express";
import formidable from 'express-formidable'
const router = express.Router();

// middleware
import { requireSignin, isInstructor } from "../middlewares";

// controllers
import { uploadImage, removeImage, createCourse, read, uploadVideo } from "../controllers/course";

router.post("/course/upload-image", uploadImage);
router.post("/course/remove-image", removeImage);
router.post("/course", requireSignin, isInstructor, createCourse);
router.get("/course/:slug", read);
router.post("/course/video-upload", requireSignin, formidable(), uploadVideo)

module.exports = router;
