import User from "../models/user";
import { hashPassword, comparePassword } from "../utils/auth";
import jwt from "jsonwebtoken";

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
    if (!user) {
      return res.status(400).send("No Registered User Found with this Email!");
    }

    //check password
    const match = await comparePassword(password, user.password);

    // create signed JWT
    const token = jwt.sign({ _id: user._id }, process.env.JSON_SECRET, {
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
