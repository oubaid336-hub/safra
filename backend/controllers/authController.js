const { sendEmail } = require('../utils/mailer');
const { buildPasswordResetEmail } = require('../utils/emailTemplates');
const crypto = require('crypto');
﻿const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name,
      email,
      passwordHash,
      verificationToken,
      verificationTokenExpires
    });

    const verifyUrl = `${process.env.BACKEND_URL}/api/auth/verify/${verificationToken}`;
    await sendEmail(
      email,
      'Verify your Safra account',
      `<p>Hi ${name},</p><p>Welcome to Safra! Click below to verify your account:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`
    );

    res.status(201).json({ message: 'Account created, check your email to verify', userId: user._id }); // ADMIN_MARKER_verifyemail
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.isBlocked) { // ADMIN_MARKER_blockcheck
      return res.status(403).json({ message: 'This account has been blocked' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role }, // ADMIN_MARKER_loginfix
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ message: 'Logged in', name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}


async function verifyEmail(req, res) {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return the same message, whether or not the email exists —
    // this prevents attackers from using this endpoint to check which emails are registered.
    const genericMessage = { message: 'If that email is registered, a reset link has been sent.' };

    if (!user) {
      return res.json(genericMessage);
    }

    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    const resetUrl = `${process.env.BACKEND_URL}/api/auth/reset-password/${resetPasswordToken}`;
    await sendEmail(
      user.email,
      'Reset your Safra password',
      buildPasswordResetEmail({ name: user.name, resetUrl })
    );

    res.json(genericMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' }); // ADMIN_MARKER_resetpassword
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

module.exports = { signup, login, verifyEmail, forgotPassword, resetPassword };

async function me(req, res) {
  try {
    const user = await User.findById(req.user.userId).select(
      '-passwordHash -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out' });
}

module.exports.me = me;
module.exports.logout = logout;
