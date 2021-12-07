const express = require('express');
const insertInfo = require('../../application/database').insertInfo;
const router = express.Router()

const maxLenOfInfos = 1000;
const maxTimeline = 50;
var allDevsData = {}
var tempDataToInsert = {}


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
        console.log('WebServer\t 请求设备不存在！\t %s',new Date().toLocaleTimeString());
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
                break;  //设备d的“数据数组”中，时间t对应的数据
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
        insertInfo(newJSON_obj);
        var devid_selected = newJSON_obj["Id"]
        //服务器维持100组,超过删除
        if(!allDevsData[devid_selected]){
            allDevsData[devid_selected] = {
                infoAry : [],
                infoCurrent : {},
                timeline : []
            }       //内存维护数据：dev{'A1','A2'....     }  -->A1:{ ary,current,timeline }
        }
        if(!tempDataToInsert[devid_selected]){
            tempDataToInsert[devid_selected] = {
                infoAry : []    //数据库待插入数据
            }
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
        tempDataToInsert[devid_selected]['infoAry'].push(newJSON_obj)
        
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