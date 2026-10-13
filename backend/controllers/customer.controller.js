const bcrypt = require('bcrypt');
const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

const EMAIL_REGEX = /^[a-zA-Z0-9_%+-]+(\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : email;
}

async function register(req, res) {
  const fullName = typeof req.body.fullName === 'string' ? req.body.fullName.trim() : req.body.fullName;
  const email = normalizeEmail(req.body.email);
  const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : req.body.phone;
  const { password } = req.body;

  if (!fullName || !email || !password || !phone) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address' });
  }

  if (!PHONE_REGEX.test(phone)) {
    return res.status(400).json({ success: false, message: 'Enter a valid 10-digit phone number' });
  }

  if (password.length < 6 || password.length > 72) {
    return res.status(400).json({ success: false, message: 'Password must be between 6 and 72 characters' });
  }

  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const customer = await Customer.create({
    fullName,
    email,
    password: hashedPassword,
    phone,
  });

  return res.status(201).json({
    success: true,
    message: 'Customer registered successfully',
    customer: {
      _id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
    },
  });
}

async function login(req, res) {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const customer = await Customer.findOne({ email });
  if (!customer) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, customer.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  generateToken(res, customer._id);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
  });
}

async function getMe(req, res) {
  return res.status(200).json(req.user);
}

async function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Old and new password are required' });
  }

  if (newPassword.length < 6 || newPassword.length > 72) {
    return res.status(400).json({ success: false, message: 'Password must be between 6 and 72 characters' });
  }

  const customer = await Customer.findById(req.user._id);

  const isMatch = await bcrypt.compare(oldPassword, customer.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Old password is incorrect' });
  }

  customer.password = await bcrypt.hash(newPassword, 10);
  await customer.save();

  return res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
}

module.exports = {
  register,
  login,
  getMe,
  logout,
  changePassword,
};
