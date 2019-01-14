var createError = require('http-errors');
const express = require('express');
const fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser= require("body-parser");

const app = express();
const server=require('http').createServer(app);
const io = require('socket.io')(server);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));
app.use( express.static( "public" ) );

app.get('/',async(req,res,next)=>{
    try{
        res.render(path.join('./index'),{})
    }catch (e){
        next(e);
    }
    
});

let businessstring;
var intID;
var clientcount=0;

io.on('connection', function(socket){
  console.log('a user connected');
  clientcount++;
  console.log(clientcount);
  
  if(clientcount>1)
  {
      io.of('/').clients((error,clients)=>{
          if(error) throw error;
          console.log(clients);
          console.log(clients[0]);
          io.to(clients[0]).emit('songstatus',"MASTER");
          
      });
        
    socket.on('songstatus', function(msg){
            console.log('message: ' + msg);
            io.emit('songmid', msg);
    });  
  }else
  {
      intID=setInterval(intervalFunc, 30000);
      fs.readFile('./songs.json', (err, data) => {  
                    if (err) throw err;
                    let config = JSON.parse(data);
                    var min=0; 
                    var max=config.songs.length;
                    var random=0;                 
                    do {
                    random =Math.floor(Math.random() * (+max - +min)) + +min;  
                    }while(config.songs[random].dblink.length===0);
                    msg= config.songs[random].dblink+","+config.songs[random].songName+","+config.songs[random].ArtistName+","+config.songs[random].amazonlink;
                    console.log(msg);
                    io.emit('audend', msg);
            });
  }
  
  
  function intervalFunc()
        {
            let msg;
            
            fs.readFile('./fwb.json', (err, data) => {  
                    if (err) throw err;
                    let config = JSON.parse(data);
                    var min=0; 
                    var max=config.business.length;
                    var random=0;                 
                    do {
                    random =Math.floor(Math.random() * (+max - +min)) + +min;  
                    }while(config.business[random].name.length===0);
                    msg= config.business[random].name+","+config.business[random].phone+","+config.business[random].website;
                    msg="YOUR BUSINESS HERE, YOUR BUSINESS HERE,YOUR WEBSITE HERE";
                    console.log(msg);
                    businessstring=msg;
                    io.emit('chat message', msg);
            });
            
        }
    
  socket.on('disconnect', function(){
    console.log('user disconnected');
    clientcount--;
    if(clientcount==1 || clientcount==0)
    {
        clearInterval(intID);
    }
  });
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
  socket.on('songmid', function(msg){
            console.log('message: ' + msg);
            io.emit('songmid',msg);
    });
  socket.on('audend', function(msg){
    console.log('message: ' + msg);
    fs.readFile('./songs.json', (err, data) => {  
                    if (err) throw err;
                    let config = JSON.parse(data);
                    var min=0; 
                    var max=config.songs.length;
                    var random=0;                 
                    do {
                    random =Math.floor(Math.random() * (+max - +min)) + +min;  
                    }while(config.songs[random].dblink.length===0);
                    msg= config.songs[random].dblink+","+config.songs[random].songName+","+config.songs[random].ArtistName+","+config.songs[random].amazonlink;
                    console.log(msg);
                    songstring=msg;
                    io.emit('audend', msg);
            });
            io.emit('audend', msg);
  });
  socket.on('audplay', function(msg){
    console.log('message: ' + msg);
    
            io.emit('audend', msg);
  });
});

app.get('/admin',(req,res)=>{
    res.sendfile(path.join('./admin'));
    //getCountry();
    //res.send('HELLO');
    //console.log(result.rows);
});
const port=process.env.PORT || 3000;
server.listen(port,()=>console.log(`listening on port ${port}...`));
module.exports = app;
