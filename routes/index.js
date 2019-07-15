const express = require('express');
const app = express();
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/add-post', (req, res) => {
  res.render('add-post');
});

module.exports = router;
