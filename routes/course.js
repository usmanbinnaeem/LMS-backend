import express from "express";

const router = express.Router();

// middleware
import { requireSignin, isInstructor } from "../middlewares";

// controllers
import { uploadImage, removeImage, createCourse, read } from "../controllers/course";

router.post("/course/upload-image", uploadImage);
router.post("/course/remove-image", removeImage);
router.post("/course", requireSignin, isInstructor, createCourse);
router.get("/course/:slug", read);

module.exports = router;
