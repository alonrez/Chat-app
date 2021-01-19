const path = require('path')
const http = require('http') 
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage  } = require('./utils/messages')
const { addUser, removeUser, getUser,getUsersInRoom } = require('./utils/users')


const app = express()
const server = http.createServer(app)// Express does it automatically behind the scenes, but i needed the 'server' variable
const io = socketio(server) //  Thats why..

const port = process.env.PORT || 3000
const publcDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publcDirectoryPath))

                                           // socket.emit = emits to a specific client,
                                         // io.emit = emits to every connected client,
                                       // socket.broadcast.emit = emits to every conncted client BUT the current one,
                                     // io.emit.emit = emits to every client in a scpecific room,
                                   // socket.boradcast.to.emit = emits to every client BUT the current one.


    io.on('connection', (socket) => {
        console.log('New Websocket connections')
        
        socket.on('join', (Options, callback) => {
           const { error, user } =  addUser({ id: socket.id, ...Options })

            if (error) {
                return callback(error)
            }


            socket.join(user.room)

            socket.emit('message', generateMessage('Admin', 'Welcome!'))
            socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} Joined the chat!`)) 
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })

            callback()
        })



        socket.on('sendMessage', (message, callback) => {
            const user = getUser(socket.id)
            const filter = new Filter()

            if (filter.isProfane(message)) {
                alert('Profanity is not allowed!')
               return callback('Profanity is not allowed')
            }

            io.to(user.room).emit('message',generateMessage(user.username, message)) 
            callback()
        })

        socket.on('sendLocation', (coords, callback) => {
            const user = getUser(socket.id)
            io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
            callback()
        })

        socket.on('disconnect', () => {
            const user = removeUser(socket.id)

            if (user) {
                io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the chat!`))
                io.to(user.room).emit('roomData', {
                    room: user.room,
                    users: getUsersInRoom(user.room)
                })
            }
        })
        
    })

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})



