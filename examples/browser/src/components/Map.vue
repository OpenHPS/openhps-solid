<template>
  <div class="map">
    <VlMap
      ref="map"
      data-projection="EPSG:4326"
      @created="onMapCreated"
    >
      <VlView
        ref="view"
        :center.sync="center"
        :zoom.sync="zoom"
        :rotation.sync="rotation"/>
      <VlLayerTile key="osm">
        <VlSourceOsm />
      </VlLayerTile>

      <VlGeoloc 
        @update:accuracy="position.accuracy = $event"
        @update:altitude="onUpdateAltitude"
        @update:altitudeaccuracy="position.altitudeAccuracy = $event"
        @update:heading="onUpdateHeading"
        @update:speed="position.speed = $event"
        @update:position="onUpdatePosition"
        @tracking-options="trackingOptions">
        <template #default="geoloc">
          <VlFeature
            v-if="geoloc.position"
            id="position-feature">
            <VlGeomPoint :coordinates="geoloc.position"/>
            <VlStyle>
              <VlStyleIcon
                src="../assets/marker.png"
                :scale="0.4"
                :anchor="[0.5, 1]"/>
            </VlStyle>
          </VlFeature>
        </template>
      </VlGeoloc>

    </VlMap>
    <LoginModel :controller="controller" />
  </div>
</template>

<script>
import { FullScreen } from 'ol/control';
import LoginModel from './LoginModel.vue';
import { SolidController } from '../controllers/SolidController';

export default {
  name: 'Map',
  components: { LoginModel },
  data () {
    return {
      center: [0, 0],
      zoom: 2,
      rotation: 0,
      trackingOptions: {
        enableHighAccuracy: true
      },
      position: {
        lnglat: [],
        altitude: null,
        heading: null,
        accuracy: null,
        altitudeAccuracy: null
      },
      controller: null
    }
  },
  beforeMount() {
    this.controller = new SolidController("OpenHPS Solid Example");
  },
  methods: {
    onMapCreated(vm) {
      this.map = vm;
      // Add visual controls to the map
      vm.addControls([
        new FullScreen(),
      ]);
    },
    onUpdatePosition(position) {
      this.position.lnglat = position;
      this.controller.updatePosition(this.position);
    },
    onUpdateAltitude(altitude) {
      this.position.altitude = altitude;
    },
    onUpdateHeading(heading) {
      this.position.heading = heading;
    },
  },
}
</script>

<style lang="scss" scoped>
.map {
  position: relative;
  width: 100%;
  height: 100%;

  .vl-map {
    position: relative;
  }
}

.base-layers-panel {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
}
</style>
