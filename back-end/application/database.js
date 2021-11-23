const mongo = require('../node_modules/mongodb').MongoClient //database
const emitter = require('./event').emitter
var url_mongo = "mongodb://localhost:27017/concrete_temper_info";

var db;
var isConnected = false;
async function startDB(){
    mongo.connect(url_mongo, (err, mongodb)=>{
        if(err) {
            console.log('ERR[-2]DataBase\t 数据库连接失败! \t %s',new Date().toLocaleTimeString());
            emitter.emit('dropConnection');
        }
         console.log('DataBase\t 数据库连接成功! \t %s',new Date().toLocaleTimeString());
         db = mongodb.db("concrete_temper_info"); //
         isConnected = true;
    });
}



async function insert(devID,ary){
    if(!isConnected){
        return;
    }
    var targetCollection = 'dev_' + devID;
    await (targetCollection);
    db.collection(targetCollection).insertMany(ary, (err, res)=>{
        if(err) {
            console.log('ERR[-20]DataBase\t 数据插入失败！! \t %s',new Date().toLocaleTimeString());
            emitter.emit('dropConnection');
            throw err;
        }
    })
}

function checkDev(targetCollection){
    db.listCollections().toArray(async (err, collections)=>{
        var isNotExsisted = true;
        collections.some(col=>{
            if(col.name == targetCollection)
                isNotExsisted &= (col.name != targetCollection);
        })
        if(isNotExsisted){
            db.createCollection(targetCollection);
            console.log('DataBase\t 新设备集合%s \t %s',targetCollection,new Date().toLocaleTimeString());
        }
    });
}


exports.startDB = startDB;
exports.insertInfo = insert;