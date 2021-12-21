const child_process = require('child_process')
var tcpfork;
var isTcpServerRun = false;

//var tcpfork = child_process.fork('./application/tcpserver_infos.js')	//tcp服务器

function startTcpServer(){
    var tcp_fork;
    if(!isTcpServerRun){
        tcp_fork = child_process.fork('./application/tcpserver_infos.js')	//tcp服务器
        isTcpServerRun = true;
    }
    this.tcpfork = tcp_fork;
    return tcp_fork;
}
module.exports.startTcpServer = startTcpServer;
module.exports.tcpfork = tcpfork;