const refresh = {
    template: 
    '<img id="refresh" :class="toTurn?\'turnOne\':\'\'" style="cursor:pointer; margin-bottom: -5px;margin-left:5px"\
     :src="refreshurl" width="25px" height="25px" @click="refresh" \
     title="刷新" alt="">',
     methods: {
        refresh : function(){
	    var that = this;
            this.$emit('refresh');
	    this.toTurn = true;
	    setTimeout(function(){
		that.toTurn = false;
		},300)
         }
     },
     mounted(){
     },
     data(){
         return {
             refreshurl : "img/refresh.png",
	     toTurn : false,
         }
     }
}
