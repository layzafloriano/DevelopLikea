/* eslint-disable no-underscore-dangle */
require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
const passport     = require('passport');
const axios        = require('axios');
const LocalStrategy= require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const bcrypt       = require('bcrypt');
const User = require('./models/User')
const session      = require("express-session");
const MongoStore   = require('connect-mongo')(session);
const flash        = require('connect-flash');
const index        = require('./routes/index');
const authRoutes = require('./routes/authentication');
// const eventRoutes = require('./routes/events')

const app = express();

app.use(favicon(path.join(__dirname, 'public', 'develop.ico')));

// config Mongoose
mongoose
  .connect(process.env.MONGODB_URI, {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

// Config Handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

hbs.registerPartials(`${__dirname  }/views/partials`);

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());

// config hbs e favicon
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
// app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// express session config
app.use(session({
  secret: "project-02",
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}));

app.use(passport.initialize());
app.use(passport.session());

// user serialization
passport.serializeUser((user, cb) => {
  cb(null, user._id);
});
  
passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

passport.use(new LocalStrategy({
  passReqToCallback: true
}, (req, username, password, next) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: req.flash('Incorrect username') });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: 'Incorrect password' });
    }
    console.log('session:', user);
    return next(null, user);
  });
}));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://127.0.0.1:3000/auth/github/callback',
},
(accessToken, refreshToken, profile, done) => {
  console.log(profile);
  User.findOne({ githubId: profile.id })
    .then((user) => {
      if (user) {
        return done(null, user);
      }
      const newUser = new User({
        githubId: profile.id,
        name: profile._json.name,
        imagePath: profile.photos[0].value,
        imageName: 'Github Image',
      });
      newUser.save()
        .then((user) => {
          done(null, newUser);
        });
    })
    .catch(err => console.log(err));
}));

app.use('/', index);

app.use('/auth', authRoutes);

// app.use('/event', eventRoutes);

module.exports = app;

app.listen(process.env.PORT);
