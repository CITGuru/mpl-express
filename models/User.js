const mongoose = require("mongoose");
const moment = require("moment");

const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    validate: value => {
      if (!validator.isEmail(value)) {
        throw new Error({ error: "Invalid Email address" });
      }
    },
    unique: true
  },
  password: {
    type: String,
    required: true,
    minLength: 7
  },
  is_admin: {
    type: Boolean,
    required: false,
    default: false
  },
  jwt_secret_key: {
    type: String,
    required: false
  },
  created: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre("save", async function(next) {
  // Hash the password before saving the user model
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  user.jwt_secret_key = uuid.v4();

  next();
});

UserSchema.methods.generateAuthTokenKey = async function() {
  // Generate an auth token for the user
  const user = this;
  const token = jwt.sign(
    {
      _id: user._id,
      is_admin: user.is_admin,
      iat: moment().unix(),
      jwt_secret_key: user.jwt_secret_key,
      exp: moment()
        .add(1, "days")
        .unix()
    },
    process.env.JWT_KEY
  );
  // user.tokens = user.tokens.concat({ token });
  // await user.save();
  return token;
};

UserSchema.statics.authWithCredentails = async (email, password) => {
  // Authenticate a user with email and password
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid login credentials");
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error("Invalid login credentials");
  }
  return user;
};
const User = mongoose.model("User", UserSchema);
module.exports = User;
