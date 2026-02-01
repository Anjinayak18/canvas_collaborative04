const DrawingState = require("./drawing-state");

const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7"];

class Room {
  constructor(id) {
    this.id = id;
    this.users = new Map();
    this.state = new DrawingState();
    this.colorIndex = 0;
  }

  addUser(socket) {
    const user = {
      id: crypto.randomUUID(),
      color: COLORS[this.colorIndex++ % COLORS.length]
    };
    this.users.set(socket, user);
    return user;
  }

  removeUser(socket) {
    this.users.delete(socket);
  }

  getUsers() {
    return [...this.users.values()];
  }
}

const rooms = new Map();

function getRoom(id = "default") {
  if (!rooms.has(id)) rooms.set(id, new Room(id));
  return rooms.get(id);
}

module.exports = { getRoom };
