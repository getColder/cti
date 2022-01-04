function rn(n,m){
    switch(arguments.length){
        case 1:
            return parseInt(Math.random()*n+1, 10)
        case 2:
            return parseInt(Math.random()* (m - n + 1) + n, 10);
        default:
            return 0;
    }
}

var randomQueue_100 = [];
var randomQueue_37 = [];

var net = require('net');
var client;
const address = '127.0.0.1'
const ali_address = '47.108.232.221'
port = 9520

function preZero(num){
   var str = num + '';
   str = num < 10 ? '0'.concat(str) : str
   return str;
}

function randomGe(n,m){
    return rn(n,m) + parseInt(rn(0,8)* 0.1);
}

setInterval(() => {
    if(randomQueue_100.length > 100)
        return;
    randomQueue_100.push(randomGe(0,100))
}, 20);

setInterval(() => {
    if(randomQueue_37.length > 100)
        return;
    randomQueue_37.push(randomGe(18,37))
}, 20);

function getRandomCement(){
    var num = [];
    for(var i = 0;i < 7;i ++){
        num.push(randomQueue_100.pop())
    }
    return num;
}


function gedata() {
    return {
        "Type":"NULL",
        "Id": 7,
        "Time":[2021,12,05,20,56],
        "TempData":
        [
            {"Floor":1,"WaterTemp":[99.5,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":getRandomCement(),"EnvirTemp":randomQueue_37.pop()},
            {"Floor":2,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":getRandomCement(),"EnvirTemp":randomQueue_37.pop()},
            {"Floor":3,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":getRandomCement(),"EnvirTemp":randomQueue_37.pop()},
            {"Floor":4,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":getRandomCement(),"EnvirTemp":randomQueue_37.pop()},
            {"Floor":5,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":getRandomCement(),"EnvirTemp":randomQueue_37.pop()},
            {"Floor":6,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":getRandomCement(),"EnvirTemp":randomQueue_37.pop()}],
        "SpareData":[1,0],
    }
}

function link() {
    client = net.createConnection(port, address, () => {
        client.on('end', () => {
            clearInterval(sendPerman);
            setTimeout(() => {
                try {
                    link();
                } catch (error) {
                    console.log('连接失败')
                }
            }, 3000);
        })
        var sendPerman = setInterval(() => {
            var data = gedata();
            var date = new Date()
            const year = date.getUTCFullYear();
            const mon = date.getMonth() + 1;
            const day = date.getDate();
            const hour = date.getHours();
            const min = date.getMinutes();
            data.Time = [preZero(year), preZero(mon), preZero(day), preZero(hour), preZero(min)]
            client.write(JSON.stringify(data), (err) => {
                console.log(data.Time);
                if (err)
                    console.log('写入失败，请检查连接', err);
            });
        }, 20000 * 3 * 3);
        console.log('连接成功')
    })
}
link();

process.on('uncaughtException',(err)=>{
    console.log('程序崩溃');
    setTimeout(() => {
        try {
            link();
        } catch (error) {
            console.log(连接失败);
        }
    }, 1);
})