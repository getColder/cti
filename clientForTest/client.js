var net = require('net')

const address = '127.0.0.1'
const ali_address = '47.108.232.221'
port = 9520

var data = {
    "Type":"NULL",
    "Id":1,
    "Time":[0,0,0,0,0],
    "TempData":
    [
        {"Floor":1,"WaterTemp":[17.5,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0},
        {"Floor":2,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0},
        {"Floor":3,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0},
        {"Floor":4,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0},
        {"Floor":5,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0},
        {"Floor":6,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0}],
    "SpareData":0
}

const client = net.createConnection(port, address, ()=>{
    setInterval(() => {
        var date = new Date()
        data.Time = [date.getUTCFullYear() - 2000, date.getMonth() + 1
            ,date.getDate(),date.getHours(),date.getMinutes()];
        client.write(JSON.stringify(data),(err)=>{
            if(err)
             console.log('写入失败，请检查连接',err);
        });
    }, 20000);
})
