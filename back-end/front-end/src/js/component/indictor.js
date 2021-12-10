const indictor = {
    template: 
    '<table style="margin:auto;width: 50%;margin-top:30px;">\
        <tbody>\
            <tr>\
                <th></td>\
                <th>缺水</td>\
                <th>溢出</td>\
            </tr>\
            <tr>\
                <td style="font-size: 25px">热水</td>\
                <td><img  :src="indic[0]" width="25px" height="25px"></td>\
                <td><img :src="indic[0]" width="25px" height="25px"></td>\
            </tr>\
            <tr>\
                <td style="font-size: 25px">冷水</td>\
                <td><img :src="indic[1]" width="25px" height="25px"></td>\
                <td><img :src="indic[0]" width="25px" height="25px"></td>\
            </tr>\
        </tbody>\
    </table>',
    props:['showit'],
    data(){
        return{
            indic : ["img/led_green.png","img/led_red.png"]
            
        }
    }
}