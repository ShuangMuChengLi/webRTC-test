
var remoteVideo = document.getElementById('remoteVideo');
var pc2;
var pc1;
var configuration = {
    "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
};
var socket = io('https://localhost?userId=pc2');
socket.on("getCall",getCall);
socket.on("getAsk",getAsk);
socket.on("getCandidateFromPC1",getCandidateFromPC1);

socket.on("getCandidateFromPC2",getCandidateFromPC2);
socket.on("getReady",getReady);
socket.on("getAnswer",getAnswer);
let localStream;
// // pc2
function getCall() {
    pc2 = new RTCPeerConnection(configuration);
    pc2.onicecandidate = function(e) {
        socket.emit("tellIceCandidateToPC1",{target:"pc1",data: e.candidate});
    };
    // pc2.ontrack = function gotRemoteStream(e) {
    //     console.log("pc2.ontrack" , e.streams[0])
    //     if (remoteVideo.srcObject !== e.streams[0]) {
    //         remoteVideo.srcObject = e.streams[0];
    //     }
    // };
    pc2.onaddstream = (e) => {
        remoteVideo.srcObject = e.stream;
        localStream = e.stream;
        call();
    };
    socket.emit("readyToPC1",{target:"pc1"});
}

function getAsk(data) {
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
}
function getCandidateFromPC1(data) {
    let candidate = data.data;
    if(candidate){
        pc2.addIceCandidate(candidate);
    }
}


// pc1
function call() {
    pc1 = new RTCPeerConnection(configuration);
    pc1.onicecandidate = function (e) {
        console.log("pc1.onicecandidate ")
        socket.emit("tellIceCandidateToPC1",{target:"pc3",data: e.candidate});
    };
    addTrack();
    socket.emit("call",{target:"pc3"});
}

function addTrack() {
    pc1.addStream(localStream)
}

function getReady() {
    console.log("getReady")
    // return;
    pc1.createOffer({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
    }).then(
        function (desc) {
            pc1.setLocalDescription(desc).then(
                function () {
                },
                function (err) {
                    console.error(err);
                }
            );
            socket.emit("askToPC2",{target:"pc3",data: desc});
        },
        function (err) {
            console.error(err);
        }
    );
}

function getAnswer(data) {
    console.log("getAnswer")
    let desc = data.data;
    pc1.setRemoteDescription(desc).then(
            function () {
            },
            function (err) {
                console.error(err);
            }
        );
    console.log("getAnswer")
}

function getCandidateFromPC2(data) {
    console.log("getCandidateFromPC2",pc1);
    let candidate = data.data;
    if (pc1 && candidate) {
        pc1.addIceCandidate(candidate).then(
            function () {
            },
            function (err) {
                console.error(err);
            }
        );
    }
}


