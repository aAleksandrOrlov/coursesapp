const path = require('path');
const csurf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');

const keys = require('./keys');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const fileMiddleware = require('./middleware/file');

const hbsRegist = require('./hbs-regist');
const routesRegist = require('./routes/routes-regist');

const app = express();
const store = new MongoStore({
  collection: 'sessions',
  uri: keys.MONGODB_URI,
});
hbsRegist(app);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: keys.SECTION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(fileMiddleware.single('avatar'));
app.use(csurf());
app.use(flash());
app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': ["'self'", 'https:'],
        'script-src-elem': [
          "'self'",
          'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js',
          "'unsafe-inline'",
        ],
      },
    },
  })
);
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);

routesRegist(app);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, { useNewUrlParser: true });

    app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
  } catch (err) {
    console.log(err);
  }
}

start();
