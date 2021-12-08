const host = window.location.host;  //网址
const devInfoURL = 'data'
//方案A
var currentDevId = localStorage.getItem("devid");

document.write('<script src="js/component/infotable.js"></script>') //tableInfo组件
document.write('<script src="js/component/devBordHandle.js"></script>') //devbordHandle组件
document.write('<script src="js/component/indictor.js"></script>') //indictor组件
document.write('<script src="js/component/lock.js"></script>') ///lock组件
document.write('<script src="js/component/btnOptions.js"></script>') //btn-options组件
document.write('<script src="js/component/modal.js"></script>') //modal组件

window.onbeforeunload = function(){
    localStorage.setItem("devid", currentDevId)
}

//文档加载完毕--> 开始渲染组件
this.onload = function () {

//中央vue事件中转
    var vEvent = new Vue()

//设备板
    var devTable = new Vue({
        el : '#devTable',
        data(){
            return{
                showit : false,
                devices : [],
                showModal : false,
                devID : currentDevId,
                devinfo : {
                    id : currentDevId
                },
            }
        },
        methods: {
            toggleModal : function(){
                this.showModal = !this.showModal;
                var devbord = this;
                axios.get('/currentstate/devs')
                .then(function(response){
                    if(response.data){
                        devbord.devices = response.data;
                    }
                    else
                        devbord.devices = [];
                })
            },
            closeM : function(){
                this.showModal = !this.showModal;
            },
            confirmM : function(){
                currentDevId = this.devID
                this.devinfo.id = currentDevId;
                vEvent.$emit('updateDev',currentDevId)
                this.showModal = !this.showModal;
            }
        },
        mounted() {

        },
        components:{
            'modal-t' : modalT
        }
    })

//表格组件
    var dataDisplay = new Vue({
        el: '#dataDisplay',
        data(){
            return {
                devID : currentDevId,
                showit : true,
                showdbInput : false,
            }
        },
        methods:{
            optCurve: function(){
                alert('待完善')
            },
            optDb: function(){
                this.showdbInput = true;
     
            },            
            closeM : function(){
                this.showdbInput = false;
            },
            confirmM : function(){
                const date1 = this.$refs.inputDbTimeMin.value;
                const date2 = this.$refs.inputDbTimeMax.value;
                const dev = this.$refs.inputDbDev.value;
                alert(date1 + '\n' + dev)


                //this.$children[0].updateData('/currentstate/data?devid='+ this.devID +'&' + "timenode=" + str);
            }
        },
        components: {
            'table-info': tableInfoCom,
            'indictor': indictor,
            'modal-t' : modalT
        },
        mounted(){
            var display = this;
            vEvent.$on('updateTimeline', value => {
                display.$children[0].timenode = value;
                timelineBox.currentTime = value;
            })
            vEvent.$on('updateDev', function(value){
                display.devID = value;
                display.$children[0].devID = value;
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
}





