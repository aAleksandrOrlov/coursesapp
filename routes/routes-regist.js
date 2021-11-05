const homeRoute = require('./home');
const coursesRoute = require('./courses');
const addRoute = require('./add');
const cartRoute = require('./cart');
const ordersRoute = require('./orders');
const authRoute = require('./auth');
const profileRoute = require('./profile');
const errorRoute = require('./404');

function routesRegist(app) {
  app.use('/', homeRoute);
  app.use('/courses', coursesRoute);
  app.use('/add', addRoute);
  app.use('/cart', cartRoute);
  app.use('/orders', ordersRoute);
  app.use('/auth', authRoute);
  app.use('/profile', profileRoute);
  app.use(errorRoute);
}

module.exports = routesRegist;
