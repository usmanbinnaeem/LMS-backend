import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const morgan = require("morgan");
import mongoose from "mongoose";
import csrf from "csurf";
require("dotenv").config();
import { readdirSync } from "fs";

const csrfProtection = csrf({ cookie: true });

// express app
const app = express();

// database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("**DB Connected**"))
  .catch((err) => {
    console.log(`**DB connection error: ${err}**`);
  });

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// routes
readdirSync("./routes").map((r) => {
  app.use("/api", require(`./routes/${r}`));
});

// csrf
app.use(csrfProtection);

app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
// port
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
