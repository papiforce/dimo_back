const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const client = require("@sendgrid/mail");
require("dotenv").config();

client.setApiKey(process.env.SENDGRID_API_KEY);

router.post("/register", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const user = new User({
    email: req.body.email,
    password: hashedPassword,
  });

  const result = await user.save();
  const { password, ...data } = await result.toJSON();

  res.send(data);
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).send({
      message: "User not found",
    });
  }

  if (!(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(400).send({
      message: "Invalid password",
    });
  }

  const token = jwt.sign(
    {
      _id: user._id,
    },
    process.env.SECRET_KEY
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.send({
    message: "Success",
  });
});

router.get("/user", async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];

    const claims = jwt.verify(cookie, process.env.SECRET_KEY);

    if (!claims) {
      return res.status(401).send({
        message: "Unauthenticated",
      });
    }

    const user = await User.findOne({ _id: claims._id });

    const { password, ...data } = await user.toJSON();

    res.send(data);
  } catch {
    return res.status(401).send({
      message: "Unauthenticated",
    });
  }
});

router.post("/logout", (req, res) => {
  res.cookie("jwt", "", {
    maxAge: 0,
  });

  res.send({
    message: "Success",
  });
});

router.post("/send-email", async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];

    const claims = jwt.verify(cookie, process.env.SECRET_KEY);

    if (!claims) {
      return res.status(401).send({
        message: "Unauthenticated",
      });
    }

    const user = await User.findOne({ _id: claims._id });

    client.send({
      to: {
        email: "kasomo.emm@gmail.com",
        name: "UTILISATEUR",
      },
      from: {
        email: "kasomo.emm@gmail.com",
        name: "Dimo Spendesk",
      },
      templateId: "d-e8fd6257377a4b4fb47901764c64dba2",
      dynamicTemplateData: {
        lastname: req.body.lastname,
        firstname: req.body.firstname,
        adress: req.body.adress,
        phone: req.body.phone,
        email: req.body.email,
        propertyType: req.body.propertyType,
        propertyYear: req.body.propertyYear,
        diag: req.body.diag,
        offer: req.body.offer,
      },
    });

    client.send({
      to: {
        email: "kasomo.emm@gmail.com",
        name: "DIMO DIAGNOSTIC",
      },
      from: {
        email: "kasomo.emm@gmail.com",
        name: "Dimo Spendesk",
      },
      templateId: "d-7226b29f0a5047bea07e09301583619f",
      dynamicTemplateData: {
        userEmail: user.email,
        lastname: req.body.lastname,
        firstname: req.body.firstname,
        adress: req.body.adress,
        phone: req.body.phone,
        email: req.body.email,
        propertyType: req.body.propertyType,
        propertyYear: req.body.propertyYear,
        diag: req.body.diag,
        offer: req.body.offer,
      },
    });

    client.send({
      to: {
        email: "kasomo.emm@gmail.com", // req.body.email
        name: "CLIENT FINAL",
      },
      from: {
        email: "kasomo.emm@gmail.com",
        name: "Dimo Spendesk",
      },
      templateId: "d-de0ffa982d6547da843fa830b19d3a0c",
      dynamicTemplateData: {
        userEmail: user.email,
        lastname: req.body.lastname,
        firstname: req.body.firstname,
        adress: req.body.adress,
        phone: req.body.phone,
        email: req.body.email,
        propertyType: req.body.propertyType,
        propertyYear: req.body.propertyYear,
        diag: req.body.diag,
        offer: req.body.offer,
      },
    });

    res.send({
      message: "Success",
    });
  } catch {
    return res.status(401).send({
      message: "Unauthenticated",
    });
  }
});

module.exports = router;
