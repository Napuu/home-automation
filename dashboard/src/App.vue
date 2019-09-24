<template>
    <div id="app">
        <RoomStatus />
        <Weather />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import RoomStatus from "./components/RoomStatus.vue";
import Weather from "./components/Weather.vue";
import SunCalc from "suncalc";

@Component({
    components: {
        RoomStatus,
        Weather
    }
})
export default class App extends Vue {
    private lat: number = 60.180619;
    private lng: number = 24.8872837;
    private mounted() {
      this.poll();
    }
    private poll() {
        const now = new Date();
        const sunsetsunrise = SunCalc.getTimes(now, this.lat, this.lng);
        const sunset = new Date(sunsetsunrise.sunset);
        const sunrise = new Date(sunsetsunrise.sunrise);
        if (!(now > sunrise && now < sunset)) {
          //document.body.style.filter = "invert(1) hue-rotate(180deg)";
          console.log("night");
        }
        else document.body.style.filter = "";
        setTimeout(this.poll, 1000 * 60 * 5);
    }
}
</script>

<style>
#app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: grey;
    display: flex;
}
body {
    background: #DDD;
}
</style>
