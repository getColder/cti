function checkInfo(data) {
    var isCorrect = true;
    console.log(data)
    isCorrect &= data.hasOwnProperty("Type");
    isCorrect &= data.hasOwnProperty("Id");
    isCorrect &= data.hasOwnProperty("Time");
    isCorrect &= data.hasOwnProperty("TempData");
    isCorrect &= data.hasOwnProperty("SpareData");
    if (isCorrect === false) {
        console.log('JSON-F格式错误!');
        return false;
    }
    if (data["Time"].length != 5) {
        console.log('JSON-T格式错误!');
        return false;
    }
    return isCorrect;
}

function makeRow(rowObj, row) {
    for (const k in rowObj) {
        if (typeof (rowObj[k]) === 'object') {
            makeRow(rowObj[k], row);
        }
        else
            row.push(rowObj[k]);
    }
    return row;
}

async function csvMake(dataObjArry) {
    var head = 'timeStap,floor,temp entry,temp out,vavle state,cool rotation,back rotation,\
  temp1,temp2,temp3,temp4,temp5,temp6,temp7,temp envir\r\n';
    console.log(dataObjArry)
    for (index in dataObjArry) {
        var data = dataObjArry[index];
        if(data === null || data === undefined){
            continue;
        }
        if(data === []){
            continue;
        }
        if(data === {}){
            continue;
        }
        if (!checkInfo(data)) {
            console.log('返回前' + index + '条数据.')
            return head;
        }
        for (var floor in data["TempData"]) {
            if (floor === '0') {
                data["Time"].forEach(element => {
                    head += element;
                });
            }
            head += ','
            var values = [];
            makeRow(data["TempData"][floor], values);
            values.forEach(value => {
                head += value;
                head += ',';
            });
            head += '\r\n';
        }
    }
    return head;
}

function makeTable(tableData, tableTimeStap) {
    $("#timeStap").text(tableTimeStap);
    $("#cycleTable tr.tableRow").each(function (order, element) {
        var values = [];
        makeRow(tableData["TempData"][order], values);
        var row = $(this).find("td");
        for (index in values) {
            row.eq(index).text(values[index]);
        }
    });
}

module.exports.csvMake = csvMake;