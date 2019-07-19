/* eslint-disable no-underscore-dangle */
const express = require('express');
const app = express();
const flash = require('connect-flash');
const router = express.Router();
const bcrypt = require('bcrypt');
// const geocoder = new google.maps.Geocoder();
const axios = require('axios');
const ensureLogin = require('connect-ensure-login');
const uploadCloud = require('../config/cloudinary.js');
const User = require('../models/User');
const Opening = require('../models/Opening');
const Post = require('../models/Post');
const Event = require('../models/Event');

const bcryptSalt = 10;


router.get('/', (req, res) => {
  let idUser = null;
  if (req.user) {
    idUser = req.user.id;
  }
  // get posts
  Post.find()
    .then((post) => {
      const posts = post.reverse();
      // get openings
      Opening.find().limit(3)
        .then((openings) => {
          // get user details
          User.findById(idUser)
            .then((user) => {
              // get events
              Event.find().limit(3)
                .then((events) => {
                  res.render('index', { openings, posts, user, events, idUser });
                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/add-post', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  let idUser = null;
  if (req.user) {
    idUser = req.user.id;
  }
  res.render('add-post', { idUser });
});

router.post('/add-post', ensureLogin.ensureLoggedIn('/auth/login'), uploadCloud.single('photo'), (req, res) => {
  const { title, text } = req.body;
  const authorId = req.user._id;
  let imagePath = null;
  let imageName = null;

  if (req.file) {
    imagePath = req.file.url;
    imageName = req.file.originalname;
  }

  const newPost = new Post({
    title,
    text,
    authorId,
    imagePath,
    imageName,
  });

  newPost.save()
    .then(() => {
      res.redirect('/');
    })
    .catch((err) => {
      console.log(err);
    });
});
router.get('/post/:id', (req, res) => {
  const postId = req.params.id;
  let isAuthor = false;
  let idUser = null;
  if (req.user) idUser = req.user.id;
  Post.findById(postId)
    .then((post) => {
      // eslint-disable-next-line eqeqeq
      if (idUser == post.authorId) isAuthor = true;
      res.render('post', { post, isAuthor });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/edit-post/:id', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  const postId = req.params.id;
  let idUser = null;
  if (req.user) {
    idUser = req.user.id;
  }
  Post.findById(postId)
    .then((post) => {
      res.render('edit-post', { post, idUser });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post('/edit-post/:id', ensureLogin.ensureLoggedIn('/auth/login'), uploadCloud.single('photo'), (req, res) => {
  const postId = req.params.id;
  const {
    title, text,
  } = req.body;

  if (req.file) {
    const imagePath = req.file.url;
    const imageName = req.file.originalname;

    Post.findByIdAndUpdate(postId, {
      title, text, imagePath, imageName,
    })
      .then(() => {
        res.redirect(`/post/${postId}`);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    Post.findByIdAndUpdate(postId, {
      title, text,
    })
      .then(() => {
        res.redirect(`/post/${postId}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

router.get('/delete-post/:id', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  const postId = req.params.id;
  Post.findByIdAndDelete(postId)
    .then(() => {
      res.redirect('/');
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/add-opening', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  let idUser = null;
  if (req.user) {
    idUser = req.user.id;
  }
  res.render('add-opening', { idUser });
})

router.post('/add-opening', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  const {
    title,
    description,
    company,
    salary,
    requirements,
    type,
    level,
    city,
    specialty,
    latitude,
    longitude,
    link,
  } = req.body;
  const author = req.user._id;
  const location = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };

  const newOpening = new Opening({
    title,
    description,
    company,
    salary,
    location,
    author,
    requirements,
    specialty,
    type,
    level,
    city,
    link,
  });

  newOpening.save()
    .then(() => res.redirect('/openings'))
    .catch((err) => {
      console.log(err);
    });
});

router.get('/openings', (req, res) => {
  let idUser = null;
  if (req.user) {
    idUser = req.user.id;
  }
  Opening.find()
    .then(openings => res.render('openings', { openings, idUser }))
    .catch(err => console.log(err));
});

router.get('/edit-opening/:openingID', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  const { openingID } = req.params;
  let idUser = null;
  if (req.user) {
    idUser = req.user.id;
  }
  Opening.findById(openingID)
    .then((opening) => {
      console.log(opening)
      res.render('edit-opening', { opening, idUser });
    })
    .catch(err => console.log(err));
});

router.post('/edit-opening/:openingID', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  const { openingID } = req.params;
  const {
    title,
    description,
    company,
    salary,
    requirements,
    type,
    specialty,
    level,
    city,
    latitude,
    longitude,
    link,
  } = req.body;
  const author = req.user._id;
  const location = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };

  Opening.findByIdAndUpdate(openingID, {
    title,
    description,
    company,
    salary,
    location,
    specialty,
    author,
    requirements,
    type,
    level,
    city,
    link,
  })
    .then(() => { res.redirect('/openings'); })
    .catch(err => console.log(err));
});

router.get('/opening/:openingID', (req, res) => {
  const { openingID } = req.params;
  let idUser = null;
  let isOwner = false;
  if (req.user) {
    idUser = req.user.id;
  }
  Opening.findById(openingID)
    .then((opening) => {
      if (idUser == opening.author) isOwner = true;
      res.render('opening', { opening, idUser, isOwner });
    })
    .catch(err => console.log(err));
});

router.get('/delete-opening/:openingID', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  const { openingID } = req.params;
  Opening.findByIdAndDelete(openingID)
    .then(() => { res.redirect('/'); })
    .catch(err => console.log(err));
});

router.get('/profile/:userID', (req, res) => {
  const { userID } = req.params;
  let idUser = null;
  if (req.user) {
    idUser = req.user.id;
  }
  let isOwner = false;
  User.findById(userID)
    .then((user) => {
      Post.find({ authorId: userID })
        .then((post) => {
          if (req.user.id === userID) isOwner = true;
          res.render('profile', { user, post, isOwner, idUser });
        });
    })
    .catch(err => console.log(err));
});

router.get('/edit-profile/:userID', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  const { userID } = req.params;
  let idUser = null;
  if (req.user) {
    idUser = req.user.id;
  }
  User.findById(userID)
    .then(user => res.render('edit-profile', { userID, user, idUser }))
    .catch(err => console.log(err));
});

router.post('/edit-profile/:userID', ensureLogin.ensureLoggedIn('/auth/login'), uploadCloud.single('profile-pic'), (req, res) => {
  const { userID } = req.params;
  const { username, bio, specialty, mentor, openToOpportunities, city, linkedin, twitter, github } = req.body;
  let valueMentor = false;
  let valueOpportunities = false;

  if (mentor === 'on') {
    valueMentor = true;
  }

  if (openToOpportunities === 'on') {
    valueOpportunities = true;
  }

  if (req.file) {
    User.findByIdAndUpdate(userID, {
      username,
      bio,
      specialty,
      valueMentor,
      valueOpportunities,
      city,
      linkedin,
      twitter,
      github,
      imagePath: req.file.url,
      imageName: req.file.originalname,
    })
      .then((user) => {
        console.log(user);
        res.render('edit-profile', { user });
      })
      .catch(err => console.log(err));
  } else {
    User.findByIdAndUpdate(userID, {
      username,
      bio,
      specialty,
      valueMentor,
      valueOpportunities,
      city,
      linkedin,
      twitter,
      github,
    })
      .then(user => res.render('edit-profile', { user }))
      .catch(err => console.log(err));
  }
});

router.get('/delete-profile/:userID', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  const { userID } = req.params;
  User.findByIdAndDelete(userID)
    .then(() => res.redirect('/auth/signup'))
    .catch(err => console.log(err));
});

router.get('/logout', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/add-event', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  let idUser = null;
  if (req.user) {
    idUser = req.user.id;
  }
  res.render('add-event', { idUser });
});

router.post('/add-event', uploadCloud.single('event-pic'), ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  const { title, date, city, description, price, latitude, longitude, time } = req.body;
  const authorID = req.user._id;
  const location = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
  let newEvent;
  if (req.file) {
    newEvent = new Event({
      title,
      date,
      city,
      description,
      price,
      location,
      authorID,
      time,
      imageName: req.file.originalname,
      imagePath: req.file.url,
    });
  } else {
    newEvent = new Event({
      title,
      date,
      city,
      description,
      price,
      location,
      authorID,
      time,
    });
  }
  newEvent.save()
    .then(() => {
      res.redirect('/events');
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.get('/event/:eventID', (req, res) => {
  const { eventID } = req.params;
  const API = process.env.API_KEY_GOOGLE;
  let idUser = null;
  let isOwner = null;
  if (req.user) idUser = req.user.id;
  Event.findById(eventID)
    .then((event) => {
      if (idUser == event.authorID) isOwner = true;
      res.render('event', { event, idUser, isOwner, API });
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.get('/events', (req, res) => {
  let idUser = null;
  if (req.user) {
    idUser = req.user.id;
  }
  Event.find()
    .then(events => res.render('events', { events, idUser }))
    .catch((err) => {
      throw newError(err);
    });
});

router.get('/edit-event/:eventID', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  const { eventID } = req.params;
  let idUser = null;
  if (req.user) {
    idUser = req.user.id;
  }
  Event.findById(eventID)
    .then(event => res.render('edit-event', { eventID, event, idUser }))
    .catch((err) => {
      throw newError(err);
    })
})


router.post('/edit-event/:eventID', ensureLogin.ensureLoggedIn('/auth/login'), uploadCloud.single('event-pic'), (req, res) => {
  const { eventID } = req.params;
  const { title, time, city, description, price, latitude, longitude } = req.body;
  const location = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };

  if (req.file) {
    Event.findByIdAndUpdate(eventID, {
      title,
      time,
      city,
      description,
      price,
      location,
      imageName: req.file.originalname,
      imagePath: req.file.url,
    })
      .then(() => res.redirect('/events'))
      .catch((err) => {
        throw new Error(err);
      });
  } else {
    Event.findByIdAndUpdate(eventID, {
      title,
      time,
      city,
      description,
      price,
      location,
    })
      .then(() => res.redirect('/events'))
      .catch((err) => {
        throw new Error(err);
      });
  }
});

router.get('/delete-event/:eventID', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  const { eventID } = req.params;
  Event.findByIdAndDelete(eventID)
    .then(() => { res.redirect('/events') })
    .catch(err => console.log(err))
});

router.get('/network', (req, res) => {
  let idUser = null;
  if (req.user) {
    idUser = req.user.id;
  }
  User.find()
    .then(users => res.render('directory', { users, idUser }))
    .catch((err) => {
      throw newError(err);
    });
});

router.post('/api', (req, res) => {
  const { eventId } = req.body;
  Event.findById(eventId)
    .then((place) => {
      res.status(200).json({ place });
    })
    .catch((err) => {
      throw new Error(err)
    })
});

module.exports = router;
