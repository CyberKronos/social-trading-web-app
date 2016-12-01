import React, { PropTypes as T } from 'react'
import firebase from 'firebase';
// import styles from './styles.module.css'

export class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spotsHistory: []
    };
  }

  componentWillMount() {
    const { accountKey } = this.props.params
    console.log(accountKey);
    let spotsRef = firebase.database().ref("spots").orderByChild("socialAccKey").equalTo(accountKey);

    spotsRef.on("value", function(dataSnapshot) {
      let spotsHistory = [];
      dataSnapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();
        spotsHistory.push(childData);
      });
      this.setState({
        spotsHistory: spotsHistory
      });
    }.bind(this));
  }

  componentWillReceiveProps() {
    const { accountKey } = this.props.params
    let spotsRef = firebase.database().ref("spots").orderByChild("socialAccKey").equalTo(accountKey);

    spotsRef.on("value", function(dataSnapshot) {
      let spotsHistory = [];
      dataSnapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();
        spotsHistory.push(childData);
      });
      this.setState({
        spotsHistory: spotsHistory
      });
    }.bind(this));
  }

  render() {
    const { spotsHistory } = this.state;
    const allSpots = spotsHistory.map((spots) =>
      <div key={spots.spotKey}>
        <div>Reg #1 Spot: {spots.regOneUrl}</div>
        <div>Reg #2 Spot: {spots.regTwoUrl}</div>
        <div>Ad Spot: {spots.adUrl}</div>
        <div>Approved? {spots.approved}</div>
        <div>Submitted At: {new Date(spots.submittedAt).toString()}</div>
        <br></br>
      </div>
    );

    return (
      <div>{allSpots}</div>
    );
  }
}

export default History;
