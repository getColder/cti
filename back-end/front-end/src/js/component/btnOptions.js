const btnOptions = {
    props: ['index', 'infopage'],
    data() {
        return {
            isActive: false,
            activeCss: "btnOpt_inactive"
        }
    },
    template: '<button @click="slct" :class="activeCss"><span></span><slot><slot></button>',
    methods: {
        slct: async function () {
            vEvent.$emit('changeopt', this.index);         
        }
    },
    watch: {
        isActive: function (isActive, state) {
            if (isActive == state)
                return;
            if (isActive) {
                this.activeCss = "btnOpt_active";
            }
            else {
                this.activeCss = "btnOpt_inactive";
            }
        }
    }
}