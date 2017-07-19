const express = require("express")
const http = require('http')
const socketIO = require('socket.io')
const fetch = require('node-fetch')
var bodyParser = require("body-parser"); // Body parser for fetch posted data

const {Users} = require('./users.js')
const {generateMessage} = require('./message.js')
const Handle = require('./handler.js')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

const path = require("path")

var users = new Users()
//middlewares

//app.use((req, res, next) => {
//    res.header("Access-Control-Allow-Origin", "*")
//    res.header("Acess-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
//    res.header("Access-Control-Allow-Methods","GET, POST")
//    next()
//})

app.use(function(req, res, next) {
    var oneof = false
    if(req.headers.origin) {
        res.header('Access-Control-Allow-Origin', req.headers.origin)
        oneof = true
    }
    if(req.headers['access-control-request-method']) {
        res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method'])
        oneof = true
    }
    if(req.headers['access-control-request-headers']) {
        res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers'])
        oneof = true
    }
    if(oneof) {
        res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365)
    }

    // intercept OPTIONS method
    if (oneof && req.method == 'OPTIONS') {
        res.sendStatus(200)
    }
    else {
        next()
    }
})


app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json()); // Body parser use JSON data

app.post('/submitvideo', (req,res) => {
    let h = new Handle(req,res)
    h.database_submit_video()
})

app.get("/tunes/:rhythm", (req,res)=> {
    let h = new Handle(req,res)
    h.database_tunes()
})


app.get("/svg/:rhythm/:id", (req,res)=> {
    let h = new Handle(req,res)
 //   console.log(h)
    h.database_svg()
})


app.get("/youtube/:rhythm/:id", (req,res)=> {
    let h = new Handle(req,res)
 //   console.log(h)
    h.database_youtube()
})

app.get("/name", (req,res)=> {
    let h = new Handle(req,res)
  //  console.log(h)
    h.database_name()
})

io.on('connection', ( socket ) => {

    socket.on('join', (callback) => {

        users.removeUser(socket.id)

        let randId = Math.floor(Math.random() * (1686)) + 1
        console.log("rand", randId)
        fetch(`http://alexandre.hassler.fr:3000/name?id=${randId}`)
            .then(res => res.json())
            .then(res => {
                users.addUser(socket.id, res[0].name) 
                console.log(res[0].name, "before emit to client")
                socket.emit('username', res[0].name)
            })
            .then(() => {
                io.emit('updateUserList',users.getUserList())
                socket.broadcast.emit('newMessage', generateMessage('Admin',users.getUser(socket.id)) + 'joins Tunesbook !')
            })
            .catch(err => console.log(err))

        callback()
    })


    socket.on('message', (body) => {
        var user = users.getUser(socket.id)
        if (user &&  typeof body === 'string' && body.trim().length > 0){
            socket.broadcast.emit('message', generateMessage(user.name, body))
        }

    })

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id)

        if (user){
            socket.broadcast.emit('updateUserList', users.getUserList())
            socket.broadcast.emit('newMessage', generateMessage('Admin', users.getUser(socket.id)) + 'left Tunesbook !')
        }

    })
})


server.listen(3000, () => {
    console.log('express server is up on port 3000')
})
