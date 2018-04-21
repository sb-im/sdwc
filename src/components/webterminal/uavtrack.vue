<template>
  <div>
      <el-button @click="send" type="warning" plain>初始化</el-button>
  <div id="map"></div>
  </div>
</template>
<script>

  export default {
    data() {
      return {
        map: Object,
        aa:  [
          {lat: 22.68724, lng: 113.968639},
          {lat: 22.6876402, lng: 114.2248700},
          {lat: 22.533503, lng: 114.01262},
          {lat: 22.748313, lng: 114.140157},
          {lat: 22.533503, lng: 114.11262}
        ]
      }
    },
    props: {
      flightPath: {
        type: Array,
        default: [
        {lat: 22.68724, lng: 113.968639},
        {lat: 22.6876402, lng: 114.2248700},
        {lat: 22.533503, lng: 114.01262},
        {lat: 22.748313, lng: 114.140157},
        {lat: 22.533503, lng: 114.11262},
        {lat: 22.68724, lng: 113.968639}
      ]},
      commands: {
        type: Array,
        default: Array
      }
    },
    mounted () {
      this.getData()
    },
    methods: {
      getData () {
        //let YOUR_API_KEY = ""
        //let url = "https://maps.googleapis.com/maps/api/js"
        let url = "https://ditu.google.cn/maps/api/js"
        //this.$jsonp(url, { key: YOUR_API_KEY }).then(json => {
        this.$jsonp(url, { key: this.$store.state.config.GMAP_API_KEY }).then(json => {
          this.initMap()
          // Success.
        }).catch(err => {
          console.log(err)
        })
      },
      initMap() {
          console.log("suuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu")
        this.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 10,
          center: {lat: 22.6876402, lng: 114.2248700},
          mapTypeId: 'terrain'
        });

        this.drawMap()
      },
      drawMap() {
        //console.log("drawMap")

        var flightPath = new google.maps.Polyline({
          //path: this.flightPlanCoordinates,
          path: this.aa,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });

        flightPath.setMap(this.map);

      },
      send(cmd = {lat: 22.533503, lng: 114.01262}) {
        //console.log("adddddddddddddddddddddd")
        //this.flightPlanCoordinates.push(
        //this.aa.push( {lat: 22.68724, lng: 113.968639} )
        this.aa.push(cmd)
        this.drawMap()
        //this.path.path = this.aa
        //console.log(this.path)
        //this.path.setMap(this.map);
        //this.$emit('cmd-send', cmd)
        // console.log(cmd)
      }
    }

  }
</script>


<style>
#map {
  width: 800px;
  height: 600px;
}
</style>
