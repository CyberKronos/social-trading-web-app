import React, { PropTypes as T } from 'react'
import {Button} from 'react-bootstrap'
import Messages from 'components/Messages/Messages'
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
      profile: props.auth.getProfile()
    }
    props.auth.on('profile_updated', (newProfile) => {
      this.setState({profile: newProfile})
    })
  }

  componentDidMount(){
    const { profile } = this.state
    console.log(profile);
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        console.log(user);
      } else {
        console.log('No user is signed in.');
      }
    });
    // fetch('/api/load/profile', {
    //   method: 'POST',
    //   headers: {
    //     "Accept": "application/json",
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify(profile)
    // }).then(response => response.json());
  }

  logout() {
    this.props.auth.logout()
    this.context.router.push('/login');
  }

  render() {
    const { profile } = this.state
    console.log(profile);
    return (
      <div className={styles.root}>
        <h2>Home</h2>
        <p>Welcome {profile.name}!</p>
        <Messages auth={this.props.auth}></Messages>
        <Button><a href="/api/auth/twitter">Add Twitter Acc</a></Button>
        <Button><a href="/api/auth/instagram">Add Instagram Acc</a></Button>
        <Button onClick={this.logout.bind(this)}>Logout</Button>
      </div>
    )
  }
}

export default Home;
