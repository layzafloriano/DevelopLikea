const express = require('express');
const hbs = require('hbs');
const app = express();
const path = require('path');
const indexRoutes = require('./routes/index');

// Config Handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRoutes);
app.listen(3000);