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
      spotOneUrl: '',
      spotTwoUrl: '',
      adUrl: ''
    };

    this._onSpotOneChange = this._onSpotOneChange.bind(this);
    this._onSpotTwoChange = this._onSpotTwoChange.bind(this);
    this._onAdChange = this._onAdChange.bind(this);
    this._onHandleSubmit = this._onHandleSubmit.bind(this);
  }

  _getValidationState() {
    console.log('valid');
    // const length = this.state.spotOneUrl.length;
    // if (length > 10) return 'success';
    // else if (length > 5) return 'warning';
    // else if (length > 0) return 'error';
  }

  _onSpotOneChange(event) {
    this.setState({spotOneUrl: event.target.value});
  }

  _onSpotTwoChange(event) {
    this.setState({spotTwoUrl: event.target.value});
  }

  _onAdChange(event) {
    this.setState({adUrl: event.target.value});
  }

  _onHandleSubmit(event) {
    // console.log(this.state);
    // event.preventDefault();
    const accountKey = this.props.params.accountKey;
    // Get a key for a new Spots.
    let newSpotKey = firebase.database().ref().child('spots').push().key;
    // Spot data
    let spotData = {
      accountKey: accountKey,
      spotOneUrl: this.state.spotOneUrl,
      spotTwoUrl: this.state.spotTwoUrl,
      adUrl: this.state.adUrl,
      approved: false
    }
    // Write the new spots' data simultaneously in the spots list and the account's spots list.
    let updates = {};
    updates['/spots/' + newSpotKey] = spotData;
    updates['/socialAccounts/' + accountKey + '/spots/' + newSpotKey] = spotData;
    // Save into Firebase
    return firebase.database().ref().update(updates);
  }

  render() {
    console.log(this.state);
    return (
      <Col xs={6} xsOffset={3}>
        <form onSubmit={this._onHandleSubmit}>
          <FormGroup controlId="formSpotOneUrl" validationState={this._getValidationState()}>
            <ControlLabel>Spot #1 URL</ControlLabel>
            <FormControl type="text" value={this.state.spotOneUrl} placeholder="url" onChange={this._onSpotOneChange} />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup controlId="formSpotTwoUrl" validationState={this._getValidationState()}>
            <ControlLabel>Spot #2 URL</ControlLabel>
            <FormControl type="text" value={this.state.spotTwoUrl} placeholder="url" onChange={this._onSpotTwoChange} />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup controlId="formAdUrl" validationState={this._getValidationState()}>
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
      </Col>
    );
  }
}

export default Forms;
