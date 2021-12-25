let net = require('net');
let path = require('path');
let client= new net.Socket();
client.setEncoding('binary');
client.connect(path.join('./devctl'),function () {
    //client给server发送数据
    setTimeout(() => {
        var msg = {
            index: 1,
        }
        client.write(JSON.stringify(msg));
    }, 1000);
});
client.on('data',function(data){
    //此处接受到数据后就可以进行合适的处理了
    const ret = Buffer.from(data,'binary').toString();
    console.log('返回结果:' + ret)
    client.end();
});
client.on('close',function(){
});
client.on('error',function(error){
    console.log('error:'+error);
    client.destory();
});