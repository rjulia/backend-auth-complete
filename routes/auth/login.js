const User = require('../../models/user');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const Joi = require('joi');

const {
  generateAccessToken,
  generateAndSaveRefreshToken,
} = require('../../utils');

//validation schema for user login

const schemaLogin = Joi.object({
  username: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(6).max(1024).required(),
});

// @route    POST api/login
// @desc     Authenticate user & get token
// @access   Public

router.post('/', async (req, res) => {
  // Authenticate User

  const { error } = schemaLogin.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const user = await User.findOne({ username: req.body.username });
  if (user == null) {
    return res.status(400).send('Cannot find user');
  }

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      // User authenticated
      const accessToken = generateAccessToken({ userId: user._id });
      const refreshToken = await generateAndSaveRefreshToken(user);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // should use 'true' in production to send the cookie over HTTPS only
        sameSite: 'strict', // to prevent sending the cookie along with cross-site requests
        maxAge: 24 * 60 * 60 * 1000, // cookie will be removed after 1 day
      });
      res.json({ accessToken });
    } else {
      res.send('Not Allowed');
    }
  } catch {
    res.status(500).send();
  }
});

module.exports = router;
