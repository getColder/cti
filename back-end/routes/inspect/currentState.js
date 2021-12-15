const express = require('express');
const fs = require('fs')
const insertInfo = require('../../application/database').insertInfo;
const find = require('../../application/database.js').find; //mongodb数据库
const dbState = require('../../application/database.js').isConnected //数据库是否连接
const router = express.Router()


const maxLenOfInfos = 1000;
const maxTimeline = 1000;
var allDevsCurrentData = {}
var defalutConfig
var devices = [];

setTimeout(function() {
    init();
}.bind(this), 1000);


router.get('/', (req, res) => {
    res.send('当前数据与状态---来自于硬件,本网页仅提供数据状态展示与查询功能。');
})

router.get('/devs', (req, res) => {
    res.json(devices);
    res.end()
})

router.get('/devconfig', (req, res) => {
    var devid_req = req.query.devid;
    const conf = allDevsCurrentData[devid_req]?allDevsCurrentData[devid_req]['config']:defalutConfig
    res.json(conf);
    res.end()
})

router.get('/data', (req, res, next) => {
    var time_req = req.query.timenode;
    var devid_req = req.query.devid;
    if(!devid_req){
        json('');
        return;
    }

    if(!allDevsCurrentData.hasOwnProperty(devid_req)){
        res.json('');
        console.log('WebServer\t 请求设备不存在！\t %s',new Date().toLocaleTimeString());
        return;
    }

    if(!time_req){
        res.json(allDevsCurrentData[devid_req]["infoCurrent"]);
        return;
    }
    else if(allDevsCurrentData[devid_req]["infoAry"].length > 0){
        const dataAry = allDevsCurrentData[devid_req]["infoAry"];
        for(index in dataAry){
            const time = dataAry[index]['Time'];
            let timestr =  '' + time[0] + time[1] + time[2] + time[3] + time[4];
            if(time_req === timestr){
                res.json(dataAry[index]);
                break;  //设备devid_req，时间time_req对应的数据
            }
        }
    }
    else{
        res.json('');
    }
})

router.get('/db', (req, res, next) => {
    var devid_req = req.query.devid;
    var date_lt = req.query.lt;
    var date_gt = req.query.gt;
    if(devid_req&&date_lt&&date_gt){
        date_gt += ':00:00:00'
        date_lt += ':23:59:00'
        var dateTime1 = new Date(date_gt);
        var dateTime2 = new Date(date_lt);
        if(dateTime1 && dateTime2){
            find('dev_'+ devid_req,{
                "time": {
                    $gte : dateTime1,
                    $lte : dateTime2
                }
            })
            .then((data)=>{
                if(data.length > 0){
                    res.json(data)
                    res.end()
                }
                else{
                    var empty = [];
                    res.json(empty)
                    res.end();
                }
            })
            .catch(reson => {
                console.log('database\t 数据库请求错误： %s\t %s', reson, new Date().toLocaleTimeString());
                var empty = [];
                res.json(empty)
                res.end();
            })
        }
        else{
            var empty = [];
            res.json(empty)
            res.end();
        }
    }
    else{
        var empty = [];
        res.json(empty)
        res.end();
    }

})

router.get('/timeline', (req, res, next) => {
    let devid_req = req.query.devid;
    if(allDevsCurrentData.hasOwnProperty(devid_req)){
     res.json(allDevsCurrentData[devid_req]['timeline'].slice(-50));
    }
    else
        res.json('')
})


module.exports = router;
module.exports.allDevsCurrentData = allDevsCurrentData;
//近N次的数据，由变量maxLenOfInofs设置。
module.exports.update = function (newJSON){
    try {
        const newJSON_obj = JSON.parse(newJSON);    //解析设备数据
        const devid_selected = newJSON_obj["Id"]
        devCheckInit(devid_selected)
        var DevCurrentData = allDevsCurrentData[devid_selected];
        console.log('Webserver\t DEV:%s-fetch \t %s',newJSON_obj.Id, new Date().toLocaleString());
        newJSON_obj['location'] = DevCurrentData['config']['location']
        newJSON_obj['projectNumber'] = DevCurrentData['config']['projectNumber']
        insertInfo(newJSON_obj); //加入数据库插入队列
        //维持最近maxTimeline组按时间节点查询,每个设备内存保存最大maxLenOfInfos个数据对象
        DevCurrentData["infoCurrent"] = newJSON_obj;
        DevCurrentData["infoAry"].push(newJSON_obj);
        if (DevCurrentData["infoAry"].length >= maxLenOfInfos) {
            DevCurrentData["infoAry"].shift();
        }
        //加入“近期数据”内存维护,每个设备内存保存最大maxTimeline个时间节点
        DevCurrentData['timeline'].push(newJSON_obj.Time);
        if (DevCurrentData['timeline'].length >= maxTimeline) {
            DevCurrentData['timeline'].shift();
        }
    }
    catch (error){
        console.log('Webserver\t currentstate解析错误EXCEPTION: %s\t%s', error, new Date());
    }
}

module.exports.devconf = function(devID){
    devices = devID;
};

function init(){
    var defaultDevPath = __dirname + '/config/devices/dev_default.json';
    defalutConfig = JSON.parse('' + fs.readFileSync(defaultDevPath));
    console.log('DevConfig\t读取设备默认配置\t%s',new Date().toLocaleString());

}

function devCheckInit(devid_selected){
    if(!allDevsCurrentData[devid_selected]){
        //初始化设备配置
        var theConfig;
        var DevPath = __dirname + '/config/devices/dev_' + devid_selected + '.json'
        try {
            theConfig = JSON.parse(fs.readFileSync(DevPath,{flag: 'r'}))
            console.log('Webserver\t currentstate读取设备配置文件成功.\t%s\n%s', new Date().toLocaleString(), theConfig);
        } catch (error) {
            console.log('Webserver\t currentstate设备配置文件读取失败\t%s', new Date().toLocaleString(), error);
            theConfig = defalutConfig;
        }
        //创建数据集对象
        allDevsCurrentData[devid_selected] = {
            infoAry : [],
            infoCurrent : {},
            timeline : [],
            config: {
                location : theConfig.location,
                projectNumber : theConfig.projectNumber,
                note: theConfig.note?theConfig.note:''
            },
        }       
        //内存维护数据：dev{'A1','A2'....     }  -->A1:{ ary,current,timeline }
    }
}