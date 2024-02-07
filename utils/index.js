const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateAndSaveRefreshToken = async (user) => {
  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );
  console.log('🚀 ~ generateAndSaveRefreshToken ~ refreshToken:', refreshToken);
  const salt = await bcrypt.genSalt();
  const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
  user.refreshToken = hashedRefreshToken;
  await user.save();
  return refreshToken;
};

// Generate access token
const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

module.exports = {
  generateAccessToken,
  generateAndSaveRefreshToken,
};
