export default {
  // 服务器本地
  local:{
    debug: '/user',
    login: '/oauth/token',
    nodes: '/api/v1/nodes',
    plans: '/api/v1/plans',
    user: '/api/v1/user/'
  },
  // 服务器远端
  remote: {
    // Reverse proxy corss GWF in China
    gMap: "https://ditu.gdgdocs.org/maps/api/js",
    // Google official map API
    //gMap: "https://maps.googleapis.com/maps/api/js",
    // Google China official map API
    //gMap: "https://ditu.google.cn/maps/api/js",
    cyApi: 'https://api.caiyunapp.com/v2',
    weather: 'https://weather.sb.im/get'
  }
}
