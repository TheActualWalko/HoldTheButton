// @flow

import io from 'socket.io-client';
const socket = io('http://sam-watkinson.com:1337');
let onPlayerCount;

export const press = (callback) => socket.emit('press', callback);
export const release = (callback) => socket.emit('release', callback);
export const getState = (callback) => socket.emit('getState', callback);
export const registerOnPlayerCount = (callback) => onPlayerCount = callback;

socket.on('lose', (timeMS) => alert(`you lost after ${(timeMS/1000).toFixed(0)} seconds`, 'Game Over'));
socket.on('win', () => alert('you won!', 'Congratulations!'));
socket.on('playerCount', (playerCount) => onPlayerCount(playerCount));