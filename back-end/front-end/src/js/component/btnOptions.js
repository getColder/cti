const btnOptions = {
    data(){
        return{
            isActive : false,
            activeCss: "btnOpt_inactive"
        }
    },
    template: '<button @click="slct" :class="activeCss"><slot><slot></button>',
    methods : {
        slct: async function(){
            this.$parent.$emit('changeOpt',this._uid);
            //测试
            if(this.$slots.default[0].text === '测试'){
                axios
                .get('http://' + host + '/currentstate/data?devid='+currentDevId)
                .then((response) => {
                  alert(JSON.stringify(response.data));
                })
                .catch(function(error){
                  alert('数据异常' + error);
                })
            }
        }
    },
    watch:{
        isActive: function(isActive, state){
            if(isActive == state)
                return;
            if(isActive){
                this.activeCss = "btnOpt_active";
            }
            else{
                this.activeCss = "btnOpt_inactive";
            }
        }
    }
}