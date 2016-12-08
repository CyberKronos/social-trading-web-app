import React, { PropTypes as T } from 'react'
import { browserHistory, Router, Route, Redirect, Link } from 'react-router'
import { Button } from 'react-bootstrap'
import Messages from 'components/Messages/Messages'
import Accounts from 'components/Accounts/Accounts'
import AuthService from 'utils/AuthService'
import styles from './styles.module.css'
import firebase from 'firebase';

export class Home extends React.Component {
  static contextTypes = {
    router: T.object
  }

  static propTypes = {
    auth: T.instanceOf(AuthService)
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      profile: props.auth.getProfile(),
      approvalStatus: true,
    }
    props.auth.on('profile_updated', (newProfile) => {
      this.setState({
        profile: newProfile
      });
    });
  }

  componentWillMount(){
    const {profile} = this.state

    // Check if user is logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        console.log(user);
      } else {
        console.log('No user is signed in.');
      }
    });

    // Check if user is approved
    const userId = profile.user_id;
    const userRef = firebase.database().ref('accounts/' + userId);
    userRef.on('value', function(snapshot) {
      const approvalStatus = snapshot.val().approved
      this.setState({
        approvalStatus: approvalStatus
      });
    }.bind(this));
  }

  _logout() {
    this.props.auth.logout()
    this.context.router.push('/login');
  }

  approvalRender() {
    const { approvalStatus } = this.state
    if (!approvalStatus) {
      return (
        <p>Your account is still pending to be approved. You will not be able to trade until then. We will send you an email when your account is ready.</p>
      );
    } else {
      return (
        <div>
        <Button><a href="/api/auth/twitter">Add Twitter Acc</a></Button>
        {/* <Button><a href="/api/auth/instagram">Add Instagram Acc</a></Button> */}
        </div>
      );
    }
  }

  render() {
    const { profile } = this.state
    console.log(this.state);
    return (
      <div className={styles.root}>
        <Accounts auth={this.props.auth}></Accounts>
        <h2>Home</h2>
        <p>Welcome {profile.name}!</p>
        {this.approvalRender()}
        {/* <Messages auth={this.props.auth}></Messages> */}
        <Button onClick={this._logout.bind(this)}>Logout</Button>
      </div>
    );
  }
}

export default Home;
