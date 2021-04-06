const express=require("express")
const path=require("path")
const http=require("http")
const socketio=require("socket.io")
const{generateMessage}=require("./utils/messages")
const {generateLocation}=require("./utils/messages")
const {addUser,removeUser,getUser,getUsersInRoom}=require("./utils/users")
const app=express()
const server=http.createServer(app)
const io=socketio(server)
const port=process.env.PORT || 3000
const publicDirectoryPath=path.join(__dirname,"../publics")
app.use(express.static(publicDirectoryPath))

io.on("connection",(socket)=>{
    socket.on("join",({username,room},callback)=>{
        const {error,user}=addUser({id:socket.id,username,room})
        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit("message",generateMessage(user.username,"welcome!"))
        socket.broadcast.to(user.room).emit("message",generateMessage(user.username,`${user.username} joined our chat`))
        io.to(user.room).emit("roomData",{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on("sendMessage",(message,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit("message",generateMessage(user.username,message))
        callback()
    })
    socket.on("location",(coords,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit("locationMessage",generateLocation(user.username,"https://google.com/maps?q="+coords.latitude+","+coords.longitude))
        callback()
    })
    socket.on("disconnect",()=>{
        const user1=removeUser(socket.id)
        if(user1){
            io.to(user1.room).emit("message",generateMessage(user1.username,`${user1.username} has left chat`))
        }
        io.to(user1.room).emit("roomData",{
            room:user1.room,
            users:getUsersInRoom(user1.room)
        })
    })
})
server.listen(port,()=>{
    console.log("connected to port "+port)
})