const fs = require('fs');
const path = require('path');
const socketio = require('socket.io');
const { PythonShell } = require('python-shell');

const OUT_DIR = './public/out';
const OUT_Z = 'out_z.pt';

const MU_MIN = 0;
const MU_MAX = 20;
const LLAMBDA_MIN = 5;
const LLAMBDA_MAX = 25;
const BOUND_MIN = 1;
const BOUND_MAX = 512;
const MODELS = ['celeba', 'celebAHQ-256', 'celebAHQ-512'];

const PY_MODE = 'text';
const PY_PATH = 'C:\\Users\\Flo\\anaconda3\\envs\\playwithgan\\python';
const PY_SCRIPT = 'src/gan/';
const PY_MAIN = 'main.py';

function check_num(num, min, max) {
  return Math.min(Math.max(parseInt(num), min), max);
}

function check_model(model) {
  return (MODELS.includes(model) ? model : MODELS[0]);
}

function createSession(id) {
  fs.mkdirSync(path.join(OUT_DIR, id), { recursive: true });
}

function deleteSession(id) {
  fs.rmdirSync(path.join(OUT_DIR, id), { recursive: true });
}

function generateImages(socket, params) {
  const kwargs = {
    mu: check_num(params.mu, MU_MIN, MU_MAX),
    llambda: check_num(params.llambda, LLAMBDA_MIN, LLAMBDA_MAX),
    bound: check_num(params.bound, BOUND_MIN, BOUND_MAX),
    model: check_model(params.model),
    outdir: path.join(OUT_DIR, socket.id),
    z: fs.existsSync(path.join(OUT_DIR, socket.id, OUT_Z))
  };

  const options = {
    mode: PY_MODE,
    pythonPath: PY_PATH,
    scriptPath: PY_SCRIPT,
    args: ['generate', JSON.stringify(kwargs)]
  };

  PythonShell.run(PY_MAIN, options, function (err, results) {
    if (err) throw err;
    const t = new Date().getTime();
    const images = Array.from(
      { length: kwargs.llambda }, (val, key) => key
    ).map(key => `/out/${socket.id}/out_img_${key}.png?t=${t}`);
    socket.emit('imagesGenerated', { images });
  });
}

function io(server) {

  const io = socketio(server);

  io.on('connection', (socket) => {

    // Handle connection
    createSession(socket.id);
    socket.emit('isConnected');

    // Handle client messages
    socket.on('new', (params) => generateImages(socket, params));

    // Handle disconnect
    socket.on('disconnect', () => deleteSession(socket.id));

  });

}

module.exports = io;
