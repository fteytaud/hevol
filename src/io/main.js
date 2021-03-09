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

function io(server) {

  const io = socketio(server);

  io.on('connection', (socket) => {

    // Handle connection
    createSession(socket.id);
    socket.emit('isConnected');

    // Handle client messages
    socket.on('update', () => {
      setTimeout(function() {
        socket.emit('imagesGenerated', {});
      }, 2000);
    });

    // Handle disconnect
    socket.on('disconnect', () => deleteSession(socket.id));

  });

}

module.exports = io;
