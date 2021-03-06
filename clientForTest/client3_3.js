const { clear } = require('console');
var net = require('net')
var client;
const address = '127.0.0.1'
const ali_address = '47.108.232.221'
port = 9520

function preZero(num){
   var str = num + '';
   str = num < 10 ? '0'.concat(str) : str
   return str;
}


var data = {
    "Type":"NULL",
    "Id": 7,
    "Time":[2021,12,05,20,56],
    "TempData":
    [
        {"Floor":1,"WaterTemp":[71.5,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0},
        {"Floor":2,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0},
        {"Floor":3,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0},
        {"Floor":4,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0},
        {"Floor":5,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0},
        {"Floor":6,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0}],
    "SpareData":[0,0],
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
        }, 20000);
        console.log('连接成功')
    })
}
link();

process.on('uncaughtException',(err)=>{
    setTimeout(() => {
        console.log('程序异常')
    }, 1000);
    setTimeout(() => {
        try {
            link();
        } catch (error) {
            console.log(连接失败);
        }
    }, 1);
})

