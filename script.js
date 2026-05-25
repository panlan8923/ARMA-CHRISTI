const canvas = document.getElementById("draw");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.strokeStyle = "white";
ctx.lineCap = "round";
ctx.lineJoin = "round";

let drawing = false;
let lastX = 0;
let lastY = 0;

function getPosition(e) {
  if (e.touches && e.touches.length > 0) {
    return {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }

  return {
    x: e.clientX,
    y: e.clientY,
  };
}

function startDrawing(e) {
  e.preventDefault();
  drawing = true;

  const pos = getPosition(e);
  lastX = pos.x;
  lastY = pos.y;
}

function stopDrawing(e) {
  e.preventDefault();
  drawing = false;
  ctx.beginPath();
}

function draw(e) {
  if (!drawing) return;
  e.preventDefault();

  const pos = getPosition(e);

  const jitter = 10;
  const offsetX = (Math.random() - 0.5) * jitter;
  const offsetY = (Math.random() - 0.5) * jitter;

  ctx.lineWidth = 8 + Math.random() * 10;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x + offsetX, pos.y + offsetY);
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(
      pos.x + (Math.random() - 0.5) * 24,
      pos.y + (Math.random() - 0.5) * 24,
      Math.random() * 2,
      0,
      Math.PI * 2,
    );

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fill();
  }

  lastX = pos.x;
  lastY = pos.y;
}

// 鼠标
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

// 手机触摸
canvas.addEventListener("touchstart", startDrawing, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", stopDrawing, { passive: false });
canvas.addEventListener("touchcancel", stopDrawing, { passive: false });

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
