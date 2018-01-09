var c=document.getElementById("myCanvas");
var ctx=c.getContext("2d");
/*
function tete () {
// 矩形
ctx.fillStyle="#FF0000";
ctx.fillRect(100,10,300,75);
drawActionPower()
}
*/
// 直线
function drawPower() {
  ctx.beginPath()
  ctx.moveTo(110,50);
  ctx.lineTo(200,50);
  ctx.lineTo(200,300);
  ctx.lineTo(290,300);
  ctx.lineTo(200,300);
  ctx.lineTo(200,550);
  ctx.lineTo(110,550);
  ctx.lineJoin = "round";
  ctx.lineWidth = 20;
  ctx.strokeStyle = 'rgba(204, 204, 204, 0.8)';
  ctx.stroke();
}
drawPower()

function drawSwitchPower(mode = "electrical") {
  drawPower()
  ctx.beginPath()
  if (mode == "electrical") {
  drawElectricalPower()
  } else if (mode == "solar_panel") {
    drawSolar_panelPower()
  }
  // 圆角
  ctx.lineJoin = "round";

  ctx.lineWidth = 8
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'
  ctx.stroke()
}


function drawElectricalPower() {
  ctx.moveTo(110,50);
  ctx.lineTo(200,50);
  ctx.lineTo(200,300);
  ctx.lineTo(300,300);
}
function drawSolar_panelPower() {
  ctx.moveTo(300,300);
  ctx.lineTo(200,300);
  ctx.lineTo(200,550);
  ctx.lineTo(110,550);
}

function drawUse(output = 0) {
  count = 6

  // line x length
  l = 100

  // x&y
  x_start = 500
  y_start = 0

  x_end = 1000
  y_end = 600

  // icon img
  img_l = 100
  img_h = 100
  img_status_l = 50
  img_status_h = 50

  h = (y_end - y_start) / count

  //alert(h)

  ctx.beginPath()
  ctx.lineTo(x_start-100, (y_end - y_start)/2 + y_start)
  ctx.lineTo(x_start, (y_end - y_start)/2 + y_start)
  for (i =0; i<count; i++ ) {
    //alert(i)
    ctx.lineTo(x_start, y_start + i*h + h/2)
    ctx.lineTo(x_start + l, y_start + i*h + h/2)
    ctx.lineTo(x_start, y_start + i*h + h/2)

    // icon
    draw_Img("/img/box_50.png", x_start + l + img_status_l/2, y_start + i*h + h/2 - img_status_h/2)
  /*
    var img = new Image()
    img.src = "/img/box1600.png"
    ctx.drawImage(img, x_start + l + img_status_l/2, y_start + i*h + h/2 - img_status_h/2, 50, 50)
*/
    draw_Img("/img/charged_battery_empty_100.png", x_start + l + img_l, y_start + i*h + h/2 - img_h/2)

    // color
    ctx.fillStyle="rgba(1, 0, 0, 1.0)";

    // text
    ctx.font="20px Arial";
    ctx.fillText("电池仓 "+ i, x_start + l + 10, y_start + i*h + img_h + h/2 - img_h/2);

    // color
    ctx.fillStyle="rgba(152, 204, 253, 1.0)";
    // %
    ctx.fillRect(x_start + l + img_l, y_start + i*h + 25 + h/2 - img_h/2, 180, 50);

    // color
    ctx.fillStyle="rgba(1, 0, 0, 0.8)";

    // text %
    ctx.font="30px Arial";
    ctx.fillText("99%", x_start + l + img_l + 100, y_start + i*h +  h/2 + 10);

    // text 9℃"
    ctx.font="30px Arial";
    ctx.fillText("29℃", x_start + l + img_l + 220, y_start + i*h +  h/2 + 10);
  }


  // 圆角
  ctx.lineJoin = "round";

  if (output == 1) {
    ctx.lineWidth = 8
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'
  } else {
    ctx.lineWidth = 20;
    ctx.strokeStyle = 'rgba(204, 204, 204, 0.8)';
  }
  ctx.stroke();
}
drawUse()
drawUse(1)

function draw_Img(src, x, y) {
  var img = {"src": src, "x": x, "y": y}
  drawImg(img)
}

function drawImg(source) {
  //alert(source.src)
  var img = new Image();
  img.src = source.src;
  img.onload = function() {
    ctx.drawImage(img, source.x, source.y);
  }
}

function drawAllImg() {
  var img = [
    {"src": "/img/electrical_100.png", "x": 10, "y": 0},
    {"src": "/img/solar_panel_100.png", "x": 10, "y": 500},
    {"src": "/img/car_battery_100.png", "x": 300, "y": 250}
    /*
    {"src": "/img/quad-col_100.png", "x": 600, "y": 0},
    {"src": "/img/box_100.png", "x": 600, "y": 100}
    */
  ]

  for (var i in img) {
    drawImg(img[i])
  }
}

//drawImg()
drawAllImg()

/*
// 文本
ctx.font="30px Arial";
ctx.fillText("Hello World",800,50);

*/

