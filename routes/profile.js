const { Router } = require('express');
const auth = require('../middleware/auth');
const router = Router();

const { validationResult } = require('express-validator');
const { profileValidators } = require('../utils/validators');

router.get('/', auth, (req, res) => {
  res.render('profile', {
    title: req.user.username,
    isProfile: true,
    user: req.user.toObject(),
    error: req.flash('error'),
  });
});

router.post('/', auth, profileValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.status(422).redirect('/profile');
  }

  try {
    const user = req.user;

    const toChange = {
      username: req.body.name,
    };

    if (req.file) {
      toChange.avatarUrl = req.file.path;
    }

    Object.assign(user, toChange);
    await user.save();

    res.redirect('/profile');
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
