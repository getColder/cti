// app.js入口
const child_process = require('child_process')
const { exit } = require('process')
const emitter = require('./application/event').emitter
const server = require('./application/webserver.js')	//web服务器
const tcp_fork = child_process.fork('./application/tcpserver_infos.js')	//tcp服务器
const mongodb = require('./application/database.js') //mongodb数据库


emitter.addListener('dropConnection', function(){
    console.log('App\t 异常退出%s' , new Date().toLocaleString());
    tcp_fork.kill();
    exit(-1);
})

server.start();   
mongodb.startDB();
tcp_fork.on('message', (msg)=>{
// tcpServer.js ---> app.js --->  webServer.js
	server.sendJSON(msg);
})

setInterval(() => {
    mongodb.find('dev_7',{}).then((data)=>{console.log(data)})
}, 2000);

exports.tcp_fork = tcp_fork;

