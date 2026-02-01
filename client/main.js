import { ws } from "./websocket.js";
import { drawStroke, drawCursor } from "./canvas.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

let tool = "brush";
let drawing = false;
let currentStroke = null;

let strokes = [];
let undone = new Set();
let cursors = new Map();
let users = new Map();

const colorInput = document.getElementById("color");
const widthInput = document.getElementById("width");
const usersDiv = document.getElementById("users");

document.getElementById("brush").onclick = () => tool = "brush";
document.getElementById("eraser").onclick = () => tool = "eraser";

canvas.onmousedown = e => {
  drawing = true;
  currentStroke = {
    id: crypto.randomUUID(),
    tool,
    color: colorInput.value,
    width: +widthInput.value,
    points: [[e.clientX, e.clientY]]
  };
};

canvas.onmousemove = e => {
  if (!drawing) return;

  currentStroke.points.push([e.clientX, e.clientY]);
  drawStroke(ctx, currentStroke);

  ws.send(JSON.stringify({ type: "DRAW_PROGRESS", stroke: currentStroke }));
  ws.send(JSON.stringify({ type: "CURSOR", x: e.clientX, y: e.clientY }));
};

canvas.onmouseup = () => {
  drawing = false;
  ws.send(JSON.stringify({ type: "DRAW_END", stroke: currentStroke }));
};

ws.onmessage = msg => {
  const data = JSON.parse(msg.data);

  if (data.type === "INIT") {
    strokes = data.state.strokes;
    undone = new Set(data.state.undone);
    users = new Map(data.users.map(u => [u.id, u]));
    renderUsers();
    redraw();
  }

  if (data.type === "DRAW_PROGRESS") drawStroke(ctx, data.stroke);
  if (data.type === "STROKE_COMMITTED") strokes.push(data.stroke);

  if (data.type === "UNDO_APPLIED") { undone.add(data.id); redraw(); }
  if (data.type === "REDO_APPLIED") { undone.delete(data.id); redraw(); }

  if (data.type === "CURSOR") {
    cursors.set(data.userId, data);
    redraw();
  }

  if (data.type === "USER_JOINED") {
    users.set(data.user.id, data.user);
    renderUsers();
  }

  if (data.type === "USER_LEFT") {
    users.delete(data.userId);
    cursors.delete(data.userId);
    renderUsers();
  }
};

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokes.forEach(s => !undone.has(s.id) && drawStroke(ctx, s));
  cursors.forEach(c => drawCursor(ctx, c));
}

function renderUsers() {
  usersDiv.innerHTML = [...users.values()]
    .map(u => `<div style="color:${u.color}">● ${u.id.slice(0,5)}</div>`)
    .join("");
}

document.getElementById("undo").onclick = () =>
  ws.send(JSON.stringify({ type: "UNDO" }));

document.getElementById("redo").onclick = () =>
  ws.send(JSON.stringify({ type: "REDO" }));
