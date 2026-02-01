const WebSocket = require("ws");
const { getRoom } = require("./rooms");

const PORT = 3000;
const wss = new WebSocket.Server({ port: PORT });

function broadcast(room, data) {
  const msg = JSON.stringify(data);
  room.users.forEach((_, client) => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}

wss.on("connection", socket => {
  const room = getRoom("default");
  const user = room.addUser(socket);

  socket.send(JSON.stringify({
    type: "INIT",
    state: room.state.getState(),
    users: room.getUsers(),
    user
  }));

  broadcast(room, { type: "USER_JOINED", user });

  socket.on("message", msg => {
    const data = JSON.parse(msg);

    if (data.type === "DRAW_PROGRESS")
      broadcast(room, { type: "DRAW_PROGRESS", stroke: data.stroke });

    if (data.type === "DRAW_END") {
      room.state.addStroke(data.stroke);
      broadcast(room, { type: "STROKE_COMMITTED", stroke: data.stroke });
    }

    if (data.type === "UNDO") {
      const id = room.state.undoLast();
      if (id) broadcast(room, { type: "UNDO_APPLIED", id });
    }

    if (data.type === "REDO") {
      const id = room.state.redoLast();
      if (id) broadcast(room, { type: "REDO_APPLIED", id });
    }

    if (data.type === "CURSOR")
      broadcast(room, { type: "CURSOR", userId: user.id, ...data });
  });

  socket.on("close", () => {
    room.removeUser(socket);
    broadcast(room, { type: "USER_LEFT", userId: user.id });
  });
});

console.log(`Server running on ws://localhost:${PORT}`);
