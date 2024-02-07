const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../../models/user');
const Joi = require('joi');
const {
  generateAccessToken,
  generateAndSaveRefreshToken,
} = require('../../utils');

// validation schema for user
const schemaRegister = Joi.object({
  username: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(6).max(1024).required(),
});

// @route    POST api/register
// @desc     Registration user and create token and refresh token
// @access   Public

router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!(username && password)) {
      res.status(400).send('All input is required');
    }
    const { error } = schemaRegister.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userExits = await User.findOne({ username });

    if (userExits) {
      return res.status(409).send('User Already Exist. Please Login');
    }

    let encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.toLowerCase(), // sanitize
      password: encryptedPassword,
    });

    // Generate the tokens
    const accessToken = generateAccessToken({ userId: user._id });
    const refreshToken = await generateAndSaveRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // should use 'true' in production to send the cookie over HTTPS only
      sameSite: 'strict', // to prevent sending the cookie along with cross-site requests
      maxAge: 24 * 60 * 60 * 1000, // cookie will be removed after 1 day
    });

    // Send the tokens to the client
    res.status(201).json({ accessToken });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
