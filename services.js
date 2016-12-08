var config = require('./config.json');
var firebase = require('firebase');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter');
var InstagramStrategy = require('passport-instagram');

const fbConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  databaseURL: config.firebase.databaseURL,
  storageBucket: config.firebase.storageBucket,
};
firebase.initializeApp(fbConfig);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new TwitterStrategy({
    consumerKey: config.twitter.consumerKey,
    consumerSecret: config.twitter.consumerSecret,
    callbackURL: "http://localhost:3000/api/auth/twitter/callback",
    userAuthorizationURL: "https://api.twitter.com/oauth/authenticate?force_login=true",
    passReqToCallback: true
  },
  function(req, token, tokenSecret, profile, done) {
    let socialAccData = {
      token: token,
      tokenSecret: tokenSecret,
      profileData: profile._json
    };
    // Store Account in Firebase
    let fbUser = firebase.auth().currentUser;
    if (fbUser) {
      // User is signed in.
      // Create social account key
      let socialAccKey = socialAccData.profileData.screen_name + "-Twitter";
      // Set account type
      socialAccData['accType'] = 'Twitter';
      // Set user account link
      socialAccData['userAcc'] = fbUser.uid;
      // Set account to unapproved
      socialAccData['approved'] = false;
      // Save into Firebase
      let updates = {};
      updates['socialAccounts/' + socialAccKey] = socialAccData;
      updates['accounts/' + fbUser.uid + '/social_accounts/' + socialAccKey] = true;
      firebase.database().ref().update(updates, function() {
        done(null, socialAccData);
      });
    } else {
      console.log('No user is signed in.');
    }
  }
));

passport.use(new InstagramStrategy({
    clientID: config.instagram.clientId,
    clientSecret: config.instagram.clientSecret,
    callbackURL: "http://localhost:3000/api/auth/instagram/callback",
    userAuthorizationURL: "https://www.instagram.com/accounts/login/?force_classic_login",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    let socialAccData = {
      accessToken: accessToken,
      profileData: profile._json.data
    };
    // Store Account in Firebase
  }
));
