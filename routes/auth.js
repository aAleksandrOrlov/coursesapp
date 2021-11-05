const { Router } = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { signupValidators } = require('../utils/validators');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const User = require('../models/user');
const router = Router();

const keys = require('../keys');
const emailReg = require('../emails/registration');
const emailReset = require('../emails/reset');

const transporter = nodemailer.createTransport(
  sendgrid({
    auth: {
      api_key: keys.SENDGRID_API_KEY,
    },
  })
);

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Authorization',
    isLogin: true,
    error: req.flash('error'),
  });
});

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login/#signin');
  });
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidate = await User.findOne({ email });

    if (candidate) {
      if (await bcrypt.compare(password, candidate.password)) {
        req.session.user = candidate;
        req.session.isAuth = true;

        req.session.save((err) => {
          if (err) throw new Error(err);
          res.redirect('/');
        });
      } else {
        req.flash('error', `Wrong password`);
        res.redirect('/auth/login');
      }
    } else {
      req.flash('error', `User with this email doesn't exists`);
      res.redirect('/auth/login');
    }
  } catch (err) {
    console.log(err);
  }
});

router.post('/signup', signupValidators, async (req, res) => {
  try {
    const { name: username, email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.status(422).redirect('/auth/login#signup');
    }

    const user = new User({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      cart: { courses: [] },
    });
    await user.save();

    await transporter.sendMail(emailReg(email, username));
    res.redirect('/auth/login/#signin');
  } catch (err) {
    console.log(err);
  }
});

router.get('/reset', async (req, res) => {
  res.render('auth/reset', {
    title: 'Reset password',
    error: req.flash('error'),
  });
});

router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('error', 'Something went wrong.');
        res.redirect('/auth/reset');
      }

      const token = buffer.toString('hex');
      const { email } = req.body;
      const candidate = await User.findOne({ email });

      if (!candidate) {
        req.flash('error', `User doesn't exist.`);
        res.redirect('/auth/reset');
      } else {
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 1000 * 60 * 60;
        await candidate.save();

        await transporter.sendMail(emailReset(email, token));
        res.redirect('/auth/login/#signin');
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.get('/reset-password/:token', async (req, res) => {
  if (!req.params.token) res.redirect('/');

  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!user) {
      res.flash('error', 'Token is unavailable');
      res.redirect('/auth/login');
    } else {
      res.render('auth/reset-password', {
        layout: 'empty',
        title: 'Reset password',
        token: req.params.token,
        userId: user._id.toString(),
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { userId, token, password } = req.body;

    const user = await User.findOne({
      _id: userId,
      resetToken: token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (user) {
      user.password = await bcrypt.hash(password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;

      await user.save();

      res.redirect('/auth/login');
    } else {
      res.redirect('/auth/login');
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
