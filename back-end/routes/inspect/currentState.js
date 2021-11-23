const express = require('express');
const insertInfo = require('../../application/database').insertInfo;
const router = express.Router()

var infos = require('./info.json')
const maxLenOfInfos = 200;
const maxTimeline = 10;
var allDevsData = {}


router.get('/', (req, res) => {
    res.send('当前状态---来自于硬件');
})

router.get('/devs', (req, res) => {
    res.json(Object.keys(allDevsData));
})

router.get('/data', (req, res, next) => {
    var time_req = req.query.timenode;
    var devid_req = req.query.devid;
    if(!devid_req){
        json('');
        return;
    }

    if(!allDevsData.hasOwnProperty(devid_req)){
        res.json('');
        console.log('WebServer\t 请求设备数据为空\t %s',new Date().toLocaleTimeString());
        return;
    }

    if(!time_req){
        res.json(allDevsData[devid_req]["infoCurrent"]);
        return;
    }
    else if(allDevsData[devid_req]["infoAry"].length > 0){
        for(index in allDevsData[devid_req]["infoAry"]){
            let timestr =  '' + allDevsData[devid_req]["infoAry"][index]['Time'][0] 
            + allDevsData[devid_req]["infoAry"][index]['Time'][1]
            + allDevsData[devid_req]["infoAry"][index]['Time'][2] 
            + allDevsData[devid_req]["infoAry"][index]['Time'][3]
            + allDevsData[devid_req]["infoAry"][index]['Time'][4];
            if(time_req === timestr){
                res.json(allDevsData[devid_req]["infoAry"][index]);
                break;
            }
        }
    }
    else{
        res.json('');
    }
})

router.get('/timeline', (req, res, next) => {
    let devid_req = req.query.devid;
    if(allDevsData.hasOwnProperty(devid_req)){
     res.json(allDevsData[devid_req]['timeline']);
    }
    else
        res.json('')
})


module.exports = router;
//近N次的数据，由变量maxLenOfInofs设置。
module.exports.update = function (newJSON, ...JSONs){
    try {
        var newJSON_obj = (typeof (newJSON) === 'object') ? newJSON : JSON.parse(newJSON);
        console.log('Webserver\t DEV:%s-fetch \t %s',newJSON_obj.Id, new Date().toLocaleTimeString());
        //insertInfo(newJSON_obj.Id, [newJSON_obj]);
        var devid_selected = newJSON_obj["Id"]
        //服务器维持100组,超过删除
        if(!allDevsData[devid_selected]){
            allDevsData[devid_selected] = {
                infoAry : [],
                infoCurrent : {},
                timeline : []
            }       //内存维护数据：dev{'A1','A2'....     }  -->A1:{ ary,current,timeline }
        }
        if (allDevsData[devid_selected]["infoAry"].length >= maxLenOfInfos) {
            allDevsData[devid_selected]["infoAry"].shift();
        }
        allDevsData[devid_selected]["infoAry"].push(newJSON_obj);
        allDevsData[devid_selected]["infoCurrent"] = newJSON_obj;
        //维持最近10组按时间节点查询
        if (allDevsData[devid_selected]['timeline'].length >= maxTimeline) {
            allDevsData[devid_selected]['timeline'].shift();
        }
        allDevsData[devid_selected]['timeline'].push(newJSON_obj.Time);
        
        //可变参数，添加多个JSON
        JSONs.forEach((value, key)=>{
            var JSON_obj = (typeof(value)==='object')?value:JSON.parse(value);
            allDevsData[devid_selected]["infoAry"].push(JSON_obj);
        })
    }
        catch (error){
            console.log('Webserver\t EXCEPTION: %s', error);
        }
}

module.exports.allDevsData = allDevsData;