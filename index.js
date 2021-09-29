const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes/routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");

mongoose.connect(
  "mongodb://localhost/dimo_test",
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
    origin: ["http://localhost:3000"],
  })
);
app.use(express.json());

app.use("/api", routes);

app.listen(8000);
