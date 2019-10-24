<template>
<div id="clock">
    {{this.date}}.{{this.month}}. {{this.hours}}:{{this.minutes}}:{{this.seconds}}
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class Clock extends Vue {
    private hours: string = "";
    private minutes: string = "";
    private seconds: string = "";
    private month: string = "";
    private date: string = "";
    private mounted() {
        setInterval(this.update, 500);
    }
    private update() {
        const d = new Date()
        const pad = (date: any) => {if (parseInt(date) < 10) {return "0" + date} else { return date; }};
        this.hours = pad(d.getHours())
        this.minutes = pad(d.getMinutes())
        this.seconds = pad(d.getSeconds())
        this.month = d.getMonth().toString()
        this.date = d.getDate().toString()
    }
}
</script>

<style scoped>
#clock {
    font-size-adjust: 2.15;
    padding-left: 10px;
}
</style>