import express from "express";
import formidable from "express-formidable";
const router = express.Router();

// middleware
import { requireSignin, isInstructor } from "../middlewares";

// controllers
import {
  uploadImage,
  removeImage,
  createCourse,
  updateCourse,
  read,
  uploadVideo,
  removeVideo,
  addLesson,
} from "../controllers/course";

router.post("/course/upload-image", uploadImage);
router.post("/course/remove-image", removeImage);
router.post("/course", requireSignin, isInstructor, createCourse);
router.put("/course/:slug", requireSignin, updateCourse);
router.get("/course/:slug", read);
router.post(
  "/course/video-upload/:instructorId",
  requireSignin,
  formidable(),
  uploadVideo
);
router.post("/course/remove-video/:instructorId", requireSignin, removeVideo);
router.post("/course/lesson/:slug/:instructorId", requireSignin, addLesson);

module.exports = router;
