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
  const { title, description, company, salary, requirements, type, level, city, latitude, longitude, link } = req.body;
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
    link
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

router.get('/edit-opening/:openingID', (req, res) => {
  const openingID = req.params.openingID;
  console.log(openingID)
  res.render('edit-opening', { openingID });
})

router.post('/edit-opening/:openingID', (req, res) => {
  const { title, description, company, salary, requirements, type, level, city, latitude, longitude, link } = req.body;
  const author = req.user._id;
  const location = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
  Opening.findByIdAndUpdate({ _id: req.params.openingID }, { title,
    description,
    company,
    salary,
    location,
    author,
    requirements,
    type,
    level,
    city,
    link, })
    .then((opening) => {res.redirect('openings')})
    .catch((err) => console.log(err))
});

router.get('/opening/:openingID', (req, res) => {
  const openingID = req.params.openingID;
  Opening.findById(openingID)
    .then((opening) => {
      res.render('opening', { opening })
    })
    .catch((err) => console.log(err))
});

router.post('/delete-opening/:openingID', (req, res) => {
  const openingID = req.params.openingID;
  Opening.findByIdAndDelete(openingID)
    .then(() => { res.redirect('/') })
    .catch((err) => console.log(err))
})

module.exports = router;
