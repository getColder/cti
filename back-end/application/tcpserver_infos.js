const net = require('net')
const path = require('path')
const fs = require('fs');
const { exit, stdout } = require('process');
const emitter = require('./event').emitter


var tcpServerPort = 9520;
//字段检查正则表达式
const infoCheckReg = /[0-9]|\bType\b|\bId\b|\bTime\b|\bFloor\b|\bWaterTemp\b|\bPumpStaus\b|\bValveStatus\b|\bCementTemp\b|\bEnvirTemp\b|\bSpareData\b|\bTempData\b/;

//日志文件
//1、普通输出
var logFile = __dirname + '/logs/tcpServer.log';
var filestream = fs.createWriteStream(logFile, { flags: 'a' });
process.stdout.write = filestream.write.bind(filestream);   //学习：若果不bind，stdout.write内的函数的this指向process.stdout
async ()=> console.log('begin 服务器启动-->日志打开成功\t %s', new Date().toLocaleTimeString());
//2、未知异常
/*
var logFile_e = __dirname + '/logs/tcpServer_EXCEP.log';
var filestream_err = fs.createWriteStream(logFile_e, { flags: 'a' });
process.stderr.write = filestream_err.write.bind(filestream_err); 
*/

//socket更新信息
var tcpServer = net.createServer((connection) => {
  var address = connection.address().address;
  connection.DevID = '-99';
  connection.isCorrect = true;
  connection.startTime = new Date()
  connection.buf = '';
  connection.complete = 0;
  //检测次数检测，t * n 秒没有发送数据说明拿到完整数据, 接收后断开连接
  connection.check = function () {
    let n = 5;    // n次检测，超过认定数据传输完成
    let t = 2000; // 一次检测等待豪秒数
    //1、数据完整性检测 t 秒一次
    this.timer = setInterval(() => {
      this.complete++;
      if (this.complete < n) { }
      else if (this.complete == n && this.buf != '') {
        //检测次数超过指定次数,拿到完整数据并处理
        var info = JSON.parse(this.buf, (k, v) => {
          if (k != '')
            this.isCorrect &= infoCheckReg.test(k);  //检查JSON是否符合格式
          if (k == 'Id')
            this.DevID = v;
        });
        //检测不通过
        //断开连接并打印到日志 err:-2
        if (!this.isCorrect) {
          //格式错误
          console.log('[err:-12]tcpserver\t 格式错误,准备断开连接');
          connection.end(() => {
            console.log('[err:-12]tcpserver\t feedback \t 成功断开连接');
          })
          return;
        }
        //检测通过
        //推送给web服务器进程
        console.log('tcpserver\t devID：%s\t write:%s\t %s ', this.DevID ,this.buf.length,new Date().toLocaleTimeString());
        process.send(this.buf, (err) => {
          if (err) {
            console.log('[err:-10]tcpserver\t 进程读写错误:%s', err);
            connection.end(() => {
              console.log('[err:-10]tcpserver \t feedback\t 成功断开连接');
            })
          } 
          this.buf = '';       
        });
        if(this.complete % 100 == 0)
          console.log('tcpserver\t devID：%s\t 完整性检测\t %s ', this.DevID ,new Date().toLocaleTimeString());
      }
    }, t);
    //2、心跳检测 30s一次
      setInterval(() => {
          connection.write('', (err) => {
              if (err) {
                  console.log('[err:-11]tcpserver\t 心跳检测：连接无响应,断开连接');
                  connection.end(() => {
                      console.log('[err:-2]tcpserver\t feedback \t 成功断开连接');
                  })
              }
          });
      }, 30000);
  }
  //新连接
  console.log("new\t %s\t start:%s", address, connection.startTime.toLocaleTimeString());
  connection.check(); //1、检测数据完整性   2、检测检测次数
  connection.on('end', () => {
    clearInterval(connection.timer);
    console.log('', address);
    let duration = new Date().getTime() - connection.startTime.getTime();
    duration /= 1000;
    let secs = Math.floor(duration % 60);
    let mins = Math.floor(duration % 3600 / 60);
    let hours = Math.floor(duration / 3600);
    console.log('exit\t %s\t duration:%fhs%fmins%fsecs', address, hours, mins, secs);
  })
  //接受数据
  connection.on('data', (data) => {
    connection.buf += data;
    connection.complete = 0;
  })
})


tcpServer.listen(tcpServerPort);

process.on('uncaughtException', (err)=>{
	emitter.emit('dropConnection')
})
