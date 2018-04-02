const GAME_INTERVAL_TIME = 10000;
let nextGameStart = Date.now() + GAME_INTERVAL_TIME;

const app = require('http').createServer((req, res) => { res.end('okay'); });
const io = require('socket.io')(app);
app.listen(1337);

const clients = {};

const listClients = () => Object.keys(clients).map((id) => clients[id]);

const getClientsInGame = (specificGameStart = null) =>
  listClients()
    .filter((client) => client.isInGame(specificGameStart));

const startGame = () => {
  const gameStart = Date.now();
  nextGameStart = gameStart + GAME_INTERVAL_TIME;
  listClients()
    .filter((client) => client.pressed)
    .filter((client) => !client.isInGame())
    .forEach(client => client.joinGame(gameStart));
  console.log(`game ${gameStart} started with players ${getClientsInGame(gameStart).join(', ')}`);
}

class Client {
  constructor(socket) {
    this.socket = socket;
    this.id = socket.id;
    this.pressed = false;
    this.gameStart = null;
    this.socket.on('release', () => this.release());
    this.socket.on('press', () => this.press());
    this.socket.on('getState', (callback) => {
      if (this.isInGame()) {
        callback(this.gameStart);
      } else {
        callback(nextGameStart);
      }
    });
  }
  release() {
    const wasInGame = this.isInGame();
    const gameStart = this.gameStart;
    this.gameStart = null;
    this.pressed = false;
    if (wasInGame) this.alertLose(gameStart);
  }
  press() {
    this.pressed = true;
  }
  isInGame(specificGameStart = null) {
    if (!this.pressed) {
      return false;
    } else if (specificGameStart) {
      return this.gameStart === specificGameStart;
    } else {
      return this.gameStart !== null;
    }
  }
  joinGame(gameStart) {
    if (this.pressed) {
      this.gameStart = gameStart;
      this.socket.emit('joined', gameStart);
    } else {
      throw new Error('Can\'t join a game while not pressed.');
    }
  }
  alertLose(gameStart) {
    console.log(`${this.id} lost ${gameStart}`);
    const otherPlayers = getClientsInGame(gameStart);
    this.socket.emit('lose', otherPlayers.length);
    if (otherPlayers.length === 1){
      otherPlayers[0].alertWin();
    }
  }
  alertWin() {
    console.log(`${this.id} won ${gameStart}`);
    this.socket.emit('win');
    this.gameStart = null;
  }
  getPressed() {
    this.socket.emit('getPressed', (pressed) => {
      if (pressed) {
        this.press();
      } else {
        this.release();
      }
    })
  }
}

io.on('connection', (socket) => {
  const client = new Client(socket);
  clients[client.id] = client;
});

setInterval(startGame, GAME_INTERVAL_TIME);