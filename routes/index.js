const express = require('express');
const app = express();
const User = require('../models/User');
const Opening = require('../models/Opening')
const router = express.Router();
const ensureLogin = require('connect-ensure-login');

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/add-post', (req, res) => {
  res.render('add-post');
});


router.get('/protected', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  res.render('protected');
})

router.get('/add-opening', (req, res) => {
  res.render('add-opening');
})

router.post('/add-opening', (req, res) => {
  const { title, description, company, salary, requirements, type, level, city, latitude, longitude } = req.body;
  const author = req.user._id;
  const location = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };

  const newOpening = new Opening({
    title,
    description,
    company,
    salary,
    location,
    author,
    requirements,
    type,
    level,
    city,
  });

  newOpening.save()
    .then((opening) => res.redirect('/openings'))
    .catch((err) => {
      console.log(err)
    })
});

router.get('/openings', (req, res) => {
  res.render('openings');
});

module.exports = router;

