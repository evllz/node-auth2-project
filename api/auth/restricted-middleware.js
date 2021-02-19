require("dotenv").config();
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization
      ? req.headers.authorization.split("")[1]
      : "";
    if (token) {
      jwt.verify(token, secret, (err, decodedToken) => {
        if (err) {
          res.status(401).json({ message: "Invalid or missing credentials" });
        } else {
          req.decodedToken = decodedToken;
          next();
        }
      });
    } else {
      res.status(401).json({ message: "Not loged in" });
    }
  } catch (err) {
    res.status(500).json({ message: "Invalid or missing credentials", ...err });
  }
};
