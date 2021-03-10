const fs = require('fs');
const path = require('path');
const socketio = require('socket.io');
const { PythonShell } = require('python-shell');

const config = require('./config');

/** Binding *******************************************************************/

function generateImages(lock, socket, data) {
  const kwargs = {
    llambda: config.check.num(
      data.llambda, config.params.llambda_min, config.params.llambda_max
    ),
    bound: config.check.num(
      data.bound, config.params.bound_min, config.params.bound_max
    ),
    model: config.check.model(data.model),
    outdir: path.join(config.out.fulldir, socket.id),
    z: fs.existsSync(path.join(config.out.fulldir, socket.id, config.out.z))
  };

  const options = {
    mode: config.py.mode,
    pythonPath: config.py.path,
    scriptPath: config.py.script,
    args: ['generate', JSON.stringify(kwargs)]
  };

  PythonShell.run(config.py.main, options, function (err, _) {
    if (err) throw err;
    const images = Array.from({ length: kwargs.llambda }, (_, key) => key).map(
      key =>   '/' + config.out.dir
             + '/' + socket.id 
             + '/' + config.out.img_pre + key + '.' + config.out.img_ext
             + '?t=' + new Date().getTime()
    );
    socket.emit('imagesGenerated', { images });
    delete lock[socket.id];
  });
}

function updateImages(lock, socket, data) {
  const outdir = path.join(config.out.fulldir, socket.id);
  const images = fs.readdirSync(outdir).filter(
    file => file.endsWith(config.out.img_ext)
  );
  const kwargs = {
    outdir,
    indices: config.check.indices(data.indices, images.length)
  };
  const options = {
    mode: config.py.mode,
    pythonPath: config.py.path,
    scriptPath: config.py.script,
    args: ['update', JSON.stringify(kwargs)]
  };

  PythonShell.run(config.py.main, options, function (err, _) {
    if (err) throw err;
    generateImages(lock, socket, data);
  });
}

/** Handlers ******************************************************************/

function handleConnection(socket) {
  fs.mkdirSync(path.join(config.out.fulldir, socket.id), { recursive: true });
  socket.emit('isConnected');
}

function handleDisconnect(lock, socket) {
  if (lock[socket.id]) {
    setTimeout(() => handleDisconnect(lock, socket), 10000);
  }
  else {
    fs.rmdirSync(path.join(config.out.fulldir, socket.id), { recursive: true });
    delete lock[socket.id];
  }
}

function handleNew(lock, socket, data) {
  if (lock[socket.id]) return;
  lock[socket.id] = true;
  fs.rmSync(
    path.join(config.out.fulldir, socket.id, config.out.z), 
    { force: true });
  fs.rmSync(
    path.join(config.out.fulldir, socket.id, config.out.zis),
    { force: true });
  generateImages(lock, socket, data);
}

function handleUpdate(lock, socket, data) {
  if (lock[socket.id]) return;
  lock[socket.id] = true;
  if (fs.existsSync(path.join(config.out.fulldir, socket.id, config.out.zis))) {
    updateImages(lock, socket, data);
  }
  else {
    socket.emit('unlock');
  }
}

/** io server *****************************************************************/

function io(server) {

  const io = socketio(server);

  const lock = {};

  io.on('connection', (socket) => {

    // Handle connection
    handleConnection(socket);

    // Handle new
    socket.on('new', (data) => handleNew(lock, socket, data));

    // Handle update
    socket.on('update', (data) => handleUpdate(lock, socket, data));

    // Handle disconnect
    socket.on('disconnect', () => handleDisconnect(lock, socket));

  });

}

module.exports = io;
