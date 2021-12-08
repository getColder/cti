const refresh = {
    template: 
    '<img id="refresh" style="cursor:pointer; margin-bottom: -5px;margin-left:5px"\
     :src="refreshurl" width="25px" height="25px" @click="refresh" \
     title="刷新" alt="">',
     methods: {
        refresh : function(){
            this.$emit('refresh');
         }
     },
     mounted(){
     },
     data(){
         return {
             refreshurl : "img/refresh.png"
         }
     }
}