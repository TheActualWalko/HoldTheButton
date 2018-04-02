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
  getState,
  registerOnPlayerCount
} from './api';
import TimeDelta from './TimeDelta';

type Props = {};
type State = {
  pressed: boolean,
  playing: boolean,
  gameStart: number,
  playerCount: number
};

export default class App extends Component<Props, State> {
  state = {
    playerCount: 1
  }
  componentDidMount() {
    this.fetchState();
    registerOnPlayerCount((playerCount) => this.setState({ playerCount }));
  }
  fetchState() {
    getState((playing, gameStart) => {
      this.setState({ playing, gameStart });
      clearTimeout(this.fetchTimeout);
      if (!playing) {
        this.fetchTimeout = setTimeout(
          () => this.fetchState(),
          gameStart - Date.now()
        );
      }
    });
  }
  componentWillUnmount() {
    clearTimeout(this.fetchTimeout);
  }
  render() {
    return (
      <View style={styles.container}>
        {
          this.state.playing
            ? <Text>Playing against {this.state.playerCount - 1} others</Text>
            : <Text>Next game in <TimeDelta time={this.state.gameStart} /></Text>
        }
        <TouchableWithoutFeedback
          onPressIn={() => {
            this.setState({pressed: true});
            press();
          }}
          onPressOut={() => {
            this.setState({pressed: false, playing: false});
            release(() => this.fetchState());
          }}
        >
          <View style={this.state.pressed ? styles.pressedButton : styles.button}>
            <Text>
              {this.state.pressed ? 'PRESSED' : 'IDLE'}
            </Text>
          </View>
        </TouchableWithoutFeedback>
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
