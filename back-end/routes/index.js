// index路由
const express = require('express');
const router = express.Router();  //路由级中间件
const csv = require('../application/csvProcess');   //电子表格下载
var allDevsCurrentData = require('./inspect/currentState').allDevsCurrentData; //近期数据
const find = require('../application/database.js').find; //mongodb数据库



router.get('/download/csvinfodb', (req, res, next)=>{
    var devid_req = req.query.devid;
    //var date_lt = req.query.lt;
    //var date_gt = req.query.gt;
    if(true){
    //if(devid_req&&date_lt&&date_gt){
        //date_gt += ':00:00:00'
        //date_lt += ':23:59:00'
        //var dateTime1 = new Date(date_gt);
        //var dateTime2 = new Date(date_lt);
        //if(dateTime1 && dateTime2){
        if(true){
            find('dev_'+ devid_req,{
                //"time": {
                    //$gte : dateTime1,
                    //$lte : dateTime2
                //}
            },0)
            .then((data)=>{
                if(data.length > 0){
                    const thefile = 'info_' + devid_req + '.csv';
                    const HD = {
                        "Context-Type": "application/octet-stream",
                        "Content-Disposition": "attachment; filename = " + thefile
                    }
                    res.set(HD);
                    var infos = [];
                    res.attachment(thefile);
                    data.forEach(element => {
                        infos.push(element.data);
                    });
                    csv.csvMake(infos).then(value => {
                        res.end(Buffer.from(value, 'utf-8'));
                        console.log('csv\t 下载csv%s条 \t %s', info.length, new Date().toLocaleString());
                    })
                }
                else{
                    var empty = [];
                    res.end('数据为空');
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


router.get('/download/csvinfo', async (req, res, next) => {
    const devid_req = req.query.devid;
    res.set({
        "Context-Type": "application/octet-stream",
        "Content-Disposition": "attachment; filename = infos.csv"
    });
    res.attachment('info.csv');
    if (!allDevsCurrentData[devid_req]) {
        csv.csvMake([]).then(value => {
            res.end(Buffer.from(value, 'utf-8'));
            console.log('下载为空.');
        })
        return;
    }
    csv.csvMake(allDevsCurrentData[devid_req]['infoAry']).then(value => {
        res.end(Buffer.from(value, 'utf-8'));
        console.log('csv\t 下载csv%s条 \t %s', allDevsCurrentData[devid_req]['infoAry'].length, new Date().toLocaleString());

    })
    next();
});





module.exports = router;  //导出路由