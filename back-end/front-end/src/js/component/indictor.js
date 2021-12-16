const indictor = {
    template: 
    '<table id="indic">\
        <tbody>\
            <tr>\
                <th></td>\
                <th>水箱1</td>\
                <th>水箱2</td>\
            </tr>\
            <tr v-if="false" id="waterHighLevel">\
                <td style="font-size: 25px">高水位</td>\
                <td><div class="waterHighLevel" v-if="ledindic[0] == 1"></div><img :src="(ledindic[0]!==undefined)?(ledindic[0]==1)?indic[1]:indic[0]:indic[0]" width="25px" height="25px"></td>\
                <td><div class="waterHighLevel" v-if="ledindic[1] == 1"></div><img :src="(ledindic[1]!==undefined)?((ledindic[1]==1)?indic[1]:indic[0]):indic[0]" width="25px" height="25px"></td>\
            </tr>\
            <tr>\
                <td style="font-size: 25px">低水位</td>\
                <td><div class="waterLowLevel" v-if="ledindic[0] == 0"></div><img :src="(ledindic[0]!==undefined)?((ledindic[0]==0)?indic[2]:indic[0]):indic[0]" width="25px" height="25px"></td>\
                <td><div class="waterLowLevel" v-if="ledindic[1] == 0"></div><img :src="(ledindic[1]!==undefined)?((ledindic[1]==0)?indic[2]:indic[0]):indic[0]" width="25px" height="25px"></td>\
            </tr>\
        </tbody>\
    </table>',
    props:['showit'],
    data(){
        return{
            ledindic: [0,0],
            indic : ["img/led_white.png","img/led_green.png","img/led_red.png"],    
        }
    }
}
