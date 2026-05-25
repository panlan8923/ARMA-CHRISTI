const canvas = document.getElementById("draw");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.strokeStyle = "white";
ctx.lineWidth = 3;
ctx.lineCap = "round";

let drawing = false;

canvas.addEventListener("mousedown", () => {
  drawing = true;
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
  ctx.beginPath();
});

canvas.addEventListener("mousemove", draw);

function draw(e) {
  if (!drawing) return;

  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY);
}
