const indictor = {
    template: 
    '<table id="indic">\
        <tbody>\
            <tr>\
                <th></th>\
                <th>热水箱</th>\
                <th>冷水箱</th>\
            </tr>\
            <tr v-if="false" id="waterHighLevel">\
                <td style="font-size: 25px">高水位</td>\
                <td><div class="waterHighLevel" v-if="ledindic[0] == 1"></div><img :src="(ledindic[0]!==undefined)?(ledindic[0]==1)?indic[1]:indic[0]:indic[0]" width="25px" height="25px"></td>\
                <td><div class="waterHighLevel" v-if="ledindic[1] == 1"></div><img :src="(ledindic[1]!==undefined)?((ledindic[1]==1)?indic[1]:indic[0]):indic[0]" width="25px" height="25px"></td>\
            </tr>\
            <tr>\
                <td style="font-size: 25px">低水位警示器</td>\
                <td><div class="waterLowLevel" v-if="ledindic[0] == 1"></div><img :src="(ledindic[0]!==undefined)?((ledindic[0]==0)?indic[0]:indic[2]):indic[0]" width="25px" height="25px"></td>\
                <td><div class="waterLowLevel" v-if="ledindic[1] == 1"></div><img :src="(ledindic[1]!==undefined)?((ledindic[1]==0)?indic[0]:indic[2]):indic[0]" width="25px" height="25px"></td>\
            </tr>\
        </tbody>\
    </table>',
    data(){
        return{
            ledindic: [0,0],
            indic : ["img/led_white.png","img/led_green.png","img/led_red.png"],    
        }
    }
}
