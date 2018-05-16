/**
 * Created by lin on 2017/9/27.
 */
let socketIO = require("socket.io");
let map = {

}
let socketService = function (server) {
    let io = socketIO.listen(server);
    io.on("connection", function (socket) {
        let userId = socket.handshake.query.userId;
        map[userId] = socket;
        socket.on("call",function (data) {
            let targetSocket = map[data.target];
            targetSocket.emit("getCall" , {from:userId})
        });
        socket.on("readyToPC1",function (data) {
            let targetSocket = map[data.target];
            targetSocket.emit("getReady" , {from:userId})
        });
        socket.on("askToPC2",function (data) {
            let targetSocket = map[data.target];
            targetSocket.emit("getAsk" , {
                from:userId,
                data:data.data
            });
        });
        socket.on("answerToPC1",function (data) {
            let targetSocket = map[data.target];
            targetSocket.emit("getAnswer" , {
                from:userId,
                data:data.data
            });
        });
        socket.on("tellIceCandidateToPC1",function (data) {
            let targetSocket = map[data.target];
            targetSocket.emit("getCandidateFromPC2" , {
                from:userId,
                data:data.data
            });
        });
        socket.on("tellIceCandidateToPC2",function (data) {
            let targetSocket = map[data.target];
            targetSocket.emit("getCandidateFromPC1" , {
                from:userId,
                data:data.data
            })
        });
    });
};
module.exports = socketService;
