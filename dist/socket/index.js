import { Server } from "socket.io";
export let io;
export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
        },
    });
    io.on("connection", (socket) => {
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
    return io;
}
