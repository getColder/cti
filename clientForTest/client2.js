var net = require('net')

const address = '127.0.0.1'
const ali_address = '47.108.232.221'
port = 9520

var data = {
    "Type":"NULL",
    "Id":-98,
    "Time":[2021,12,05,20,56],
    "TempData":
    [
        {"Floor":1,"WaterTemp":[99.8,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0},
        {"Floor":2,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0},
        {"Floor":3,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0},
        {"Floor":4,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0},
        {"Floor":5,"WaterTemp":[0.0,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0},
        {"Floor":6,"WaterTemp":[22.2,0.0],"PumpStaus":0,"ValveStatus":[0,0],"CementTemp":[0.0,0.0,0.0,0.0,0.0,0.0,0.0],"EnvirTemp":0.0}],
    "SpareData":0
}

const client = net.createConnection(port, address, ()=>{
    setInterval(() => {
        var date = new Date()
        data.Time = [date.getUTCFullYear() - 2000, date.getMonth() + 1
            ,date.getDate(),date.getHours(),date.getMinutes()]
        client.write(JSON.stringify(data));
    }, 20000);
})
