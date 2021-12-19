var modalT = {
    props:['title'],
    template: '\
    <div class="modal-backdrop">\
            <div class="modal">\
            <div class="modal-header">\
                <h3>{{title}}</h3>\
            </div>\
            <div class="modal-body">\
                <slot></slot>\
            </div>\
            <div class="modal-footer">\
                <slot name="footbt"></slot>\
                <button type="button" class="btn-close" @click="closeit">关闭</button>\
                <button type="button" class="btn-confirm" :disabled="afterSubmit?\'disabled\':null" @click="confirmit()">确认</button>\
            </div>\
         </div>\
    </div>',
    methods: {
        closeit : function(){
            this.$emit('closemodal')
        },
        confirmit : function(){
            this.afterSubmit = true;
            this.$emit('confirmmodal');
        }
    },
    data() {
        return {
            afterSubmit : false
        }
    },
}