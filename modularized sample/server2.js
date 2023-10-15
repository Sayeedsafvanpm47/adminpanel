const express = require('express');
const session = require('express-session');
const path = require('path');
const flash = require('express-flash');
const app = express();
const sessionMiddleware = require('./session');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});

app.use(sessionMiddleware);
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/assets/'));
app.use('/user', userRouter); // Use the user router
app.use('/admin', adminRouter); // Use the admin router

app.get('/', (req, res) => {
  if (req.session.isAuth) {
    res.redirect('/user/home');
  } else {
    res.render('./login');
  }
});

app.listen(3000, () => console.log('Server running'));
