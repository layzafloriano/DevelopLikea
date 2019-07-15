const express = require('express');
const passport = require('passport')
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const bcryptSalt = 10;

router.get('/signup', (req, res, next) => {
  res.render('auth/signup');
})

router.post('/signup', (req, res, next) => {
  const { username, password, openToOpportunities, mentor, email } = req.body;
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let confirmationCode = '';
  for (let i = 0; i < 10; i += 1) {
    confirmationCode += characters[Math.floor(Math.random() * characters.length )];
  }
  if (username === '' || password === '' || email === '') {
    res.render('auth/signup', { message: 'Indicate username and password' });
    return;
  }

  User.findOne({ username })
    .then((user) => {
      if (user !== null) {
        res.render('auth/signup', { message: 'The username already exists' });
        return;
      }


      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      let valueMentor = false;
      let valueOpportunities = false;

      if (mentor === 'on') {
        valueMentor = true;
      }

      if (openToOpportunities === 'on') {
        valueOpportunities = true;
      }

      const newUser = new User({
        username,
        password: hashPass,
        status: 'Pending Confirmation',
        email,
        confirmationCode,
        openToOpportunities: valueOpportunities,
        mentor: valueMentor,
      });

      newUser.save((err) => {
        if (err) {
          res.render('auth/signup', { message: 'Something went wrong' });
        } else {
          res.redirect('/');
        }
      })
    })
    .catch((err) => console.log(err))
});

router.get('/login', (req, res, next) => {
  res.render('auth/login');
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  passReqToCallback: true,
}));

module.exports = router;
