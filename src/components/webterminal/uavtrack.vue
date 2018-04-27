<template>
  <div id="map"></div>
</template>
<script>

  export default {
    data() {
      return {
        map: Object,
        flightPath:  [
          {lat: 22.68724, lng: 113.968639},
          {lat: 22.6876402, lng: 114.2248700},
          {lat: 22.533503, lng: 114.01262},
          {lat: 22.748313, lng: 114.140157},
          {lat: 22.533503, lng: 114.11262}
        ]
      }
    },
    props: {
      commands: {
        type: Array,
        default: Array
      }
    },
    mounted () {
      this.getGmap()
    },
    methods: {
      getGmap() {

        // Reverse proxy corss GWF in China
        let url = "https://ditu.gdgdocs.org/maps/api/js"

        // Google official map API
        //let url = "https://maps.googleapis.com/maps/api/js"

        // Google China official map API
        //let url = "https://ditu.google.cn/maps/api/js"

        //let YOUR_API_KEY = ""
        //this.$jsonp(url, { key: YOUR_API_KEY }).then(json => {
        this.$jsonp(url, { key: this.$store.state.config.GMAP_API_KEY }).then(json => {
          this.initMap()
          this.drawPath()
          // Success.
        }).catch(err => {
          console.log(err)
        })
      },
      initMap(point = {lat: 22.6876402, lng: 114.2248700}) {
        this.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 20,
          center: point,
          mapTypeId: 'terrain'
        })
      },
      drawPath(point = {lat: 22.68724, lng: 113.968639}) {
        this.flightPath.push(point)

        var flightPath = new google.maps.Polyline({
          path: this.flightPath,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        })

        flightPath.setMap(this.map)
      },
      clearPath() {
        this.flightPath = []
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
