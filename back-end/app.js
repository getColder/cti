// app.js入口
const child_process = require('child_process')
const { exit } = require('process')
const emitter = require('./application/event').emitter
const server = require('./application/webserver.js')	//web服务器
const tcp_fork = child_process.fork('./application/tcpserver_infos.js')	//tcp服务器
const mongodb = require('./application/database.js') //mongodb数据库


function devconf(devID){
    server.devconf(devID)
}

function exitAll(){
    console.log('App\t 异常退出\t%s' , new Date().toLocaleString());
    tcp_fork.kill();
    exit(-1);
}

  
mongodb.startDB();
tcp_fork.on('message', (msg)=>{
// tcpServer.js ---> app.js --->  webServer.js
    switch (msg.index) {
        case 0:
            server.sendJSON(msg.data);
            break;
        case 1:
            devconf(msg.data)
            break;
        case 2:
            exitAll();
            break;
        default:
            break;
    }
})
server.start(); 

process.on('beforeExit', ()=>{
    try {
        tcp_fork.kill()
    } catch (error) {
        
    }
})
exports.tcp_fork = tcp_fork;

