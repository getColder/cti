const lockAutoUp = {
    template: 
    '<img :src="lockurl" @click="lockupdate" \
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
             state : true,
             lockurl : "img/lock.png"
         }
     }
}
