<template>
  <div class="app">
    <QrcodeStream @track="paintOutline" @decode="onDecode"></QrcodeStream>
    <LoginModal :controller="controller" />
  </div>
</template>

<script>
import LoginModal from './LoginModal.vue';
import { SolidController } from '../controllers/SolidController';
import { QrcodeStream } from 'vue-qrcode-reader';

export default {
  name: 'ScannerComponent',
  components: { 
    LoginModal,
    QrcodeStream,
  },
  data () {
    return {
      controller: null
    }
  },
  beforeMount() {
    this.controller = new SolidController("OpenHPS Solid Example");
  },
  methods: {
    onDecode(event) {
      console.log(event);
    },
    paintOutline (detectedCodes, ctx) {
      console.log(detectedCodes);
      for (const detectedCode of detectedCodes) {
        const [ firstPoint, ...otherPoints ] = detectedCode.cornerPoints

        ctx.strokeStyle = "red";

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
