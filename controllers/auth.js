import User from "../models/user";
import { hashPassword, comparePassword } from "../utils/auth";
import jwt from "jsonwebtoken";
import AWS from "aws-sdk";
import { nanoid } from "nanoid";

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccesskey: process.env.AWS_SEC_ACCESS_KEY,
  region: process.env.AWS_REGION,
  // apiVersion: process.env.AWS_API_VERSION,
};

const SES = new AWS.SES(awsConfig);

//register handler
export const register = async (req, res) => {
  try {
    // console.log("server data", req.body);
    const { values } = req.body;
    const { firstName, lastName, email, password } = values;
    // email duplication check
    let userExist = await User.findOne({ email }).exec();
    if (userExist) {
      return res.status(400).send("Email has already been taken");
    }

    // Hash Password
    const hashedPassword = await hashPassword(password);

    // create new user
    const user = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
    });
    await user.save();

    // console.log("Saved user", user);
    return res.json({ ok: true });
  } catch (err) {
    console.log("Error in user", err);
    return res.status(400).send("Error, try again");
  }
};

//login handler
export const login = async (req, res) => {
  try {
    // console.log(req.body);
    const { values } = req.body;
    const { email, password } = values;

    // check if out db has user with that email
    let user = await User.findOne({ email }).exec();
    const match = await comparePassword(password, user.password);
    if (!user) {
      return res.status(400).send("No Registered User Found with this Email!");
    } else if (match === false) {
      return res.status(400).send("Your password is incorrect");
    }

    //check password

    // create signed JWT
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // return user and token to client, exclude hashed password
    user.password = undefined;

    // send token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, //only work on https
    });
    // send user as json response
    res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. try again");
  }
};

// logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ essgae: "SignOut Sucessfully" });
  } catch (err) {
    console.log(err);
  }
};

// current User
export const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").exec();
    // console.log("current user", user);
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { values } = req.body;
    const { email } = values;
    // console.log("email recieved on server", email);
    const shortCode = nanoid(6).toUpperCase();
    const user = await User.findOneAndUpdate(
      { email },
      { passwordResetCode: shortCode }
    );
    if (!user) {
      res.status(400).send("No User Found! Please enter Valid Email Address");
    }

    const params = {
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: [email],
      },
      ReplyToAddresses: [process.env.EMAIL_FROM],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
              <html>
              <h1>Reset Password Link</h1>
              <p>Use this Code to reset your Password</p>
              <h2 style="color: red;">${shortCode}</h2>
              <i>lms.com</i>
              </html>
              `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "LMS Reset Password",
        },
      },
    };
    const emailSent = SES.sendEmail(params).promise();
    emailSent
      .then((data) => {
        console.log(data);
        res.json({ ok: true });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { values } = req.body;
    const { email, code, newPassword } = values;
    // console.table({email, code, newPassword});

    // Hash Password
    const hashedPassword = await hashPassword(newPassword);
    const user = await User.findOneAndUpdate(
      {
        email,
        passwordResetCode: code,
      },
      {
        password: hashedPassword,
        passwordResetCode: "",
      }
    ).exec();
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(400).send("Error. Try again");
  }
};
