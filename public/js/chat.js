const socket=io()
const chatForm=document.querySelector("#message-form")
const input=document.querySelector("input")
const sendbutton=document.querySelector("#send")
const locbutton=document.querySelector("#send-location")
const messages=document.querySelector("#messages")

const messageTemplate=document.querySelector("#message-template").innerHTML
const locationTemplate=document.querySelector("#location-message-template").innerHTML
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML

const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = () => {
    const $newMessage = messages.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    const visibleHeight = messages.offsetHeight
    const containerHeight = messages.scrollHeight
    const scrollOffset = messages.scrollTop + (visibleHeight +1)

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}


socket.on("message",(text)=>{
    console.log(text)
    const html=Mustache.render(messageTemplate,{
        username:text.username,
        message:text.text,
        time:moment(text.createdAt).format("h:mm a")
    })
    messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
})
socket.on("locationMessage",(location)=>{
    const html=Mustache.render(locationTemplate,{
        username:location.username,
        url:location.location,
        time:moment(location.createdAt).format("h:mm a")
    })
    messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
})
chatForm.addEventListener("submit",(e)=>{
    e.preventDefault()
    sendbutton.setAttribute("disabled","disabled")
    const message=e.target.elements.message.value
    socket.emit("sendMessage",message,()=>{
            sendbutton.removeAttribute("disabled")
            input.value=""
            input.focus()
            console.log("your message received")
    })
})
locbutton.addEventListener("click",()=>{
    navigator.geolocation.getCurrentPosition((position)=>{
        const latitude=position.coords.latitude
        const longitude=position.coords.longitude
        locbutton.setAttribute("disabled","disabled")
        socket.emit("location",{
            latitude,
            longitude
        },()=>{
            locbutton.removeAttribute("disabled")
            console.log("location received")
        })
    })
})
socket.emit("join",{username,room},(error)=>{
    if(error){
        alert(error)
        location.href="/"
    }
})
socket.on("roomData",({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML=html
})