<template>
    <div class="roomStatus">
        <div class="lights">
            <div class="header">Light statuses</div>
            <div id="desk">Desk lamp: {{this.deskOn}}</div>
            <div id="white">White lamp: {{this.whiteOn}}</div>
            <div id="ceilingon">Ceiling lamp: {{this.ceilingOn}}</div>
            <div id="ceilingbri">Ceiling lamp brightness: {{this.ceilingBrightness}} (0-254)</div>
            <div id="ceilingct">Ceiling lamp hue: {{this.ceilingHue}} (153-454)</div>
            <div id="ambienceon">Ambience lamp: {{this.ceilingOn}}</div>
            <div id="ambiencebri">Ambience lamp brightness: {{this.ceilingBrightness}} (0-254)</div>
            <div id="ambiencect">Ambience lamp hue: {{this.ceilingHue}} (153-454)</div>
        </div>
        <div class="conditions">
            <div class="header">Room conditions</div>
            <div id="temperature">Temperature: {{this.temperature}} °C</div>
            <div id="humidity">Humidity: {{this.humidity}} %</div>
        </div>
        <div class="scene">
            <div class="header">Active lightning scene</div>
            <div class="container">
                <div v-bind:class="{active: scene==1}" class="box">OFF</div>
                <div v-bind:class="{active: scene==2}" class="box">DIM</div>
                <div v-bind:class="{active: scene==3}" class="box">FULL</div>
                <div v-bind:class="{active: scene==-1}" class="box">OTHER</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class RoomStatus extends Vue {
    private pollingInterval: number = 10000;
    private temperature: number = 20;
    private humidity: number = 50;
    private deskOn: string = "OFF";
    private whiteOn: string = "OFF";
    private ceilingOn: string = "OFF";
    private ceilingHue: string = "100";
    private ceilingBrightness: string = "100";
    private ambienceOn: string = "OFF";
    private ambienceHue: string = "100";
    private ambienceBrightness: string = "100";
    private scene: number = -1;
    private baseURL = "Http://192.168.1.122:5000";
    private mounted() {
        window.addEventListener("keydown", async ev => {
            if (ev.key === "1") {
                await fetch(this.baseURL + "/ds?target=0&on=0");
                await fetch(this.baseURL + "/ds?target=1&on=0");
                await fetch(this.baseURL + "/ds?target=2&on=0");
                await fetch(this.baseURL + "/ds?target=3&on=0");
            } else if (ev.key === "2") {
                await fetch(this.baseURL + "/ds?target=0&on=0");
                await fetch(this.baseURL + "/ds?target=1&on=0");
                await fetch(this.baseURL + "/ds?target=2&on=1");
                await fetch(this.baseURL + "/ds?target=3&on=1");

                await fetch(this.baseURL + "/ds?target=2&on=1&ct=400&bri=63");
                await fetch(this.baseURL + "/ds?target=3&on=1&ct=400&bri=63");
            } else if (ev.key === "3") {
                await fetch(this.baseURL + "/ds?target=0&on=1");
                await fetch(this.baseURL + "/ds?target=1&on=1");
                await fetch(this.baseURL + "/ds?target=2&on=1");
                await fetch(this.baseURL + "/ds?target=3&on=1");

                await fetch(this.baseURL + "/ds?target=2&on=1&ct=200&bri=254");
                await fetch(this.baseURL + "/ds?target=3&on=1&ct=200&bri=254");
            } else if (ev.key === "5") {
                const screensStatus = await (await fetch(
                    this.baseURL + "/ds?target=9"
                )).json();
                if (parseInt(screensStatus.on) === 1)
                    await fetch(this.baseURL + "/ds?target=9&on=0");
                else await fetch(this.baseURL + "/ds?target=9&on=1");
            }
            this.poll();
        });
        this.startPolling();
        this.poll();
    }
    private async startPolling() {
        setInterval(this.poll, this.pollingInterval);
    }
    private async poll() {
        const conditionsRaw = await fetch(this.baseURL + "/room_conditions");
        const conditionsJson = await conditionsRaw.json();
        this.temperature = conditionsJson.temperature;
        this.humidity = conditionsJson.humidity;

        const statusRaw = await fetch(this.baseURL + "/ds");
        const statusJson = await statusRaw.json();

        this.whiteOn = this.extractStatus(statusJson["0"]);
        this.deskOn = this.extractStatus(statusJson["1"]);

        this.ambienceOn = this.extractStatus(statusJson["2"]);
        this.ambienceBrightness = statusJson["2"]["bri"];
        this.ambienceHue = statusJson["2"]["ct"];

        this.ceilingOn = this.extractStatus(statusJson["3"]);
        this.ceilingBrightness = statusJson["3"]["bri"];
        this.ceilingHue = statusJson["3"]["ct"];
        this.scene = this.getActiveScene();
    }
    private getActiveScene() {
        if (
            this.ambienceOn === "OFF" &&
            this.ceilingOn === "OFF" &&
            this.whiteOn === "OFF" &&
            this.deskOn === "OFF"
        ) {
            return 1;
        } else if (
            this.ambienceOn === "ON" &&
            this.ceilingOn === "ON" &&
            this.whiteOn === "OFF" &&
            this.deskOn === "OFF" &&
            this.ambienceBrightness.toString() === "63" &&
            this.ceilingBrightness.toString() === "63"
        ) {
            return 2;
        } else if (
            this.ambienceOn === "ON" &&
            this.ceilingOn === "ON" &&
            this.whiteOn === "ON" &&
            this.deskOn === "ON" &&
            this.ambienceBrightness.toString() === "254" &&
            this.ceilingBrightness.toString() === "254"
        )
            return 3;
        else return -1;
    }
    private extractStatus(s: any) {
        return s["on"] === 0 ? "OFF" : "ON";
    }
}
</script>

<style scoped>
.roomStatus {
    margin: 10px;
    font-weight: bold;
    width: 33%;
}
.roomStatus div {
    font-size-adjust: 1.02;
}

.roomStatus > div {
    margin-bottom: 50px;
}

.conditions {
    display: flex;
    flex-direction: column;
}
.header {
    font-size-adjust: 1.2 !important;
    margin-bottom: 10px;
}
.scene .container {
    display: flex;
}
.box {
    text-align: center;
    border: 5px solid rgba(122, 122, 122, 0.35);
    flex: 1 1 0px;
}
.active {
    border: 5px solid darkslateblue !important;
}
</style>
