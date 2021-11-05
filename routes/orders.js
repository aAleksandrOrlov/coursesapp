const { Router } = require('express');
const auth = require('../middleware/auth');
const Order = require('../models/order');
const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      'user.userId': req.user._id,
    }).populate('user.userId');

    res.render('orders', {
      isOrders: true,
      title: 'Orders',
      orders: orders.map((order) => {
        return {
          ...order._doc,
          price: order.courses.reduce((total, c) => {
            return (total += c.count * c.course.price);
          }, 0),
        };
      }),
    });
  } catch (e) {
    console.log(e);
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const user = await req.user.populate('cart.courses.courseId');

    const courses = user.cart.courses.map((course) => ({
      count: course.count,
      course: { ...course.courseId._doc },
    }));

    const order = new Order({
      user: {
        username: req.user.username,
        userId: req.user,
      },
      courses: courses,
    });

    await order.save();
    await req.user.clearCart();

    res.redirect('/orders');
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
