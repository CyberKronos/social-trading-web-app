import React, { PropTypes as T } from 'react'
import {
  Col,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Button,
  HelpBlock
} from 'react-bootstrap'
import firebase from 'firebase';
// import styles from './styles.module.css'

export class Forms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      regOneUrl: '',
      regTwoUrl: '',
      adUrl: '',
    };

    this._onRegOneChange = this._onRegOneChange.bind(this);
    this._onRegTwoChange = this._onRegTwoChange.bind(this);
    this._onAdChange = this._onAdChange.bind(this);
    this._onHandleSubmit = this._onHandleSubmit.bind(this);
  }

  componentWillReceiveProps() {
    this.setState({
      regOneUrl: '',
      regTwoUrl: '',
      adUrl: ''
    });
  }

  _validateUrl(value){
    return /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/gi.test(value);
  }

  // TODO: Condense the change binding events and validation for input form to one function each
  _getRegOneValidState() {
    const { regOneUrl } = this.state;

    if (regOneUrl.length <= 0) return null;
    if (this._validateUrl(regOneUrl)) return 'success';
    else return 'error';
  }

  _getRegTwoValidState() {
    const { regTwoUrl } = this.state;

    if (regTwoUrl.length <= 0) return null;
    if (this._validateUrl(regTwoUrl)) return 'success';
    else return 'error';
  }

  _getAdValidState() {
    const { adUrl } = this.state;

    if (adUrl.length <= 0) return null;
    if (this._validateUrl(adUrl)) return 'success';
    else return 'error';
  }

  _onRegOneChange(event) {
    this.setState({regOneUrl: event.target.value});
  }

  _onRegTwoChange(event) {
    this.setState({regTwoUrl: event.target.value});
  }

  _onAdChange(event) {
    this.setState({adUrl: event.target.value});
  }

  _onHandleSubmit(event) {
    let regOneState = this._getRegOneValidState();
    let regTwoState = this._getRegTwoValidState();
    let adState = this._getAdValidState();

    if (regOneState == 'success' && regTwoState == 'success' && adState == 'success') {
      const { accountKey } = this.props
      // Get a key for a new Spots.
      let newSpotKey = firebase.database().ref().child('spots').push().key;
      // Spot data
      let spotData = {
        socialAccKey: accountKey,
        regOneUrl: this.state.regOneUrl,
        regTwoUrl: this.state.regTwoUrl,
        adUrl: this.state.adUrl,
        approved: false,
        spotKey: newSpotKey,
        submittedAt: firebase.database.ServerValue.TIMESTAMP
      }
      // Write the new spots' data simultaneously in the spots list and the account's spots list.
      let updates = {};
      updates['/spots/' + newSpotKey] = spotData;
      updates['/socialAccounts/' + accountKey + '/latestSpots/'] = spotData;
      // Save into Firebase
      return firebase.database().ref().update(updates);
    } else {
      console.log('Your spots contain invalid urls!');
      event.preventDefault();
      return 'Your spots contain invalid urls!';
    }
  }

  render() {
    return (
      <div>
        <form onSubmit={this._onHandleSubmit}>
          <FormGroup controlId="formRegOneUrl" validationState={this._getRegOneValidState()}>
            <ControlLabel>Reg #1 URL</ControlLabel>
            <FormControl type="text" value={this.state.regOneUrl} placeholder="url" onChange={this._onRegOneChange} />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup controlId="formRegTwoUrl" validationState={this._getRegTwoValidState()}>
            <ControlLabel>Reg #2 URL</ControlLabel>
            <FormControl type="text" value={this.state.regTwoUrl} placeholder="url" onChange={this._onRegTwoChange} />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup controlId="formAdUrl" validationState={this._getAdValidState()}>
            <ControlLabel>Ad URL</ControlLabel>
            <FormControl type="text" value={this.state.adUrl} placeholder="url" onChange={this._onAdChange} />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup>
            <Button type="submit">
              Submit Spots
            </Button>
          </FormGroup>
        </form>
      </div>
    );
  }
}

export default Forms;
