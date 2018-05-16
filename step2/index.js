var startButton = document.getElementById('startButton');
var callButton = document.getElementById('callButton');
var localVideo = document.getElementById('localVideo');
var pc1;

var pc2;
var configuration = {
    "iceServers": [{"url": "stun:stun2.1.google.com:19302"}]
};
startButton.onclick = start;
callButton.onclick = call;
var socket = io('https://localhost?userId=pc1');
socket.on("getCandidateFromPC2",getCandidateFromPC2);
socket.on("getReady",getReady);
socket.on("getAnswer",getAnswer);
function start() {
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    })
        .then(function gotStream(stream) {
            localVideo.srcObject = stream;
            localStream = stream;
        })
        .catch(function (e) {
            alert('getUserMedia() error: ' + e.name);
        });
}

// pc1
function call() {
    pc1 = new RTCPeerConnection(configuration);
    pc1.onicecandidate = function (e) {
        socket.emit("tellIceCandidateToPC1",{target:"pc2",data: e.candidate});
    };
    addTrack();
    socket.emit("call",{target:"pc2"});
}

function addTrack() {
    pc1.addStream(localStream);
}

function getReady() {
    // return;
    pc1.createOffer({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
    }).then(
        function (desc) {
            pc1.setLocalDescription(desc);
            socket.emit("askToPC2",{target:"pc2",data: desc});
        },
        function (err) {
            console.error(err);
        }
    );
}

function getAnswer(data) {
    let desc = data.data;
    pc1.setRemoteDescription(desc);
}

function getCandidateFromPC2(data) {
    let candidate = data.data;
    if (candidate) {
        pc1.addIceCandidate(candidate);
    }
}


