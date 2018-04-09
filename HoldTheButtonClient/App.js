/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Text
} from 'react-native';
import {
  press,
  release,
  getState
} from './api';
import TimeDelta from './TimeDelta';

type Props = {};
type State = {
  pressed: boolean,
  playing: boolean,
  gameStart: number,
  numPlayers: number
};

export default class App extends Component<Props, State> {
  state = {
    numPlayers: 1
  }
  componentDidMount() {
    this.sync();
  }
  componentWillUnmount() {
    clearTimeout(this.refreshTimeout);
  }
  sync() {
    console.log('syncing');
    getState((state) => this.receiveState(state));
  }
  receiveState([gameStart, numPlayers]) {
    clearTimeout(this.refreshTimeout);
    this.setState({ gameStart, numPlayers });
    const now = Date.now();
    if (gameStart > now) {
      this.refreshTimeout = setTimeout(() => this.sync(), gameStart - now);
    }
  }
  render() {
    return (
      <View style={styles.container}>
        <Text>
          {this.state.pressed ? `Playing against ${this.state.numPlayers - 1} others` : 'Press the button to join the next game'}
        </Text>
        <TouchableWithoutFeedback
          onPressIn={() => {
            this.setState({pressed: true});
            press((state) => this.receiveState(state));
          }}
          onPressOut={() => {
            this.setState({pressed: false});
            release((state) => this.receiveState(state));
          }}
        >
          <View style={this.state.pressed ? styles.pressedButton : styles.button}>
            <Text>Button!</Text>
          </View>
        </TouchableWithoutFeedback>
        <Text>{this.state.gameStart > Date.now() && <TimeDelta time={this.state.gameStart} />}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80,
    backgroundColor: '#aaa'
  },
  pressedButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80,
    backgroundColor: '#fcd117'
  }
});
