const { Router } = require('express');
const auth = require('../middleware/auth');
const Course = require('../models/course');
const router = Router();

const { validationResult } = require('express-validator');
const { courseValidators } = require('../utils/validators');

async function verifyAuthor(req, res) {
  const { author } = await Course.findById(req.params.id).populate(
    'author',
    '_id'
  );
  if (req.user._id.toString() !== author._id.toString())
    return res.redirect('/courses');
}

router.get('/', async (req, res) => {
  const courses = await Course.find().populate('author', 'username');

  res.render('courses', {
    title: 'Courses',
    isCourses: true,
    userId: req.user ? req.user._id.toString() : undefined,
    courses,
  });
});

router.get('/:id', async (req, res) => {
  const { title, price, image } = await Course.findById(req.params.id);

  res.render('course', {
    layout: 'empty',
    title,
    price,
    image,
  });
});

router.get('/:id/edit', auth, async (req, res) => {
  try {
    if (!req.query.allow) return res.redirect('/courses');

    const {
      title,
      price,
      image,
      _id: id,
    } = await Course.findById(req.params.id).populate('author', '_id');

    verifyAuthor(req, res);

    res.render('course-edit', {
      layout: 'empty',
      id,
      title,
      price,
      image,
    });
  } catch (err) {
    console.log(err);
  }
});

router.post('/:id/edit', auth, courseValidators, async (req, res) => {
  const {
    title: title_before,
    price: price_before,
    image: image_before,
  } = await Course.findById(req.params.id).populate('author', '_id');

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status('422').render('course-edit', {
      layout: 'empty',
      id: req.params.id,
      title: title_before,
      price: price_before,
      image: image_before,
      error: errors.array()[0].msg,
    });
  }

  verifyAuthor(req, res);

  const { title, price, image } = req.body;
  await Course.findByIdAndUpdate(req.params.id, {
    title,
    price,
    image,
  });

  res.redirect('/courses');
});

router.post('/:id/remove', auth, async (req, res) => {
  try {
    verifyAuthor(req, res);

    await Course.deleteOne({ _id: req.params.id });
    res.redirect('/courses');
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
