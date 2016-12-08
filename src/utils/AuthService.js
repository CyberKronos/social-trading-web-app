import { EventEmitter } from 'events'
import { isTokenExpired } from './jwtHelper'
import Auth0Lock from 'auth0-lock'
import Auth0 from 'auth0-js'
import { browserHistory } from 'react-router'
import firebase from 'firebase';

export default class AuthService extends EventEmitter {
  constructor(clientId, domain) {
    super()
    // Configure Auth0
    this.lock = new Auth0Lock(clientId, domain, {
      auth: {
        redirectUrl: `${window.location.origin}/login`,
        responseType: 'token'
      },
      allowedConnections: ['Username-Password-Authentication']
    })
    this.auth0 = new Auth0({ domain : domain, clientID: clientId})
    // Add callback for lock `authenticated` event
    this.lock.on('authenticated', this._doAuthentication.bind(this))
    // Add callback for lock `authorization_error` event
    this.lock.on('authorization_error', this._authorizationError.bind(this))
    // binds login functions to keep this context
    this.login = this.login.bind(this)
  }

  _doAuthentication(authResult){
    // Saves the user token
    this.setToken(authResult.idToken)
    // Async loads the user profile data
    this.lock.getProfile(authResult.idToken, (error, profile) => {
      if (error) {
        console.log('Error');
        console.log('Error loading the Profile', error)
      } else {
        console.log(profile);
        this.setProfile(profile);

        // Set the options to retreive a firebase delegation token
        const options = {
          id_token : authResult.idToken,
          api : 'firebase',
          scope : 'openid name email displayName',
          target: '1SXC37RsAmHGLPVw9hXDl6x2b3TuXy47'
        };

        // Make a call to the Auth0 '/delegate'
        this.auth0.getDelegationToken(options, function(err, result) {
          if(!err) {
            // Saves the delegation token
            localStorage.setItem('del_token', result.id_token);
            // Exchange the delegate token for a Firebase auth token
            firebase.auth().signInWithCustomToken(result.id_token)
            .then(function() {
              // Store user account into Firebase
              const usersRef = firebase.database().ref('accounts/');
              usersRef.child(profile.user_id).once('value', function(snapshot) {
                if (snapshot.val() === null) {
                  profile['approved'] = false;
                  usersRef.child(profile.user_id).set(profile);
                  console.log('user has been stored in the database');
                } else {
                  console.log('user is already in the database');
                }
              });
            })
            .catch(function(error) {
              console.log(error);
            });
          }
        });
        // Login from server
        this.serverLogin();
        // navigate to the home route
        browserHistory.replace('/home');
      }
    })
  }

  _authorizationError(error){
    // Unexpected authentication error
    console.log('Authentication Error', error)
  }

  login() {
    // Call the show method to display the widget.
    this.lock.show()
  }

  serverLogin() {
    // Checks if there is a saved token and it's still valid from server
    let url = "/api/login";
    let id_token = localStorage.getItem('del_token');
    let query = { id_token: id_token };
    let params = Object.keys(query)
                       .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(query[key]))
                       .join("&")
                       .replace(/%20/g, "+");
    fetch(url + "?" + params)
    .then(res => res.json())
    .then(function(res) {
      if (res.code == "auth/invalid-custom-token") {
        console.log(res.code);
      } else {
        console.log('Server logged in successfully.');
      }
    });
  }

  loggedIn(){
    // Checks if there is a saved token and it's still valid from client
    const token = this.getToken()
    return !!token && !isTokenExpired(token)
  }

  setProfile(profile){
    // Saves profile data to localStorage
    localStorage.setItem('profile', JSON.stringify(profile))
    // Triggers profile_updated event to update the UI
    this.emit('profile_updated', profile)
  }

  getProfile(){
    // Retrieves the profile data from localStorage
    const profile = localStorage.getItem('profile')
    return profile ? JSON.parse(localStorage.profile) : {}
  }

  setToken(idToken){
    // Saves user token to localStorage
    localStorage.setItem('id_token', idToken)
  }

  getToken(){
    // Retrieves the user token from localStorage
    return localStorage.getItem('id_token')
  }

  logout(){
    // Clear user token and profile data from localStorage
    localStorage.removeItem('id_token');
    localStorage.removeItem('del_token');
    localStorage.removeItem('profile');

    // Logout from client
    firebase.auth().signOut().then(function(res) {
      console.log("Signout Successful")
    }, function(error) {
      console.log(error);
    });

    // Logout from server
    fetch('/api/logout')
    .then(res => res.json())
    .then(res => console.log(res.message));
  }

  _checkStatus(response) {
    // raises an error in case response status is not a success
    if (response.status >= 200 && response.status < 300) {
      return response
    } else {
      var error = new Error(response.statusText)
      error.response = response
      throw error
    }
  }

  fetch(url, options){
    // performs api calls sending the required authentication headers
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }

    if (this.loggedIn()){
      headers['Authorization'] = 'Bearer ' + this.getToken()
    }

    return fetch(url, {
      headers,
      ...options
    })
    .then(this._checkStatus)
    .then(response => response.json())
  }
}
