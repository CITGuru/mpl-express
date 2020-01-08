const express = require("express");
var redis = require("redis");
// const bodyParser = require("body-parser");
const cors = require("cors");
const { LiveDB } = require("./db");
const session = require("express-session");
const redisStore = require("connect-redis")(session);
const client = redis.createClient();
require("dotenv").config();

const app = express();
const user = require("./routes/api/user");
const team = require("./routes/api/team");
const fixture = require("./routes/api/fixture");
const rateLimit = require("express-rate-limit");
client.on("error", err => {
  console.log("Redis error: ", err);
});
// Middlewares
// app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// Database
LiveDB.startDB();

// Redis Session Store
app.use(
  session({
    secret: process.env.SECRET,
    // create new redis store.
    store: new redisStore({
      host: "localhost",
      port: 6379,
      client: client,
      ttl: 260
    }),
    saveUninitialized: false,
    resave: false
  })
);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: {
    error: "Too many requests from this IP, please try again after some minutes"
  }
});

app.use("/api/", apiLimiter);

// Routes
app.use("/api/v1/auth", user);
app.use("/api/v1/teams", team);
app.use("/api/v1/fixtures", fixture);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});

app.use((err, req, res, next) => {
  if (err && err.error && err.error.isJoi) {
    const { details } = err.error;
    let message;
    if (details.length == 1) {
      message = details[0].message;
    } else {
      message = details.map(e => {
        return {
          field: e.context.key,
          message: e.message.replace(/['"]/g, "")
        };
      });
    }
    const Error = {
      status: 400,
      error: message
    };
    return res.status(400).json(Error);
  } else {
    // pass on to another error handler
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);

  if (err instanceof URIError) {
    return res.status(400).json({
      status: 400,
      error: `Failed to decode param: ${req.url}`
    });
  }
  return next();
});

app.use("*", (req, res) => {
  res.status(404).json({
    status: 404,
    error: "Sorry, we couldn't find that!"
  });
});
module.exports = app;
