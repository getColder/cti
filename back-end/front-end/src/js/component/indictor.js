const indictor = {
    template: 
    '<table id="indic">\
        <tbody>\
            <tr>\
                <th></td>\
                <th>缺水</td>\
                <th>溢出</td>\
            </tr>\
            <tr>\
                <td>指示器1</td>\
                <td><img :src="indic[0]" width="25px" height="25px"></td>\
                <td><img :src="indic[0]" width="25px" height="25px"></td>\
            </tr>\
            <tr>\
                <td>指示器2</td>\
                <td><img :src="indic[1]" width="25px" height="25px"></td>\
                <td><img :src="indic[0]" width="25px" height="25px"></td>\
            </tr>\
        </tbody>\
    </table>',
    data(){
        return{
            indic : ["img/led_white.png","img/led_red.png"]
            
        }
    }
}