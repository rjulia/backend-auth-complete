const express = require('express');
const User = require('../../models/user');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { generateAccessToken } = require('../../utils');

// @route    POST api/token
// @desc     Sned token to user
// @access   Public

router.post('/', async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken == null) return res.sendStatus(401);

  const user = await User.findOne({ refreshToken: refreshToken });
  if (!user) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || user._id.toString() !== decoded.userId)
      return res.sendStatus(403);
    const accessToken = generateAccessToken({ userId: user._id });
    res.json({ accessToken: accessToken });
  });
});

module.exports = router;
