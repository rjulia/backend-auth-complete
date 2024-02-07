require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const token = require('./routes/auth/token');
const login = require('./routes/auth/login');
const logout = require('./routes/auth/logout');
const register = require('./routes/auth/register');

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST'],
  })
);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// app.use('/api/users', users);
app.use('/api/token', token);
app.use('/api/login', login);
app.use('/api/logout', logout);
app.use('/api/register', register);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

// process.on("unhandledRejection", err => {
//   console.error(`An error occurred: ${err.message}`)
//   server.close(() => process.exit(1))
// })
