// Init router
const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const bcrypt = require('bcrypt');

// @route    POST api/logout
// @desc     Delete refreshtoken and logout user
// @access   Public

router.post('/', async (req, res) => {
  const { refreshToken } = req.body;
  // Find the user by their hashed refresh token
  User.findOne()
    .where('refreshToken')
    .ne(null)
    .exec(async (err, user) => {
      if (err || !user) {
        return res.status(400).send('Invalid refresh token');
      }
      // Verify the provided refresh token against the hashed one
      const validToken = await bcrypt.compare(refreshToken, user.refreshToken);
      if (validToken) {
        // Invalidate the refresh token by clearing it from the user document
        user.refreshToken = null;
        await user.save();
        res.status(200).send('Logged out');
      } else {
        res.status(400).send('Invalid refresh token');
      }
    });
});

module.exports = router;
