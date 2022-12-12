const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const peer = require('peer');
//const { v4: uuidV4 } = require('uuid')

console.log('start server') 
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.static('views'))


// app.get('/', (req, res) => {
//   res.redirect(`/${uuidV4()}`)
// })
const users = {}
// 測試
const i=0;
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
  //console.log("room")
})

let peerIds = {} // Key: socket.id, Value: peerId
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {

    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userId)
    peerIds[socket.id] = userId
    //console.log(roomId,userId,'joined-room') 

    socket.on('new-user', name => {
      users[socket.id] = name
      io.emit('user-connected__', name)
      // console.log
      //console.log(users[socket.Id])
      console.log(name,'new user connected')
    })

    socket.on('send-chat-message', message => {
      io.emit('chat-message', { name: users[socket.id], message: message })
      // console.log chat message
      console.log(users[socket.id],':chat message sent',message) 
    })

    socket.on('disconnect', () => {
      //socket.to(roomId).emit('user-disconnected', userId)
      io.emit('user-disconnected', users[socket.id])
      // disconnect 可以觸發
      io.emit('remove-video-' + peerIds[socket.id])
      console.log(users[socket.id], 'user disconnected')
      delete users[socket.id]
      delete peerIds[socket.id]
    })
  }) 
})

let myPeerServer = peer.PeerServer({ 
  port: 3001, 
  path: '/'
})
server.listen(3000)