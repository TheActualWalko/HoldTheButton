const app = require('http').createServer((req, res) => { res.end('okay'); });
const io = require('socket.io')(app);
app.listen(1337);

const GAME_TIME_INTERVAL = 10000
const connectedPlayers = {};

let nextGame;

const getPlayers = (game) => {
  const players = Object.keys(connectedPlayers).map(playerID => connectedPlayers[playerID]);
  if (game) {
    return players.filter((player) => player.game === game);
  } else {
    return players;
  }
};

const queueNextGame = () => {
  const players = getPlayers(nextGame);
  if (players.length > 0) {
    console.log(`Game ${nextGame} starting!`);
    players.forEach((player) => player.receiveNewPlayerCount(players.length));
  }
  nextGame = Math.ceil(Date.now() / GAME_TIME_INTERVAL) * GAME_TIME_INTERVAL;
  setTimeout(queueNextGame, nextGame - Date.now());
}

class Player {
  constructor(socket) {
    this.socket = socket;
    this.id = socket.id;
    this.game = null;
    this.socket.on('press', this.join.bind(this));
    this.socket.on('release', this.leave.bind(this));
    this.socket.on('getState', this.getState.bind(this));
  }
  getState(callback) {
    const playing = !!this.game;
    const gameStart = playing ? this.game : nextGame;
    callback(playing, gameStart);
  }
  join(callback) {
    this.game = nextGame;
    callback && callback('ok');
  }
  receiveNewPlayerCount(count) {
    if (count === 1) {
      this.socket.emit('win');
      this.game = null;
    } else {
      this.socket.emit('playerCount', count);
    }
  }
  leave(callback) {
    if (this.game) {
      const gameLeft = this.game;
      const holdTime = Date.now() - gameLeft;
      this.game = null;
      const players = getPlayers(gameLeft);
      if (holdTime > 0) {
        players.forEach(player => player.receiveNewPlayerCount(players.length));
        this.socket.emit('lose', holdTime);
      }
    }
    callback && callback('ok');
  }
}

io.on('connection', (socket) => {
  console.log(`player ${socket.id} connected`);
  connectedPlayers[socket.id] = new Player(socket);
  socket.on('disconnect', () => {
    delete connectedPlayers[socket.id];
  });
});

queueNextGame();