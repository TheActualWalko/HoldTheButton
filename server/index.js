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
    gamesByPlayerID[playerID] = null;
    callback(getState(playerID));
  });
  socket.on('getState', (callback) => {
    callback(getState(playerID));
  });
});

const queueNextGame = () => {
  nextGame = Math.ceil(Date.now() / GAME_TIME_INTERVAL) * GAME_TIME_INTERVAL;
  console.log(`game ${nextGame} starting`);
  setTimeout(queueNextGame, nextGame - Date.now());
}

queueNextGame();