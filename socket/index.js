var io = require('socket.io')(35639);
var fetch = require("node-fetch");
let broadcastTimeout = setInterval(broadcast, 1000);
io.on('connection', function(socket){
    socket.on("accessory", function (data) {
        let fetchURL = "http://localhost:5000/ds?target=" + data.target + "&";
        if (data.mode == "bri" && data.value == -1) {
            fetchURL += "on=0&";
        } else if (data.mode == "bri") {
            fetchURL += "on=1&";
        }
        fetchURL += data.mode + "=" + data.value;
        fetch(fetchURL).then(res => {
            //done
        });
    });
});

function broadcast() {
    fetch("http://localhost:5000/ds").then((resp) => resp.json(), (err) => console.log(err)).then(json => {
        io.emit("status", json);
    });
}
