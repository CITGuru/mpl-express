const express = require("express");
const User = require("../../models/User");
const validator = require("../../validation/validator");
const {
  createUserAdminSchema,
  createUserSchema,
  userLoginSchema
} = require("../../validation/schema");

const router = express.Router();

const auth = require("../../middlewares/auth");

router.post(
  "/register/user",
  validator.body(createUserSchema, { convert: true }),
  async (req, res) => {
    // Create a new user
    try {
      const foundUser = await User.findOne({ email: req.body.email });
      if (foundUser) {
        res.status(400).send({ error: "Email is already in use." });
      }
      const user = new User(req.body);
      await user.save();
      const token = await user.generateAuthTokenKey();
      const response = {
        token,
        id: user.id,
        name: user.name,
        is_admin: user.is_admin,
        email: user.email
      };
      res.status(201).send(response);
    } catch (error) {
      // console.log(error);
      res.status(400).send(error);
    }
  }
);

router.post(
  "/register/admin",
  validator.body(createUserAdminSchema, { passError: true }),
  async (req, res) => {
    // Create a new user
    try {
      const foundUser = await User.findOne({ email: req.body.email });
      if (foundUser) {
        res.status(400).send({ error: "Email is already in use." });
      }
      const user = new User(req.body);
      await user.save();
      const token = await user.generateAuthTokenKey();
      const response = {
        token,
        id: user.id,
        name: user.name,
        is_admin: user.is_admin,
        email: user.email
      };
      res.status(201).send(response);
    } catch (error) {
      res.status(400).send(error);
    }
  }
);

router.post(
  "/login",
  validator.body(userLoginSchema, { convert: true }),
  async (req, res) => {
    // console.log(req);
    //Login a registered user
    try {
      const { email, password } = req.body;
      const user = await User.authWithCredentails(email, password);
      // console.log(user);
      if (!user) {
        return res
          .status(401)
          .send({ error: "Login failed! Check login credentials" });
      }
      const token = await user.generateAuthTokenKey();
      const response = {
        token,
        id: user.id,
        name: user.name,
        is_admin: user.is_admin,
        email: user.email
      };
      res.send(response);
    } catch (error) {
      res.status(400).send({ error: error.toString() });
    }
  }
);

router.post("/logout", [auth.authenticate], async (req, res) => {
  //Login a registered user
  // console.log(req.id);
  res.send({ success: true });
});

module.exports = router;
