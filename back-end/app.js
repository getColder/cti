// app.js入口
const { exit } = require('process')
const work = require('./application/workmanager.js') //进程和线程池管理
work.startTcpServer();
const server = require('./application/webserver.js')	//web服务器
const mongodb = require('./application/database.js') //mongodb数据库
const ipc = require('./application/ipc.js') // IPC
const eventBus = require('./application/eventBus.js')


function exitAll(){
    console.log('App\t 异常退出\t%s' , new Date().toLocaleString());
    work.tcpfork.kill();
    eventBus.event.emit('toExit')
    exit(-1);
}

mongodb.startDB();
work.tcpfork.on('message', (msg)=>{
    switch (msg.index) {
        case 19:
            exitAll();
            break;
        case 10:
            console.log('Tcpserver\t服务器启动成功!\t listening:%s\t %s' ,msg.data,new Date().toLocaleString());
            break;
        case 18:
            console.log(msg.data)
            break;
        default:
            break;
    }
})
server.start(); 
ipc.startIPC();
process.on('exit', ()=>{
    try {
        eventBus.event.emit('toExit')
        work.tcpfork.kill()
    } catch (error) {
        
    }
})