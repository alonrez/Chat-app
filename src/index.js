const path = require('path')
const http = require('http') 
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)// Express does it automatically behindthe scenes, but i needed the 'server' variable
const io = socketio(server) //  Thats why..

const port = process.env.PORT || 3000
const publcDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publcDirectoryPath))

    io.on('connection', () => {
        console.log('New Websocket connections')
    })

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})

