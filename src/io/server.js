const fs = require('fs');
const path = require('path');
const socketio = require('socket.io');
const { PythonShell } = require('python-shell');

const OUTDIR = './public/out';
const MINIMAGES = 5;
const MAXIMAGES = 25;

function createSession(id) {
  fs.mkdirSync(path.join(OUTDIR, id), { recursive: true });
}

function deleteSession(id) {
  fs.rmdirSync(path.join(OUTDIR, id), { recursive: true });
}

function generateImages(socket, params) {
  let evolgan = {
    mu: params.mu,
    llambda: Math.min(Math.max(params.llambda, MINIMAGES), MAXIMAGES),
    bound: params.bound,
    model: params.model,
    outdir: path.join(OUTDIR, socket.id)
  };

  let z_path = path.join(OUTDIR, socket.id, 'out_z.pt');
  if (fs.existsSync(z_path)) {
    evolgan.z = z_path;
  }

  let options = {
    mode: 'text',
    pythonPath: 'C:\\Users\\Flo\\anaconda3\\envs\\playwithgan\\python',
    scriptPath: 'src/gan/',
    args: ['generate', JSON.stringify(evolgan)]
  };
  
  PythonShell.run('main1.py', options, function (err, results) {
    if (err) throw err;
    socket.emit('generate', evolgan);
  });
}

function updateZ(socket, params) {
  let evolgan = {
    outdir: path.join(OUTDIR, socket.id),
    indices: params.indices
  };

  let options = {
    mode: 'text',
    pythonPath: 'C:\\Users\\Flo\\anaconda3\\envs\\playwithgan\\python',
    scriptPath: 'src/gan/',
    args: ['update', JSON.stringify(evolgan)]
  };

  PythonShell.run('main1.py', options, function (err, results) {
    if (err) throw err;
    generateImages(socket, params);
  });
}

function io(server) {

  const io = socketio(server);

  io.on('connection', (socket) => {

    createSession(socket.id);
    
    socket.on('new', (params) => {
      fs.rmSync(path.join(OUTDIR, socket.id, 'out_z.pt'), { force: true });
      fs.rmSync(path.join(OUTDIR, socket.id, 'out_zis.pt'), { force: true });
      generateImages(socket, params);
    });

    socket.on('update', (params) => {
      updateZ(socket, params);
    });

    socket.on('disconnect', () => deleteSession(socket.id));

  });

}

module.exports = io;
