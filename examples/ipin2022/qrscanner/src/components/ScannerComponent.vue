<template>
  <div class="app">
    <QrcodeStream :track="paintOutline" @decode="onDecode"></QrcodeStream>
    <LoginModal :controller="controller" />
  </div>
</template>

<script>
import LoginModal from './LoginModal.vue';
import { SolidController, BuildingController } from 'ipin2022-common';
import { QrcodeStream } from 'vue-qrcode-reader';
import { DataObject, DataSerializer } from '@openhps/core';

DataSerializer.serialize(new DataObject())
export default {
  name: 'ScannerComponent',
  components: { 
    LoginModal,
    QrcodeStream,
  },
  data () {
    return {
      controller: null,
      buildingController: null
    }
  },
  beforeMount() {
    this.controller = new SolidController("IPIN2022 QR-scanner");
    this.buildingController = new BuildingController();
    this.buildingController.initialize().then(() => {
      // Ready
    }).catch(console.error);
  },
  methods: {
    onDecode(event) {
      // Get the first detected code
      // Check if it contains http://example.com/tracking.ttl# 
      const uri = event;
      if (uri.startsWith("http://example.com/tracking.ttl#")) {
        const spaceUID = uri.replace("http://example.com/tracking.ttl#", "");
        this.buildingController.findByUID(spaceUID).then(space => {
          console.log(space);
        }).catch(console.error);
      }
    },
    paintOutline(detectedCodes, ctx) {
      for (const detectedCode of detectedCodes) {
        const [ firstPoint, ...otherPoints ] = detectedCode.cornerPoints

        ctx.strokeStyle = "green";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(firstPoint.x, firstPoint.y);
        for (const { x, y } of otherPoints) {
          ctx.lineTo(x, y);
        }
        ctx.lineTo(firstPoint.x, firstPoint.y);
        ctx.closePath();
        ctx.stroke();
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.app {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
