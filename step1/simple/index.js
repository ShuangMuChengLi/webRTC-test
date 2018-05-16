var startButton = document.getElementById('startButton');
var callButton = document.getElementById('callButton');
var addTrackButton = document.getElementById('addTrackButton');
var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');
var info = document.getElementById('info');
var pc1;
var i = 0;
var configuration = {
    "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
};
startButton.onclick = start;
callButton.onclick = callBtnAction;


function start() {
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    })
        .then(function gotStream(stream) {
            localVideo.srcObject = stream;
            localStream = stream;
        })
        .catch(function(e) {
            alert('getUserMedia() error: ' + e.name);
        });
}
function callBtnAction() {
    i++;
    info.innerText = i;
    var pc2;
    call();

    // pc1
    function call() {
        pc1 = new RTCPeerConnection(configuration);
        pc1.onicecandidate = function(e) {
            console.log("pc1.onicecandidate ")
            tellIceCandidateToPC2(e.candidate);
        };
        addTrack();
        callToPC2();
    }
    function addTrack(){
        localStream.getTracks().forEach(
            function(track) {
                pc1.addTrack(
                    track,
                    localStream
                );
            }
        );
    }
    function getReady() {
        // return;
        pc1.createOffer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        }).then(
            function (desc) {
                pc1.setLocalDescription(desc);
                askToPC2(desc);
            },
            function (err) {
                console.error(err);
            }
        );
    }
    function getAnswer(desc) {
        pc1.setRemoteDescription(desc);
        console.log("getAnswer")
    }
    function getCandidateFromPC2(candidate) {
        if(candidate){
            pc1.addIceCandidate(candidate);
        }
    }




// server
    function callToPC2() {
        getCall();
    }
    function readyToPC1() {
        getReady();
    }
    function askToPC2(desc) {
        getAsk(desc);
    }
    function answerToPC1(desc) {
        getAnswer(desc);
    }
    function tellIceCandidateToPC1(candidate) {
        getCandidateFromPC2(candidate);
    }
    function tellIceCandidateToPC2(candidate) {
        getCandidateFromPC1(candidate);
    }




// pc2
    function getCall() {
        pc2 = new RTCPeerConnection(configuration);
        pc2.onicecandidate = function(e) {
            console.log("pc2.onicecandidate ")
            tellIceCandidateToPC1(e.candidate);
        };
        pc2.ontrack = function gotRemoteStream(e) {
            console.log("pc2.ontrack" , e.streams[0])
            if (remoteVideo.srcObject !== e.streams[0]) {
                remoteVideo.srcObject = e.streams[0];
            }
        };
        readyToPC1();
    }

    function getAsk(desc) {
        pc2.setRemoteDescription(desc);
        pc2.createAnswer().then(
            function onCreateAnswerSuccess(desc) {
                pc2.setLocalDescription(desc);
                answerToPC1(desc);
            },
            function (err) {
                console.error(err);
            }
        );
        console.log("getAsk")
    }
    function getCandidateFromPC1(candidate) {
        if(candidate){
            pc2.addIceCandidate(candidate);
        }
    }

}

