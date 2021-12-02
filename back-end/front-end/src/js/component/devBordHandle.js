const devBordHandleCOM = {
    template:   //名称+数量
    '<div v-if="show" :class="{\'devBord-online\' : true,\
    \'switch-on\': move , \'switch-off\': !move}">\
    <div @click="switchBord"  style="float: none; padding-top: 35%;position: relative;\
    top: 15%;writing-mode : tb-rl;"><slot></slot></div>\
    <div style="font-size:17px;color:#9a3520;\
    width: 40px;height: 30px;background-color: #cdcdcd53;\
    float: right;margin-top: 30px;position: relative;top: 20%">\
    {{ devID }}</div>\
    <div class = "devCard" >\
    <select v-model="temp_devID" class="slct_switchDev">\
        <option v-for="dev in devIDs" :value="dev" :key="dev">设备{{dev}}</option>\
    </select>\
    <button @click="setDev(temp_devID)" class="btn_switchDev"">切换设备</button>\
    <div style="position:relative;top: 0px;float:left;width:75%;\
    font-size: 44%;padding:5%;background-color:#22739572;border-radius:3px;padding-bottom:5px;padding-top:15px">地点：贵阳市花溪区</div>\
    <div class="btn_devoption"  style="position:relative;top: 0px;float:left;width:75%;border: 1px solid white;\
    font-size: 0%;padding:0;background-color:#a23335">\
    <button type="defalut" style="position:relative;width:33%;height:74px;background-color:#22739522;color:white;border-width:2px;border-right: 1px solid white">设备数据库</button>\
    <button type="defalut" style="position:relative;width:33%;height:74px;background-color:#22739522;color:white;border-width:2px;border-right: 1px solid white">设备曲线图</button>\
    <button type="defalut" style="position:relative;width:34%;height:74px;background-color:#22739522;color:white;border-width:2px;border-right: 1px solid white">修改设备信息</button>\
    </div>\
    </div>\
    </div>',
    data(){
        return{
            devID : '-1',
            devIDs : [1],
            move : false,
            show : false,
            temp_devID: '-1'
        } 
    },
    methods:{
        switchBord(){
            this.move = (!this.move);
        },
        setDev(value){
            this.devID = value;
            this.$parent.switchDev(value);
        },
        getDevs(){
            var devbord = this;
            axios.get('/currentstate/devs')
            .then(function(response){
                if(response.data){
                    devbord.devIDs = response.data;
                }
                else
                    devbord.devIDs = [];
            })
        }
    },
    mounted(){
        devID = currentDevId;
        this.show = true;
        this.getDevs();
    }
}



