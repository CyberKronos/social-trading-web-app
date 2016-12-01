import React, { PropTypes as T } from 'react'
import {browserHistory, Link} from 'react-router'
import AuthService from 'utils/AuthService'
// import styles from './styles.module.css'
import firebase from 'firebase';
import Forms from 'components/Forms/Forms'
import History from 'components/History/History'

export class Accounts extends React.Component {
  static propTypes = {
    auth: T.instanceOf(AuthService)
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      socialAccs: [],
      profile: props.auth.getProfile()
    }
  }

  componentWillMount() {
    const {profile} = this.state
    let socialAccRef = firebase.database().ref("socialAccounts").orderByChild("userAcc").equalTo(profile.user_id);

    socialAccRef.on("value", function(dataSnapshot) {
      let socialAccs = [];
      dataSnapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();
        if (childData.approved === false) {
          socialAccs.push(childData);
        }
      });
      this.setState({
        socialAccs: socialAccs
      });
    }.bind(this));
  }

  renderLinks(){
    if (this.props.params) {
      return (
        <ul>
          <li><Link to={`/accounts/${this.props.params.accountKey}/forms`}>Set Spots</Link></li>
          <li><Link to={`/accounts/${this.props.params.accountKey}/history`}>History</Link></li>
        </ul>
      );
    } else {
      return (
        <div></div>
      );
    }
  }

  render() {
    const {socialAccs} = this.state
    const socialAccounts = socialAccs.map((account) =>
      <div key={account.profileData.id}>
        <div>{account.profileData.screen_name}</div>
        <div>{account.profileData.name}</div>
        <Link to={`/accounts/${account.profileData.screen_name + "-" + account.accType}`}>
          <img src={account.profileData.profile_image_url_https} />
        </Link>
        <div>{account.accType}</div>
      </div>
    );
    
    return (
      <div>
        <div>{ socialAccounts }</div>
        { this.renderLinks() }
        { this.props.children }
      </div>
    )
  }
}

export default Accounts;
