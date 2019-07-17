require('dotenv').config();

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

let transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.USER_,
    pass: process.env.PASS_,
  },
});

router.post('/signup', (req, res, next) => {
  const { username, password, openToOpportunities, mentor, email, name, lastName } = req.body;
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
        name,
        lastName,
        username,
        password: hashPass,
        status: 'Pending Confirmation',
        email,
        confirmationCode,
        openToOpportunities: valueOpportunities,
        mentor: valueMentor,
      });

      newUser.save()
        .then(() => {
          transport.sendMail({
            from: '"Project-02 👻" <"37a6f5540d-35e0ea@inbox.mailtrap.io">',
            to: email,
            subject: 'Registration email',
            text: `Here is your token! ${confirmationCode}
          Click here: http://localhost:3000/auth/confirm/${confirmationCode}`,
            html: `<html>
          <style>
            @import url('https://fonts.googleapis.com/css?family=DM+Serif+Text&display=swap');
            img {
              width: 250px;
              height: auto;
            }

            div {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }

            * {
              font-family: 'DM Serif Text', serif;
            }

          </style>
          <div>
          <h1>Project-02 confirmation email!</h1>
          <h2>Hello, ${username}!</h2>
          <p>Welcome to our community! Please confirm your account by clicking <a href="http://localhost:3000/auth/confirm/${confirmationCode}">here</a></p>
          <p>Great to have you with us! 😻</p>
          </div>
          </html>`,
          })
            .then(info => console.log(info))
            .catch((err) => {
              throw new Error(err);
            })
          res.redirect('/');
        })
        .catch((err) => {
          throw new Error(err);
        });
    });
});

router.get('/login', (req, res, next) => {
  res.render('auth/login');
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  passReqToCallback: true,
  failureFlash: true,
}));

router.get('/github',
  passport.authenticate('github'));

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

module.exports = router;
