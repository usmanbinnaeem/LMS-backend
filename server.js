import express from "express";
import cors from "cors";
const morgan = require("morgan");
import mongoose from "mongoose";
require("dotenv").config();
import { readdirSync } from "fs";

//express app
const app = express();

//database connection

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
app.use(express.json());
app.use(morgan("dev"));

//routes

readdirSync("./routes").map((r) => {
  app.use("/api", require(`./routes/${r}`));
});

//port

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
