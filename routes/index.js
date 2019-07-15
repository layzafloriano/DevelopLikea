/* eslint-disable no-underscore-dangle */
const express = require('express');
const app = express();
const User = require('../models/User');
const Opening = require('../models/Opening');
const Post = require('../models/Post');
const router = express.Router();
const ensureLogin = require('connect-ensure-login');
const uploadCloud = require('../config/cloudinary.js');


router.get('/', (req, res) => {
  // get posts
  Post.find()
    .then((posts) => {
      res.render('index', { posts });
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

  if(req.file) {
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
      console.log(newPost);
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
      console.log(err);
    })
});

router.get('/openings', (req, res) => {
  Opening.find((openings) => {
    res.render('openings', { openings });
  })
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
