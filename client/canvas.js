export function drawStroke(ctx, stroke) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = stroke.width;
  ctx.strokeStyle = stroke.color;

  ctx.globalCompositeOperation =
    stroke.tool === "eraser" ? "destination-out" : "source-over";

  ctx.beginPath();
  stroke.points.forEach(([x, y], i) =>
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  );
  ctx.stroke();
}

export function drawCursor(ctx, cursor) {
  ctx.fillStyle = cursor.color;
  ctx.beginPath();
  ctx.arc(cursor.x, cursor.y, 4, 0, Math.PI * 2);
  ctx.fill();
}
