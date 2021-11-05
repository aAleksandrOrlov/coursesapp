const { Router } = require('express');
const auth = require('../middleware/auth');
const Course = require('../models/course');
const router = Router();

async function getCourses(req) {
  const user = await req.user.populate('cart.courses.courseId');

  const courses = user.cart.courses.map((c) => ({
    ...c.courseId._doc,
    id: c.courseId.id,
    count: c.count,
  }));

  return courses;
}

router.post('/add', auth, async (req, res) => {
  const course = await Course.findById(req.body.id);
  await req.user.addToCart(course);

  if (req.body.isFetch) {
    res.status(200).json({
      courses: await getCourses(req),
      csrf: res.locals.csrf,
    });
  } else {
    res.redirect('/cart');
  }
});

router.delete('/remove', auth, async (req, res) => {
  await req.user.removeFromCart(req.body.id);
  res.status(200).json({
    courses: await getCourses(req),
    csrf: res.locals.csrf,
  });
});

router.get('/', auth, async (req, res) => {
  const courses = await getCourses(req);

  let price = 0;
  courses.forEach((course) => (price += course.price * course.count));

  res.render('cart', {
    title: 'Cart',
    isCart: true,
    courses,
    price,
  });
});

module.exports = router;
