function timeFomart(fmt,time) {
  time = time && (time.toString().length!==10?time:time*1000);
  let _that = time?new Date(time):new Date(),
    o = {
      "M+" : _that.getMonth()+1,//月份
      "D+" : _that.getDate(),//日
      "h+" : _that.getHours(),//小时
      "m+" : _that.getMinutes(),//分
      "s+" : _that.getSeconds(),//秒
      "q+" : Math.floor((_that.getMonth()+3)/3),//季度
      "S"  : _that.getMilliseconds()//毫秒
    };
  if(/(Y+)/.test(fmt)) fmt=fmt.replace(RegExp.$1, (_that.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(let k in o) {
    if(new RegExp("("+ k +")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
  }
  return fmt;
}

export default {
  timeFomart
}
