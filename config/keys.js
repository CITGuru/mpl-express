module.exports = {
  mongoURI:
    process.env.DATABASE_URL || "mongodb://localhost:27017/mpl-express-test",
  secret: process.env.JWT_KEY
};
