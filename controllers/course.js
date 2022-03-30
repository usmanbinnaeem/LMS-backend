import AWS from "aws-sdk";
import { nanoid } from "nanoid";
import Course from "../models/course";
import slugify from "slugify";

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccesskey: process.env.AWS_SEC_ACCESS_KEY,
  region: process.env.AWS_REGION,
};

const S3 = new AWS.S3(awsConfig);
export const uploadImage = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).send("No Image Found! Please upload Image");
    }
    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const type = image.split(";")[0].split("/")[1];

    const params = {
      Bucket: "lms-course-feature-image",
      Key: `${nanoid()}.${type}`,
      Body: base64Data,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };

    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      console.log(data);
      res.send(data);
    });
  } catch (err) {
    console.log(err);
  }
};

export const removeImage = async (req, res) => {
  try {
    const { image } = req.body;
    const params = {
      Bucket: image.Bucket,
      Key: image.Key,
    };
    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      res.send({ ok: true });
    });
  } catch (err) {
    console.log(err);
  }
};

export const createCourse = async (req, res) => {
  // console.log("COURSE CREATED", req.body);
  // return;
  try {
    const alreadyExist = await Course.findOne({
      slug: slugify(req.body.name.toLowerCase()),
    });

    if (alreadyExist) {
      return res.status.send("Title is Already Taken");
    }

    const course = await new Course({
      slug: slugify(req.body.name),
      instructor: req.user._id,
      ...req.body,
    }).save();
    res.json(course);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Course Creation Failed");
  }
};
