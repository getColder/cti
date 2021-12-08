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
var logFilePath = __dirname + '/logs/tcpServer.log';
var logfilestream = fs.createWriteStream(logFilePath, { flags: 'a' });
process.stdout.write = logfilestream.write.bind(logfilestream);   //学习：若果不bind，stdout.write内的函数的this指向process.stdout
console.log('\nbegin 服务器启动-->日志打开成功\t %s', new Date().toLocaleString('cn','hour12:false'));
//2、tcp连接列表,60s秒刷新
var tcpList = [];
var tcpListPath = __dirname + '/logs/tcpList.log';
var docheck = false;
var checkList =  function (){
    fs.open(tcpListPath,'w',(err,fd)=>{
        if(err){
            console.error(err);
        }
        var buf = '';
        for (const key in tcpList) {
            if (Object.hasOwnProperty.call(tcpList, key)) {
                const element = tcpList[key];
                buf += '[' + key + ']'
                buf += element;
                buf += '\n'
            }
        }
        tcpList = [];
        fs.write(fd, buf, (err, written, Tbuffer) => {
            if (err)
                console.error(err)
            fs.close(fd, ()=>{
                if(docheck == true){
                    setTimeout(() => {
                        checkList();
                    }, 3000);
                }
            })
        })
    });
}
docheck = true;
checkList();

//3、错误输出
var errFilePath = __dirname + '/logs/err.log';
var errfilestream = fs.createWriteStream(errFilePath, { flags: 'a' });
process.stderr.write = errfilestream.write.bind(errfilestream);

//socket更新信息
var tcpServer = net.createServer((connection) => {
  var address = connection.address().address;
  connection.DevID = '';
  var intvl_listitem = setInterval(() => {
    var info = address + '-->' + connection.DevID;
      for (const key in tcpList) {
          if (Object.hasOwnProperty.call(tcpList, key)) {
              const element = tcpList[key];
              if(info === element)
                return;
          }
      }
      tcpList.push(info)
}, 1000);
    connection.on('end', ()=>{
        clearInterval(intvl_listitem)
    })

  connection.isCorrect = true;
  connection.startTime = new Date()
  connection.buf = '';
  connection.complete = 0;
  //检测次数检测，t * n 秒没有发送数据说明拿到完整数据, 接收后断开连接
  connection.check = function () {
    let n = 3;    // n次检测，超过认定数据传输完成
    let t = 2000; // 一次检测等待豪秒数
    //1、数据完整性检测 t 秒一次
    this.timer = setInterval(() => {
      this.complete++;
      if (this.complete < n) {}
      else if (this.complete == n && this.buf != '') {
        //2、检测次数超过指定次数,拿到完整数据并处理
        //console.error('\n\n\n' + this.buf + '\n\n')
        var info = JSON.parse(this.buf, (k, v) => {
          if (k != '')
            this.isCorrect &= infoCheckReg.test(k);  //检查JSON是否符合格式
          if (k == 'Id')
            connection.DevID = v;
        });
//检测不通过
        //断开连接并打印到日志 err:-1x
        if (!this.isCorrect) {
          //格式错误
          console.error('[err:-12]tcpserver\t %s-->%s格式错误,准备断开连接\t %s',address , connection.DevID , new Date().toLocaleString, );
          connection.end(() => {
            console.log('tcpserver\t feedback \t 成功断开连接[-12]');
          })
          return;
        }
        //检测通过
        //推送给web服务器进程
        console.log('tcpserver\t devID：%s\t write:%s\t %s ', this.DevID ,this.buf.length,new Date().toLocaleString('cn','hour12:false'));
        process.send(this.buf, (err) => {
          if (err) {
            console.error('[err:-21]tcpserver\t %s-->%s进程读写错误,准备断开连接%s\t %s',address , connection.DevID , err, toLocaleString('cn','hour12:false'));
            connection.end(() => {
                console.log('tcpserver\t %s\t feedback \t 成功断开连接[-21]',address);
            })
          } 
          this.buf = '';       
        });
      }
    }, t);
    //2、心跳检测 30s一次
      this.heartbeat = setInterval(() => {
          connection.write('', (err) => {
              if (err) {
                  setTimeout(() => {
                    console.error('[err:-11]tcpserver\t %s-->%s心跳检测：连接无响应,断开连接%s\t %s',address , connection.DevID , err, toLocaleString('cn','hour12:false'));
                    connection.end(() => {
                        console.log('tcpserver\t %s\t feedback \t 成功断开连接[-11]',address);
                    })
                  }, 10000);
              }
          });
      }, 30000);
  }
  //新连接
  console.log("new\t %s\t start:\t%s", address, connection.startTime.toLocaleString('cn','hour12:false'));
  connection.check(); //1、检测数据完整性   2、检测检测次数
  connection.on('end', () => {
    clearInterval(connection.timer);
    clearInterval(connection.heartbeat);
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


tcpServer.listen(tcpServerPort, '0.0.0.0');

process.on('uncaughtException', (err)=>{
    console.error('[err:-100]%s\t %s', err, new Date().toLocaleString('cn','hour12:false'));
    docheck = false;
	emitter.emit('dropConnection')
    throw err
})
process.on('exit', (err)=>{
    docheck = false;
})