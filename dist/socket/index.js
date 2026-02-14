"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
exports.initSocket = initSocket;
const socket_io_1 = require("socket.io");
function initSocket(server) {
    exports.io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
        },
    });
    exports.io.on("connection", (socket) => {
        console.log("✅ socket connected:", socket.id);
        /**
         * ✅ Parent joins parent room
         * Room name: parent:<parentId>
         */
        socket.on("join-parent-room", ({ parentId }) => {
            if (!parentId)
                return;
            socket.join(`parent:${parentId}`);
        });
        socket.on("disconnect", () => {
            console.log("❌ socket disconnected:", socket.id);
        });
    });
    return exports.io;
}
