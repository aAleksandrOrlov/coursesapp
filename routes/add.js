const { Router } = require('express');
const auth = require('../middleware/auth');
const Course = require('../models/course');
const router = Router();

const { validationResult } = require('express-validator');
const { courseValidators } = require('../utils/validators');

router.get('/', auth, (req, res) => {
  res.render('add', {
    title: 'Add new course',
    isAdd: true,
  });
});

router.post('/', auth, courseValidators, async (req, res) => {
  const { title, price, image } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status('422').render('add', {
      title: 'Add new course',
      isAdd: true,
      error: errors.array()[0].msg,
      data: {
        title,
        price,
        image,
      },
    });
  }

  const course = new Course({ title, price, image, author: req.user });

  try {
    await course.save();
    res.redirect('/courses');
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
