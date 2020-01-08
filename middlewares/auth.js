const moment = require("moment");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const keys = require("../config/keys");

class Authentication {
  static async authenticate(req, res, next) {
    const response = await Authentication.authRequestToken(req);
    if (response.status && response.status !== 200) {
      return res.status(response.status).send({ error: response.message });
    }
    req.id = response.id;
    req.is_admin = response.is_admin;
    req.user = response.user;

    return next();
  }

  static async isAdmin(req, res, next) {
    if (req.is_admin !== true) {
      return res.status(401).send({ error: "Authorized for only admins" });
    }
    return next();
  }

  /** Create a JWT
   * @param user
   */

  static async signJwt(user) {
    return await user.generateAuthTokenKey();
  }

  static decodeJwt(token) {
    let payload = null;
    try {
      payload = jwt.decode(token, keys.secret);
    } catch (err) {
      throw err;
    }
    return payload;
  }

  static async getCurrentUserId(token) {
    const data = this.decodeJwt(token);
    const user = await User.findOne({
      _id: data._id,
      jwt_secret_key: data.jwt_secret_key
    });
    if (!user) {
      throw new Error();
    }
    data["user"] = user;
    return data;
  }

  static async authRequestToken(req) {
    let response = {};
    if (!req.headers.authorization) {
      response.status = 401;
      response.message =
        "Please make sure you send a request with authorization header";
      return response;
    }
    const auth_token = req.headers.authorization.split(" ");
    const token = auth_token[1];
    const type = auth_token[0];
    let payload;
    switch (type) {
      case "Bearer":
        try {
          payload = await Authentication.getCurrentUserId(token);
        } catch (err) {
          response.status = 401;
          response.message =
            "There seems to be an error while authenticating the token";
          return response;
        }
        break;
      default:
        response.status = 401;
        response.message = "Invalid auth token type. Type must be Bearer";
        return response;
    }
    if (!payload) {
      response.status = 401;
      response.message = "Authorization Denied. Check authentication token";
      return response;
    }

    if (payload.exp <= moment().unix()) {
      response.status = 401;
      response.message = "Token has expired";
      return response;
    }
    return payload;
  }
}
module.exports = Authentication;
