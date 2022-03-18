import User from "../models/user";
import { hashPassword, comparePassword } from "../utils/auth";

export const register = async (req, res) => {
  try {
    console.log("server data", req.body);
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

    console.log("Saved user", user);
    return res.json({ ok: true });
  } catch (err) {
    console.log("Error in user", err);
    return res.status(400).send("Error, try again");
  }
};
