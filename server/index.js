const GAME_TIME_INTERVAL = 10000

const app = require('http').createServer((req, res) => { res.end('okay'); });
const io = require('socket.io')(app);
app.listen(1337);

let nextGame;
const gamesByPlayerID = {};
const socketsByPlayerID = {};

const getState = (playerID) => {
  const game = gamesByPlayerID[playerID] || nextGame;
  const numPlayers = getPlayerIDs(game).length;
  return [ game, numPlayers ];
}

const getPlayerIDs = (game) => Object
  .keys(gamesByPlayerID)
  .filter((playerID) => gamesByPlayerID[playerID] === game);

io.on('connection', (socket) => {
  const playerID = socket.id;
  console.log(`player ${playerID} connected`);
  socketsByPlayerID[playerID] = socket;
  gamesByPlayerID[playerID] = null;
  socket.on('disconnect', () => {
    delete socketsByPlayerID[playerID];
    delete gamesByPlayerID[playerID];
  });
  socket.on('press', (callback) => {
    gamesByPlayerID[playerID] = nextGame;
    callback(getState(playerID));
  });
  socket.on('release', (callback) => {
    const game = gamesByPlayerID[playerID];
    gamesByPlayerID[playerID] = null;
    const playersLeft = getPlayerIDs(game);
    if (playersLeft.length === 1) {
      socketsByPlayerID[playersLeft[0]].emit('win');
    }
    callback(getState(playerID));
  });
  socket.on('getState', (callback) => {
    callback(getState(playerID));
  });
});

const queueNextGame = () => {
  const gmt = Date.now();
  nextGame = Math.ceil(gmt / GAME_TIME_INTERVAL) * GAME_TIME_INTERVAL;
  console.log(`game ${nextGame} starting`);
  setTimeout(queueNextGame, nextGame - gmt);
}

queueNextGame();