
var remoteVideo = document.getElementById('remoteVideo');
var pc2;
var configuration = {
    "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
};
var socket = io('https://localhost?userId=pc2');
socket.on("getCall",getCall);
socket.on("getAsk",getAsk);
socket.on("getCandidateFromPC1",getCandidateFromPC1);
// // pc2
function getCall() {
    console.log("getCall")
    pc2 = new RTCPeerConnection(configuration);
    pc2.onicecandidate = function(e) {
        console.log("pc2.onicecandidate ")
        socket.emit("tellIceCandidateToPC1",{target:"pc1",data: e.candidate});
    };
    pc2.ontrack = function gotRemoteStream(e) {
        console.log("pc2.ontrack" , e.streams[0])
        if (remoteVideo.srcObject !== e.streams[0]) {
            remoteVideo.srcObject = e.streams[0];
        }
    };
    socket.emit("readyToPC1",{target:"pc1"});
}

function getAsk(data) {
    console.log("getAsk")
    let desc = data.data;
    pc2.setRemoteDescription(desc);
    pc2.createAnswer().then(
        function onCreateAnswerSuccess(desc) {
            pc2.setLocalDescription(desc);
            socket.emit("answerToPC1",{target:"pc1",data: desc});
        },
        function (err) {
            console.error(err);
        }
    );
    console.log("getAsk")
}
function getCandidateFromPC1(data) {
    let candidate = data.data;
    console.log("getCandidateFromPC1")
    if(candidate){
        pc2.addIceCandidate(candidate);
    }
}

