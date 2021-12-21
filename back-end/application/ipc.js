const net = require('net');
const path = require('path');
const process = require('child_process')
const eventBus = require('./eventBus.js');
const { fstat } = require('fs');
const fs = require('fs')



var devctlPath = __dirname + '/' + 'plugin/devctl';


module.exports.startIPC = function startIPC() {
    if(fs.existsSync(devctlPath))
        process.exec('rm '+ devctlPath,(err, stdout, stderr)=>{})   //删除重复管道
    eventBus.event.on('toExit',()=>{
        process.exec('rm '+ devctlPath,(err, stdout, stderr)=>{})   //退出删除管道
    })
    let server = net.createServer(function (connect) {
        connect.setEncoding('binary');
        connect.on('error',function(exception){
            console.log('socket error:' + exception);
            connect.end();
        });
        connect.on("data",function (str) {
            //server接受到client发送的数据
            var msg = JSON.parse(str)
            switch (msg.index) {
                case 1:
                    //更新所有设备
                    eventBus.event.emit('updateAllDevConf')
                    var a = '已更新设备'
                    connect.write(a,'utf-8')
                    break;
                default:
                    break;
            }
            //server给client发送数据	

        })
    }).listen(
        path.join(devctlPath));
    server.on("error",function(exception){
        console.error("server error:" + exception);
    });
}



