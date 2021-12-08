const tableInfoCom = {
    template: '<div class="tempTable"> \
    <table class="cycleTable"> \
        <thead> \
            <tr> \
                <td colspan="7" class="timeRow">时间戳:&nbsp;&nbsp;&nbsp;&nbsp; \
                    <span id="tabletitle">{{ time }}</span> \
                </td>\
                <td colspan="7" class="timeRow">定位:&nbsp;&nbsp;&nbsp;&nbsp; \
                <span id="tabletitle">贵州省花溪区</span> \
            </td> \
            </tr> \
            <tr id="tableHead"> \
                <th id="buttonHead_floor">层</th> \
                <th id="buttonHead_entry">入口温度</th> \
                <th id="buttonHead_out">出口温度</th> \
                <th id="buttonHead_vavleState">水泵状态</th> \
                <th id="buttonHead_rotate_cool">冷水阀角度</th> \
                <th id="buttonHead_rotate_back">回水阀角度</th> \
                <th id="buttonHead_T1">混凝土温度1</th> \
                <th id="buttonHead_T2">混凝土温度2</th> \
                <th id="buttonHead_T3">混凝土温度3</th> \
                <th id="buttonHead_T4">混凝土温度4</th> \
                <th id="buttonHead_T5">混凝土温度5</th> \
                <th id="buttonHead_T6">混凝土温度6</th> \
                <th id="buttonHead_T7">混凝土温度7</th> \
                <th id="buttonHead_T8">环境温度</th> \
            </tr> \
        </thead> \
        <tbody v-if="infos.length > 0"> \
            <tr class="tableRow" v-for="data in infos" :key="data.floor"> \
                <td>{{ data.Floor }}</td> \
                <td>{{ data.WaterTemp[0] }}</td> \
                <td>{{ data.WaterTemp[1] }}</td> \
                <td>{{ data.PumpStaus }}</td> \
                <td>{{ data.ValveStatus[0] }}</td> \
                <td>{{ data.ValveStatus[1] }}</td> \
                <td>{{ data.CementTemp[0] }}</td> \
                <td>{{ data.CementTemp[1] }}</td> \
                <td>{{ data.CementTemp[2] }}</td> \
                <td>{{ data.CementTemp[3] }}</td> \
                <td>{{ data.CementTemp[4] }}</td> \
                <td>{{ data.CementTemp[5] }}</td> \
                <td>{{ data.CementTemp[6] }}</td> \
                <td>{{ data.EnvirTemp }}</td> \
            </tr> \
        </tbody> \
    </table> \
</div>',
    data() {
        return {
            time: '未知',
            devID: '未知',
            infos: [],
            timenode: [],
        }
    },
    methods:{
        displayData: function(info){
            if(!info){
                this.time = '未知';
                this.infos = [];
                return;
            }
            if(!info.Time || !info.TempData){
                this.time = '未知';
                this.infos = [];
                return;
            }
            var time = '';
            time += info.Time[0] + '年';
            time += info.Time[1] + '月';
            time += info.Time[2] + '日';
            time += info.Time[3] + '时';
            time += info.Time[4] + '分';
            this.time = time;
            this.infos = info.TempData;
        },
        updateData: function(value){
            var thisTable = this;
            axios.get(value)
            .then(function (response) {
                thisTable.time = '未知';
                thisTable.infos = [];
                if(!response.data){
                    return;
                }
                if(response.data != ''){
                    thisTable.displayData(response.data)
                    thisTable.devID = response.data.Id?response.data.Id:0
                }
            })
            .catch(function (error) {
                alert('请求错误' + error);
            });
        }
    },
    watch:{
        timenode: function(){
            let timestr = '' + this.timenode[0] + this.timenode[1] + this.timenode[2] + this.timenode[3] + this.timenode[4];
            this.updateData('/currentstate/data?devid='+ this.devID +'&' + "timenode=" + timestr);
            currentTimenode = timestr;
        },
        devID: function(){
            this.updateData('/currentstate/data?devid='+ this.devID);
        }
    },
    mounted(){
        this.devID = currentDevId;
        this.updateData('/currentstate/data?devid='+ this.devID)
    }
}
