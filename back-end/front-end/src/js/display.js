// jquery AJAX
$(document).ready(() => {
  var tempAryObj = [];  //存储临时JSON对象数组
  var isToggled_timeline = false; //时间轴请求栏，折叠
  var currentDomain = window.location.host;  //地址
  $("#csvinfo").attr("href", "http://" + currentDomain + "/download/csvinfo",);
  //每层信息导出数组
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
  //一组JSON数据写入表格
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

  //展示信息
  //初始状态
  $("#timeline").hide();
  //更新数据
  /*
  $("#button_update").click(() => {
    let infoJSON = $.ajax({
      url: "http://" + currentDomain + "/currentstate/data",
      type: "GET",
      contentType: "application/json",
      dataType: 'json',
      success: (data) => {
        if (data["serverError"]) {
          switch (Number(data["serverError"])) {
            case -100:
              alert("错误:-100 \n数据格式不符合要求！");
              break;
            default:
              alert("错误:未知 \n请检查服务器或温控设施!");
              break;
          }
        }

        if (data) {
          alert(JSON.stringify(data));
          //时间戳
          let t = data["Time"];
          let theTime = '20' + t[0] + '年' + t[1] + '月'
            + t[2] + '日' + t[3] + '时' + t[4] + '分';
          //更新表格
          makeTable(data, theTime);
        }
        else
          alert('抱歉！无数据可用！');
      },
      error: (err, textStatus) => {
        alert('请求错误：' + textStatus);
      }
    });
  })
  */


  //测试区
  $("#test").click(() => {
    let infoJSON = $.ajax({
      url: "http://" + currentDomain + "/currentstate/moredata?number=10",
      type: "GET",
      contentType: "application/json",
      dataType: 'json',
      success: (data) => {
        $("#timeline").toggle(90, "linear", function () {
          //折叠
          if (isToggled_timeline === true) {
            $("#timeline").empty();
            isToggled_timeline = !isToggled_timeline;
            return;
          }
          //展开
          //更新最新状态
          $("#button_update").trigger('click');
          tempAryObj = data;
          //获取时间轴
          for (index in tempAryObj) {
            let t = tempAryObj[index]["Time"];
            let theTime = '20' + t[0] + '年' + t[1] + '月'
              + t[2] + '日' + t[3] + '时' + t[4] + '分';
            $("#timeline").prepend('<li class="infoList">' + theTime
              + '<span class="nodeCycle"></span></li>');
          }
          $("#timeline li").eq(0).children(".nodeCycle").css("background-color", "red");
          $(".infoList").click(function () {
            let indexOfList = $(this).index()
            $("#timeline li").children(".nodeCycle").css("background-color", "white");
            let thisList = $("#timeline li").eq(indexOfList);
            thisList.children(".nodeCycle").css("background-color", "tomato");
            let theTime = thisList.text();
            //更新表格
            makeTable(tempAryObj[indexOfList], theTime);
          })
          isToggled_timeline = !isToggled_timeline;
        });
      },
      error: (err) => {
      }
    })
  })
})
