const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes/routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const dbUri =
  process.env.NODE_ENV === "production"
    ? process.env.MONGODB_URI
    : "mongodb://localhost/dimo_test";

mongoose.connect(
  dbUri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("connected to the database");
  }
);

app = express();
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
  })
);
app.use(express.json());

app.use("/api", routes);

app.listen(8000);
