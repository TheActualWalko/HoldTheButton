// @flow

import React, { Component } from 'react';
import { Text } from 'react-native';

type Props = {
  time: number
};
type State = {
  now: number
};

export default class GameTimer extends Component<Props, State> {
  state = {
    now: Date.now()
  }
  componentDidMount() {
    this.updateInterval = setInterval(() => this.setState({ now: Date.now() }), 97);
  }
  componentWillUnmount() {
    clearInterval(this.updateInterval);
  }
  render() {
    return Math.abs(Math.round((this.props.time - this.state.now)/1000));
  }
}