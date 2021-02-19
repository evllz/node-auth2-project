require("dotenv").config();
const router = require("express").Router();
const bcryp = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const db = require("../users/users-model");
const { isValid } = require("../users/user-services");

router.post("/register", async (req, res) => {
  const credentials = req.body;

  try {
    if (isValid(credentials)) {
      const rounds = process.env.BCRYP_ROUNDS;
      const hash = bcryp.hashSync(credentials.password, rounds);
      credentials.password = hash;
      const user = await db.add(credentials);
      const token = generateToken(user);
      res.status(201).json({ data: user, token });
    } else {
      res.status(400).json({
        message: "username or password missing, or password not alphanumeric",
      });
    }
  } catch (err) {
    res.status(500).json({ meesage: "Internal Error" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!isValid(req.body)) {
      res.status(400).json({
        message: "username or password missing, or password not alphanumeric",
      });
    } else {
      const user = await db.findBy({ username }).first();
      if (user && bcryp.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.status(200).json({ data: user, token });
      } else {
        res.status(401).json({ message: "invalid credentials" });
      }
    }
  } catch (err) {
    res.status(500).json({ message: "User not found" });
  }
});

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.name,
    rolename: user.rolename,
  };
  const options = {
    expressIn: "id",
  };
  const token = jwt.sign(payload, secret, options);
  return token;
}

module.exports = router;
