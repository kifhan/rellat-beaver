var express = require('express'),
    app = express(),
    path = require('path'),
    server = require('http').Server(app),
    io = require('socket.io')({ // for perfomance of socket.io on Heroku.
      "transports": ["xhr-polling"],
      "polling duration": 10
    }).listen(server);
app.set('port', process.env.PORT || 3000);
app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/bower_components/', express.static(path.join(__dirname, 'bower_components')));
// Set up express server
server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});


var Y = require('yjs')
Y.debug.log = console.log.bind(console)
const log = Y.debug('y-websockets-server')
require('y-memory')(Y)
require('y-leveldb')(Y)
require('y-websockets-server')(Y)
require('y-array')(Y)
require('y-map')(Y)
require('y-text')(Y)
require('y-richtext')(Y)

global.yInstances = {}

function getInstanceOfY (room) {
  if (global.yInstances[room] == null) {
    global.yInstances[room] = Y({
      db: {
        name: 'leveldb',
        dir: './ydb',
        namespace: room
      },
      connector: {
        name: 'websockets-server',
        room: room,
        io: io,
        debug: false
      },
      share: {}
    })
  }
  return global.yInstances[room]
}

io.on('connection', function (socket) {
  var rooms = []
  socket.on('joinRoom', function (room) {
    log('User "%s" joins room "%s"', socket.id, room)
    socket.join(room)
    getInstanceOfY(room).then(function (y) {
      global.y = y // TODO: remove !!!
      if (rooms.indexOf(room) === -1) {
        y.connector.userJoined(socket.id, 'slave')
        rooms.push(room)
      }
    })
  })
  socket.on('yjsEvent', function (msg) {
    if (msg.room != null) {
      getInstanceOfY(msg.room).then(function (y) {
        y.connector.receiveMessage(socket.id, msg)
      })
    }
  })
  socket.on('disconnect', function () {
    for (var i = 0; i < rooms.length; i++) {
      let room = rooms[i]
      getInstanceOfY(room).then(function (y) {
        var i = rooms.indexOf(room)
        if (i >= 0) {
          y.connector.userLeft(socket.id)
          rooms.splice(i, 1)
        }
      })
    }
  })
  socket.on('leaveRoom', function (room) {
    getInstanceOfY(room).then(function (y) {
      var i = rooms.indexOf(room)
      if (i >= 0) {
        y.connector.userLeft(socket.id)
        rooms.splice(i, 1)
      }
    })
  })
})
