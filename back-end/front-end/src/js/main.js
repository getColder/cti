const host = window.location.host;  //网址
const devInfoURL = 'data'

var currentDevId = localStorage.getItem("devid");

document.write('<script src="js/component/infotable.js"></script>') //tableInfo组件
document.write('<script src="js/component/devBordHandle.js"></script>') //devbordHandle组件
document.write('<script src="js/component/indictor.js"></script>') //indictor组件
document.write('<script src="js/component/lock.js"></script>') ///lock组件
document.write('<script src="js/component/btnOptions.js"></script>') //btn-options组件
var showInfo = true;


//文档加载完毕--> 开始渲染组件
this.onload = function () {

//中央vue事件中转
var vEvent = new Vue()

//设备板
var devTable = new Vue({
    el : '#devTable',
    data(){
        return{
            showit : false
        }
    }
})

//表格组件
var dataDisplay = new Vue({
    el: '#dataDisplay',
    data(){
        return {
            thehost : host,
            showit : true
        }
    },
    components: {
        'table-info': tableInfoCom,
        'indictor': indictor
    },
    mounted(){
        vEvent.$on('updateTimeline', value => {
            this.$children[0].timenode = value;
            timelineBox.currentTime = value;
        })
        vEvent.$on('updateDev', value => {
            this.$children[0].devID = value;
            currentDevId = value;
        })
    }
  });

//时间轴框
var timelineBox = new Vue({
    el: '#timelineBox',
    data: {
            timenodes : [],
            currentTime : '',
            lockInterval : null,
            showit : true
    },
    methods: {
        getData: function(time){
          if(time)
            vEvent.$emit('updateTimeline', time)          
        },
        getTimeline : function(){
            var thisTimeline = this;
            axios.get('/currentstate/timeline?devid=' + currentDevId)
            .then(function(response){
                thisTimeline.timenodes = response.data;
                if(thisTimeline.timenodes){
                    thisTimeline.timenodes.reverse();
                    thisTimeline.currentTime = thisTimeline.timenodes[0];
                }
                else
                    thisTimeline.timenodes = [];
            })
            .catch(function(error){
                alert('请求失败:' + error)
            })
        },
        lockAutoUpdate : function(doLock){
            if(doLock){
                clearInterval(this.lockInterval);
            }
            else{
                this.lockInterval = setInterval(() => {
                    this.getTimeline();
                    dataDisplay.$children[0].updateData('/currentstate/data?devid='+ currentDevId);
                }, 60000 * 1);
            }
        }
    },
    mounted(){
        vEvent.$on('updateDev',value=>{
            this.getTimeline();
        })
        setTimeout(()=> {
            this.getTimeline();
        }, 1000)
        this.lockAutoUpdate(false); //初始不锁定自动更新
    },
    components:{
        'btn-timeline': {
            template: '<button id="fastSearch" @click.native="getTimeline"> \
            <img src="img/timelist_rise.png" alt="" width=" 20px" height="20px" \
            style="position:relative;top:4px;left: -6px;"><slot></slot></button>',
        },
        'lock-auto-up': lockAutoUp
    }
})

//选卡
    var options = new Vue({
        el: '#options',
        data(){
            return{
                index : -1
            }
        },
        components:{
            'btn-options': btnOptions
        },
        mounted(){
            this.$on('changeOpt', function (value){
                var opts = this.$children;
                for (const key in opts) {
                    if (Object.hasOwnProperty.call(opts, key)) {
                        const element = opts[key];
                        if (element._uid != value) {
                            element.isActive = false;
                        }
                        else {
                            element.isActive = true;
                            vEvent.$emit('changeopt',key)
                        }
                    }       //激活标签选项卡
                }
            })
            this.$children[0].isActive = true;
            vEvent.$on('changeopt',function(index){
                dataDisplay.showit = false;
                timelineBox.showit = false; 
                devTable.showit = false; 
                switch (Number(index)) {
                    case 0:
                        dataDisplay.showit = true;
                        timelineBox.showit = true;        
                        break;
                    case 1:
                        devTable.showit = true;   
                        break;
                
                    default:
                        break;
                }    
            })
        },
    })

//下载csv
    var csvinfo = new Vue({
    el: '#csvinfo',
    data() {
      return {
        devid : currentDevId,
        linkTo: "download/csvinfo?devid=" + currentDevId
      }
    },
    mounted(){
        vEvent.$on('updateDev',value=>{
            this.linkTo = "download/csvinfo?devid=" + value;
        })
    }
  })
  window.onbeforeunload = function(){
      localStorage.setItem("devid", currentDevId)
  }
}





