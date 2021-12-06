const indictor = {
    template: 
    '<table>\
        <tbody>\
            <tr>\
                <th></td>\
                <th>缺水</td>\
                <th>溢出</td>\
            </tr>\
            <tr>\
                <td>热水</td>\
                <td><img  :src="indic[0]" width="25px" height="25px"></td>\
                <td><img :src="indic[0]" width="25px" height="25px"></div></td>\
            </tr>\
            <tr>\
                <td>冷水</td>\
                <td><img :src="indic[1]" width="25px" height="25px"><div class="led"></td>\
                <td><img :src="indic[0]" width="25px" height="25px"></td>\
            </tr>\
        </tbody>\
    </table>',
    props:['showit'],
    data(){
        return{
            indic : ["img/led_white.png","img/led_red.png"]
            
        }
    }
}