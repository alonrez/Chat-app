const path = require('path')
const http = require('http') 
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)// Express does it automatically behind the scenes, but i needed the 'server' variable
const io = socketio(server) //  Thats why..

const port = process.env.PORT || 3000
const publcDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publcDirectoryPath))

let count = 0

    io.on('connection', (socket) => {
        console.log('New Websocket connections')
        
        socket.emit('message', 'Welcome!')// emits to current client
        socket.broadcast.emit('message', 'A new user has joined!') // emits to everyone but the current client



        socket.on('sendMessage', (message, callback) => {
            const filter = new Filter()
            if (filter.isProfane(message)) {
               return callback('Profanity is not allowed')
            }
            io.emit('message', message) // emits to every single client
            callback('Delivered!')
        })

        socket.on('sendLocation', (coords, callback) => {
            io.emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
            callback()
        })

        socket.on('disconnect', () => {
            io.emit('message', 'A user has left the chat!')
        })
        
    })

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})



