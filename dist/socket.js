// import { Server as HttpServer } from "http";
// import { Server, Socket } from "socket.io";
export {};
// export function initSocket(server: HttpServer) {
//     const io = new Server(server, {
//         cors: {
//             origin: "*",
//         },
//     });
//     io.on("connection", (socket: Socket) => {
//         console.log("✅ socket connected:", socket.id);
//         /**
//          * ✅ Parent joins parent room
//          * Room name: parent:<parentId>
//          */
//         socket.on("join-parent-room", ({ parentId }: { parentId: string }) => {
//             if (!parentId) return;
//             socket.join(`parent:${parentId}`);
//         });
//         socket.on("disconnect", () => {
//             console.log("❌ socket disconnected:", socket.id);
//         });
//     });
//     return io;
// }
