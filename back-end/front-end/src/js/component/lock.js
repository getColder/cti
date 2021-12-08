const lockAutoUp = {
    template: 
    '<img style="cursor:pointer; margin-bottom: -5px;margin-left:10px"\
     :src="lockurl" width="25px" height="25px" @click="lockupdate" \
     title="锁定自动更新" alt="">',
     methods: {
        lockupdate : function(){
            this.state = !this.state;
            if(this.state){
                this.lockurl = "img/lock.png"
            }
            else{
                this.lockurl = "img/unlock.png"
            }
            this.$emit('lockupdate', this.state);
         }
     },
     mounted(){
     },
     data(){
         return {
             state : false,
             lockurl : "img/unlock.png"
         }
     }
}