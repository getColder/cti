// app.js入口
const child_process = require('child_process')
const { exit } = require('process')
const emitter = require('./application/event').emitter
const server = require('./application/webserver.js')	//web服务器
const tcp_fork = child_process.fork('./application/tcpserver_infos.js')	//tcp服务器
const mongodb = require('./application/database.js') //mongodb数据库


emitter.addListener('dropConnection', function(){
    tcp_fork.kill();
    console.log('App\t exit when drop connection  properly%s\t %s ' , new Date().toLocaleTimeString());
    exit(-1);
})



//mongodb.startDB();
server.start();   
tcp_fork.on('message', (msg)=>{
// tcpServer.js ---> app.js --->  webServer.js
	server.sendJSON(msg);
})

exports.tcp_fork = tcp_fork;

