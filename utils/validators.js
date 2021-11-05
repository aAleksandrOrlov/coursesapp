const { body } = require('express-validator');
const User = require('../models/user');

exports.signupValidators = [
  body('email', 'Email is not valid.')
    .isEmail()
    .normalizeEmail()
    .custom(async (value) => {
      const candidate = await User.findOne({ email: value });
      if (candidate) {
        return Promise.reject('User with this email already exists');
      }

      return true;
    }),

  body(
    'password',
    `Password's length can't be less than 6 symbols and more than 56`
  )
    .trim()
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric(),

  body('confirm')
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error(`Passwords doesn't match`);
      return true;
    }),

  body('name', `Name's lenght can't be less than 3 symbols`).trim().isLength({
    min: 3,
  }),
];

exports.courseValidators = [
  body('title', 'Min title length is 3 symbols').trim().isLength({ min: 3 }),
  body('price', 'Enter correct price').trim().isNumeric(),
  body('image', 'Enter correct image URL').trim().isURL(),
];

exports.profileValidators = [
  body('name', `Name's lenght can't be less than 3 symbols`).trim().isLength({
    min: 3,
  }),
];
