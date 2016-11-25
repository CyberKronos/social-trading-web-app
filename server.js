var express = require('express');
var app = express();
var jwt = require('express-jwt');
var services = require('./services.js');
var passport = require('passport');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
require('dotenv').config();
var firebase = require('firebase');

app.use(bodyParser());
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

if (!process.env.AUTH0_CLIENT_ID || !process.env.AUTH0_SECRET){
  throw 'Make sure you have AUTH0_CLIENT_ID and AUTH0_SECRET in your .env file'
}

var authenticate = jwt({
  secret: new Buffer(process.env.AUTH0_SECRET, 'base64'),
  audience: process.env.AUTH0_CLIENT_ID
});

app.get('/api/login', function(req, res) {
  firebase.auth()
  .signInWithCustomToken(req.query.id_token)
  .catch(function(error) {
    console.log(error);
  });
});

app.get('/api/logout', function(req, res) {
  firebase.auth().signOut()
  .then(function() {
    console.log("Signout Successful");
  }, function(error) {
    console.log(error);
  });
});

app.get('/api/public', function(req, res) {
  res.json({ message: "Hello from a public endpoint! You don't need to be authenticated to see this." });
});

app.get('/api/private', authenticate, function(req, res) {
  res.json({ message: "Hello from a private endpoint! You DO need to be authenticated to see this." });
});

app.get('/api/auth/twitter', passport.authenticate('twitter'));

app.get('/api/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/home', failureRedirect: '/home' }));

app.get('/api/auth/instagram', passport.authenticate('instagram'));

app.get('/api/auth/instagram/callback', passport.authenticate('instagram', { successRedirect: '/home', failureRedirect: '/home' }));

app.listen(3001);
console.log('Listening on http://localhost:3001');
