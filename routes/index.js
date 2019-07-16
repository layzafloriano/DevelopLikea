/* eslint-disable no-underscore-dangle */
const express = require('express');
const app = express();
const User = require('../models/User');
const Opening = require('../models/Opening');
const Post = require('../models/Post');
const Event = require('../models/Event');

const router = express.Router();
const ensureLogin = require('connect-ensure-login');
const uploadCloud = require('../config/cloudinary.js');
const bcrypt = require('bcrypt');

const bcryptSalt = 10;

router.get('/', (req, res) => {
  // get posts
  Post.find()
    .then((posts) => {
      // get openings
      Opening.find()
        .then((openings) => {
          res.render('index', { openings, posts });
        })
        .catch(err => console.log(err));
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/add-post', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  res.render('add-post');
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
  Post.findById(postId)
    .then((post) => {
      // eslint-disable-next-line eqeqeq
      if (req.user.id == post.authorId) isAuthor = true;
      res.render('post', { post, isAuthor });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/edit-post/:id', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  const postId = req.params.id;
  Post.findById(postId)
    .then((post) => {
      res.render('edit-post', { post });
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

router.get('/add-opening', (req, res) => {
  res.render('add-opening');
})

router.post('/add-opening', (req, res) => {
  const {
    title,
    description,
    company,
    salary,
    requirements, 
    type,
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
    link,
  });

  newOpening.save()
    .then(() => res.redirect('/openings'))
    .catch((err) => {
      console.log(err);
    })
});

router.get('/openings', (req, res) => {
  Opening.find()
    .then(openings => res.render('openings', { openings }))
    .catch((err) => console.log(err))
});

router.get('/edit-opening/:openingID', (req, res) => {
  const openingID = req.params.openingID;
  res.render('edit-opening', { openingID });
})

router.post('/edit-opening/:openingID', (req, res) => {
  const {
    title,
    description,
    company,
    salary,
    requirements,
    type,
    level,
    city,
    latitude,
    longitude,
    link,
  } = req.body;
  const author = req.user._id;
  const location = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
  Opening.findByIdAndUpdate({ _id: req.params.openingID }, {
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
    link,
  })
    .then(() => {res.redirect('openings')})
    .catch(err => console.log(err))
});

router.get('/opening/:openingID', (req, res) => {
  const openingID = req.params.openingID;
  Opening.findById(openingID)
    .then((opening) => {
      res.render('opening', { opening })
    })
    .catch(err => console.log(err))
});

router.post('/delete-opening/:openingID', (req, res) => {
  const openingID = req.params.openingID;
  Opening.findByIdAndDelete(openingID)
    .then(() => { res.redirect('/') })
    .catch(err => console.log(err))
});

router.get('/profile/:userID', (req, res) => {
  const userID = req.params.userID;
  User.findById(userID)
    .then((user) => {
      Post.find()
        .populate(userID)
        .then((post) => {
          res.render('profile', { user, post });
        });
    })
    .catch(err => console.log(err));
});

router.get('/edit-profile/:userID', (req, res) =>{
  const userID = req.params.userID;
  User.findById(userID)
    .then(user => res.render('edit-profile', { userID, user }))
    .catch(err => console.log(err))
});

router.post('/edit-profile/:userID', uploadCloud.single('profile-pic'), (req, res) => {
  const userID = req.params.userID;
  const { username, bio, specialty, mentor, openToOpportunities, city } = req.body;
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
      imagePath: req.file.url,
      imageName: req.file.originalname,
    })
      .then((user) => {
        console.log(user);
        res.render('edit-profile', { user })
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
    })
      .then(user => res.render('edit-profile', { user }))
      .catch(err => console.log(err));
  }
});

router.get('/delete-profile/:userID', (req, res) => {
  const userID = req.params.userID;
  User.findByIdAndDelete(userID)
    .then(() => res.redirect('/auth/signup'))
    .catch(err => console.log(err));
});

router.get('/logout', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  req.logout();
  res.redirect('/');
})

router.get('/add-event', (req, res) => {
  res.render('add-event');
});

router.post('/add-event', uploadCloud.single('event-pic'), (req, res) => {
  const { title, time, city, description, price, latitude, longitude } = req.body;
  const authorID = req.user._id;
  const location = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
  let newEvent;
  if (req.file) {
    newEvent = new Event({
      title,
      time,
      city,
      description,
      price,
      location,
      authorID,
      imageName: req.file.originalname,
      imagePath: req.file.url,
    });
  } else {
    newEvent = new Event({
      title,
      time,
      city,
      description,
      price,
      location,
      authorID,
    });
  }
  newEvent.save()
    .then(() => {
      res.redirect('/');
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.get('/event/:eventID', (req, res) => {
  let eventID = req.params.eventID;
  Event.findById(eventID)
    .then((event) => {
      res.render('event', { event });
    })
    .catch((err) => {
      throw new Error(err);
    })
});

router.get('/events', (req, res) => {
  Event.find()
    .then(events => res.render('events', { events }))
    .catch((err) => {
      throw newError(err);
    });
});

router.get('/edit-event/:eventID', (req, res) => {
  const eventID = req.params.eventID;
  Event.findById(eventID)
    .then(event => res.render('edit-event', { eventID, event }))
    .catch((err) => {
      throw newError(err);
    })
})


router.post('/edit-event/:eventID', uploadCloud.single('event-pic'), (req, res) => {
  const eventID = req.params.eventID;
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

router.get('/delete-event/:eventID', (req, res) => {
  const eventID = req.params.eventID;
  Event.findByIdAndDelete(eventID)
    .then(() => { res.redirect('/events') })
    .catch(err => console.log(err))
});

module.exports = router;
