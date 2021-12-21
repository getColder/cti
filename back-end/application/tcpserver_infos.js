const net = require('net')
const path = require('path')
const fs = require('fs');
const { error } = require('console');

var tcpServerPort = 9520;

//字段检查正则表达式
const infoCheckReg = /[0-9]|\bType\b|\bId\b|\bTime\b|\bFloor\b|\bWaterTemp\b|\bPumpStaus\b|\bValveStatus\b|\bCementTemp\b|\bEnvirTemp\b|\bSpareData\b|\bTempData\b/;
var devlist = new Set();
var reListenTime = 15000;

//日志文件
//1、普通输出
var logFilePath = __dirname + '/logs/tcpServer.log';
var logfilestream = fs.createWriteStream(logFilePath, { flags: 'a' });
process.stdout.write = logfilestream.write.bind(logfilestream);   
//若果不bind，stdout.write内的函数的this指向process.stdout
//2、tcp连接列表,60s秒刷新



//3、错误输出
var errFilePath = __dirname + '/logs/err.log';
var errfilestream = fs.createWriteStream(errFilePath, { flags: 'a' });
process.stderr.write = errfilestream.write.bind(errfilestream);
console.log('\nbegin 服务器启动-->日志打开成功\t %s', new Date().toLocaleString('cn', 'hour12:false'));
//4、服务器listen
var tcpServer = net.createServer((connection) => {
    var address = connection.address().address;
    connection.DevID = '';
    connection.isCorrect = true;
    connection.startTime = new Date()
    connection.buf = '';
    connection.complete = 0;
    connection.wrongStr = ''; //错误数据
    //检测次数检测，t * n 秒没有发送数据说明拿到完整数据, 接收后断开连接
    connection.check = function () {
        let n = 3;    // n次检测，超过认定数据传输完成
        let t = 2000; // 一次检测等待豪秒数
        var info = {} //JSON解析buf
        //1、数据完整性检测 t 秒一次
        this.timer = setInterval(() => {
            this.complete++;
            if (this.complete < n) { }
            else if (this.complete == n && this.buf != '') {
                //2、检测次数超过指定次数,拿到完整数据并处理
                var checkRes = checkStickJSON(this.buf);
                const arrayJSON = checkRes.jsonstr;
                connection.wrongStr += checkRes.wrongStr;
                if (connection.wrongStr.length > 5000) {
                    console.error('[err:-13]tcpserver\t %s-->设备%s :设备发送过量错误数据，已强制断开\t %s\n错误数据:%s', address, connection.DevID, new Date().toLocaleString(), connection.wrongStr);
                    //发送方异常：暂停监听
                    tcpServer.close();
                    setTimeout(() => {
                        tcpServer.listen(tcpServerPort, '0.0.0.0');
                    }, reListenTime);
                    connection.end(() => {
                        console.log('tcpserver\t feedback \t 成功断开连接[-13]');
                    })
                }
                this.buf = '';
                for (let index = 0; index < arrayJSON.length; index++) {
                    const theStr = arrayJSON[index];
                    try {
                        JSON.parse(theStr, (k, v) => {
                            if (k != '')
                                this.isCorrect &= infoCheckReg.test(k);  //检查JSON是否符合格式
                            if (this.isCorrect === false) {
                                connection.wrongStr += theStr;
                            }
                            if (k === 'Id') {
                                connection.DevID = v;
                                devlist.add(connection.DevID)
                            }
                        });
                    } catch (error) {
                        console.error(error)
                        console.error('[err:-12]tcpserver\t %s-->%sJSON解析错误,准备断开连接\t %s', address, connection.DevID, new Date().toLocaleString());
                        console.error('错误数据：' + connection.wrongStr);
                        connection.wrongStr = '';
                        //发送方异常：暂停监听
                        tcpServer.close();
                        setTimeout(() => {
                            tcpServer.listen(tcpServerPort, '0.0.0.0');
                        }, reListenTime);
                        connection.end(() => {
                            console.log('tcpserver\t feedback \t 成功断开连接[-12]');
                        })
                        return;
                    }
                    //检测不通过,断开连接并打印到日志 err:-1x
                    if (!this.isCorrect) {
                        //格式错误
                        console.error('[err:-13]tcpserver\t %s-->设备%s :格式错误,准备断开连接\t %s\n错误数据:%s', address, connection.DevID, new Date().toLocaleString(), connection.wrongStr);
                        //发送方异常：暂停监听
                        tcpServer.close();
                        setTimeout(() => {
                            tcpServer.listen(tcpServerPort, '0.0.0.0');
                        }, reListenTime);
                        connection.end(() => {
                            console.log('tcpserver\t feedback \t 成功断开连接[-13]');
                        })
                        return;
                    }
                    //检测通过，推送给web服务器进程
                    console.log('tcpserver\t devID：%s\t write:%s\t %s ', this.DevID, theStr.length, new Date().toLocaleString('cn', 'hour12:false'));
                    var message = {
                        index: 20,
                        data: theStr
                    }
                    process.send(message, (err) => {
                        if (err) {
                            //发送方异常：暂停监听
                            try {
                                tcpServer.close();
                            } catch (error) {
                                throw error;
                            }
                            console.error('[err:-21]tcpserver\t %s-->设备%s: 进程读写错误,准备断开连接%s\t %s', address, connection.DevID, err, toLocaleString('cn', 'hour12:false'));
                            connection.end(() => {
                                console.log('tcpserver\t %s\t feedback \t 成功断开连接[-21]', address);
                            })
                        }
                    });
                }
            }
        }, t);
        //2、心跳检测 30s一次，断掉僵尸连接或长时间无数据发来的长连接
        this.heartbeat = setInterval(() => {
            connection.write('', (err) => {
                if (err) {
                    setTimeout(() => {
                        console.log('[WARN:11]tcpserver\t %s-->%s心跳检测：连接无响应,断开连接%s\t %s', address, connection.DevID, err, toLocaleString('cn', 'hour12:false'));
                        //发送方异常：暂停监听
                        tcpServer.close();
                        setTimeout(() => {
                            tcpServer.listen(tcpServerPort, '0.0.0.0');
                        }, reListenTime);
                        connection.end(() => {
                            console.log('tcpserver\t %s\t feedback \t 成功断开连接[11]', address);
                        })
                    }, 10000);
                }
            });
        }, 30000);
    }
    //日志报告新连接
    console.log("new\t %s\t start:\t%s", address, connection.startTime.toLocaleString('cn', 'hour12:false'));
    //1、检测数据完整性   
    //2、检测检测次数
    connection.check();
    //日志报告连接断开
    connection.on('end', () => {
        devlist.delete(connection.DevID);
        clearInterval(connection.timer);
        clearInterval(connection.heartbeat);
        let duration = new Date().getTime() - connection.startTime.getTime();
        duration /= 1000;
        let secs = Math.floor(duration % 60);
        let mins = Math.floor(duration % 3600 / 60);
        let hours = Math.floor(duration / 3600);
        console.log('exit\t %s\t duration:%fhs%fmins%fsecs\t 连接开始于%s', address, hours, mins, secs, connection.startTime.toLocaleString());
    })
    //接受数据存入buf，待完整性检测
    connection.on('data', (data) => {
        connection.buf += data;
        connection.complete = 0;
    })
})

function checkStickJSON(str) {
    var out = {
        jsonstr: [],
        wrongstr: ''
    }
    if (str[0] !== '{') {
        out.wrongstr = str;
        return out;
    }
    var output = [];
    var braceStack = [];
    var headPos = 0;
    for (let index = 0; index < str.length; index++) {
        const element = str[index];
        if (element === '{') {
            braceStack.push('{')
        }
        else if (element === '}') {
            braceStack.pop();
            if (braceStack.length < 1) {
                let data = str.slice(headPos, index + 1);
                output.push(data?data:str);
                headPos = index + 2;
            }
        }
    }
    out.jsonstr = output;
    return out;
}

tcpServer.listen(tcpServerPort, '0.0.0.0');

process.on('uncaughtException', (err) => {
    console.error('[err:-100]未知异常:%s\t %s', err, new Date().toLocaleString('cn', 'hour12:false'));
    var message = {
        index: 19,
        data: ''
    }
    process.send(message)
    throw error;
})
process.on('Exit', () => {
    clearInterval(interval_getdevlist)
    console.log(exitTip)
    var exitTip = 'Tcpserver Exit \t' + new Date().toLocaleString();
    try {
        var message = {
            index: 18,
            data: exitTip
        }
        process.send(message)
    } catch (error) {   
    }

})


var interval_getdevlist = setInterval(() => {
    try {
        var message = {
            index: 21,
            data: Array.from(devlist)
        }
        process.send(message);  //读取设备配置
    } catch (error) {
        console.error(error)
    }
}, 200);

var tip = {
    index: 10,
    data: tcpServerPort
}
process.send(tip);


