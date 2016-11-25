import React from 'react'
import ReactDOM from 'react-dom'

import 'bootstrap/dist/css/bootstrap.css'
import './app.css'

import App from 'containers/App/App'

import {browserHistory} from 'react-router'
import makeRoutes from './routes'

import firebase from 'firebase';
import config from '../config.json';

const fbConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  databaseURL: config.firebase.databaseURL,
  storageBucket: config.firebase.storageBucket,
};
firebase.initializeApp(fbConfig);

const routes = makeRoutes()

const mountNode = document.querySelector('#root');
ReactDOM.render(
  <App history={browserHistory}
        routes={routes} />,
mountNode);
