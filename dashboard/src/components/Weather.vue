<template>
    <div class="weather">
        <div id="mapthing"></div>
        <div id="actualConditions">
            <div class="conditionsText">
                <div class="header">Otaniemi {{this.prettifiedDate}}</div>
                <div>Temperature: {{this.conditions.temp}} °C</div>
                <div>Wind speed: {{this.conditions.windSpeed}} m/s</div>
                <div>Relative humidity: {{this.conditions.relativeHumidity}} %</div>
                <div>Rain (latest 10 min): {{this.conditions.rain}} mm</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Feature, { FeatureClass } from "ol/Feature";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { OSM, Vector as VectorSource, ImageWMS } from "ol/source";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import Circle from "ol/geom/Circle.js";
import ImageStyle from "ol/style/Image";
import { click } from "ol/events/condition";
import { Select } from "ol/interaction";
import Layer from "ol/layer/Layer";
import BaseLayer from "ol/layer/Base";
import HeatmapLayer from "ol/layer/Heatmap";
import TileWMS from "ol/source/TileWMS";
import RasterSource from "ol/source/Raster";
import WMSCapabilities from "ol/format/WMSCapabilities";
import ImageLayer from "ol/layer/Image";
import SunCalc from "suncalc";
import { extend } from "ol/extent";

@Component
export default class Weather extends Vue {
    private ts: ImageWMS;
    private cloudinessSource: ImageWMS;
    private map: Map;
    private tl: ImageLayer;
    private cloudinessLayer: ImageLayer;
    private prettifiedDate: string = "";
    private conditions = {
        temp: "0",
        relativeHumidity: "0",
        rain: "0",
        windSpeed: "0",
        windDirection: "0",
        icon: "1"
    };
    // private lat: number = 60.180619;
    // private lng: number = 24.8872837;
    private lat: number = 60.727485587;
    private lng: number = 23.799245194;
    private iconURL: string = "symbols/1.svg";
    private mounted() {
        this.ts = new ImageWMS({
            url: "/radar_proxy",
            //"https://openwms.fmi.fi/geoserver/Radar/wms?service=WMS&version=1.3.0",
            params: { LAYERS: "suomi_rr_eureffin" /*, 'TILED': true*/ },
            serverType: "geoserver",
            ratio: 1
            // Countries have transparency, so do not fade tiles:
        });
        this.cloudinessSource = new ImageWMS({
            url: "/radar_proxy",
            //"https://openwms.fmi.fi/geoserver/Radar/wms?service=WMS&version=1.3.0",
            params: { LAYERS: "cloudiness-forecast" /*, 'TILED': true*/ },
            serverType: "geoserver",
            ratio: 1
            // Countries have transparency, so do not fade tiles:
        });


        this.tl = new ImageLayer({
            source: this.ts
        });
        this.cloudinessLayer = new ImageLayer({
            source: this.cloudinessSource
        });
        this.map = new Map({
            view: new View({
                center: fromLonLat([this.lng, this.lat]),
                zoom: 8
            }),
            target: "mapthing",
            layers: [
                new TileLayer({
                    source: new XYZ({
                        //url: "https://napuu.xyz/tiles/{z}/{x}/{y}.png"
                        url: "/tiles/{z}/{x}/{y}.png"
                    })
                }),
                // vectorLayer,
                this.tl,
                // this.cloudinessLayer
            ]
        });
        /*
        this.map.on("postcompose", ev => {
            const extent = this.map.getView().calculateExtent(this.map.getSize())
            const grid = this.constructGrid(extent);

        })
        */
        this.poll();
        this.getObservations();
    }
    private constructGrid(extent: Array<number>) {
        const stepSizeKilometers = 10;
        const res = [];
        for (let x = extent[0]; x < extent[2]; x += stepSizeKilometers) {
            for (let y = extent[1]; y < extent[3]; y += stepSizeKilometers) {
                res.push([x, y]);
            }
        }
    }
    private getObservations() {
        fetch(
            "http://data.fmi.fi/fmi-apikey/c032f648-f04d-48b7-95e5-af7541906622/wfs?request=getFeature&storedquery_id=fmi::observations::weather::multipointcoverage&place=otaniemi"
        )
            .then(resp => resp.text())
            .then(async resp => {
                let observations = getTag(
                    resp,
                    "gml:doubleOrNilReasonTupleList"
                ).split("\n");
                let currentConditions = observations[observations.length - 2]
                    .trim()
                    .split(" ");
                const positions = getTag(resp, "gmlcov:positions").split("\n");
                const currentLocation = positions[positions.length - 2].trim().split(" ");
                const latestObservationDate = new Date(parseInt(currentLocation[3]) * 1000);

                const pad = (date: any) => {if (parseInt(date) < 10) {return "0" + date} else { return date; }};
                this.prettifiedDate = pad(latestObservationDate.getHours()) + ":" + pad(latestObservationDate.getMinutes()) + " " + latestObservationDate.getDate() + "." + latestObservationDate.getMonth() + "."
                if (currentConditions !== undefined) {
                    console.log(currentConditions);
                    this.conditions = {
                        temp: currentConditions[0],
                        windSpeed: currentConditions[1],
                        windDirection: currentConditions[3],
                        relativeHumidity: currentConditions[4],
                        rain: currentConditions[7],
                        icon: currentConditions[12]
                    };
                    let end = parseInt(this.conditions.icon) + 1 + ".svg";
                    let start = "symbols/";
                    let mid = "";
                    const now = new Date();
                    const sunsetsunrise = SunCalc.getTimes(
                        now,
                        this.lat,
                        this.lng
                    );
                }
                // fmi updates forecast every 5 minutes
                //setTimeout(this.fetchLatestForecast, 1000*60*5);
            });
        function getTag(xml: string, tag: string) {
            let expr = new RegExp("<" + tag + ">(.|\n)*?</" + tag + ">");
            let text = xml.match(expr);
            let resp: string;
            resp = text[0].substring(
                tag.length + 2,
                text[0].length - tag.length - 3
            );
            return resp;
        }
    }
    // https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/101.svg
    private async startPolling() {}
    private async poll() {
        const params = this.ts.getParams();
        params.t = new Date().getMilliseconds();
        this.ts.updateParams(params);
        setTimeout(this.poll, 30000);
    }
    private extractStatus(s: any) {}
}
</script>

<style scoped>
.weather {
    margin: 10px;
    font-weight: bold;
}
.roomStatus div {
    font-size-adjust: 1.02;
}

.lights {
    margin-bottom: 50px;
}
.conditions {
    display: flex;
    flex-direction: column;
}
.header {
    font-size-adjust: 1.2 !important;
    margin-bottom: 5px;
    padding-top: 9px;
}
#actualConditions {
    font-size-adjust: 1.00 !important;
    padding-left: 10px;
    display: flex;
}
img {
    height: 200px;
    padding: 5px;
}
.conditionsText div {
    text-align: justify;
}
#mapthing {
    width: 1300px;
    height: 800px;
}
</style>
