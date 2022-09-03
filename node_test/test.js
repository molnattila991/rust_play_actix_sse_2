var EventSource = require('eventsource')
var XMLHttpRequest = require('xhr2');


start(10000);

function start(count) {
    var eventArray = [];
    var eventParirCount = count;

    for (let index = 0; index < eventParirCount; index++) {
        console.log(":::" + index);
        let client_id_A = generateUUID();
        let client_id_B = generateUUID();

        let eventA = new EventSource("http://localhost:8080/v1/events/messages/" + client_id_A);
        let eventB = new EventSource("http://localhost:8080/v1/events/messages/" + client_id_B);

        eventArray.push({ client_id_A, client_id_B });

        eventA.onmessage = (event) => {
            console.log(event.data);
        };

        eventB.onmessage = (event) => {
            console.log(event.data);
        };

    }
    setTimeout(() => start(1), 2000);

    // setTimeout(() => {
    //     for (const key in eventArray) {
    //         var obj = eventArray[key];
    //         intervalka(obj.client_id_A, obj.client_id_B);
    //         intervalka(obj.client_id_B, obj.client_id_A);
    //     }
    // },
    //     10000);
}

function intervalka(client_id_from, client_id_to) {
    send(client_id_from, client_id_to);
    var timer = randomIntFromInterval(2000, 10000);
    //console.log(timer, client_id_from, client_id_to)
    setTimeout(() => { intervalka(client_id_from, client_id_to) }, timer);
}

function send(client_id_from, client_id_to) {
    let postObj = {
        clientIdFrom: client_id_from,
        clientIdTo: client_id_to,
        message: `Message from ${client_id_from} to ${client_id_to}`
    }

    let post = JSON.stringify(postObj)

    const url = "http://localhost:8080/v1/events/messages"
    let xhr = new XMLHttpRequest()

    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
    xhr.send(post);

    xhr.onload = function () {
        if (xhr.status === 201) {
            //console.log("Post successfully created!")
        }
    }
}

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}