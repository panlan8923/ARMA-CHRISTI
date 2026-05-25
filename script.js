// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAZVhboBByfpVQnZFLZYBqFjyVVjvvd08M",
  authDomain: "arma-christi-wall.firebaseapp.com",
  projectId: "arma-christi-wall",
  storageBucket: "arma-christi-wall.firebasestorage.app",
  messagingSenderId: "191623333645",
  appId: "1:191623333645:web:f0add4a441b5d31fb59244",
  measurementId: "G-5GBRR963ER",
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Canvas
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

// 获取位置
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

// 开始画
function startDrawing(e) {
  e.preventDefault();

  drawing = true;

  const pos = getPosition(e);

  lastX = pos.x;
  lastY = pos.y;
}

// 停止画
function stopDrawing(e) {
  e.preventDefault();

  drawing = false;
}

// 画线
async function draw(e) {
  if (!drawing) return;

  e.preventDefault();

  const pos = getPosition(e);

  const data = {
    x1: lastX / canvas.width,
    y1: lastY / canvas.height,
    x2: pos.x / canvas.width,
    y2: pos.y / canvas.height,
  };

  // 上传到 Firebase
  await addDoc(collection(db, "strokes"), data);

  lastX = pos.x;
  lastY = pos.y;
}

// 真正绘制
function renderLine(data) {
  const jitter = 10;

  const offsetX = (Math.random() - 0.5) * jitter;
  const offsetY = (Math.random() - 0.5) * jitter;

  ctx.lineWidth = 12 + Math.random() * 14;

  ctx.beginPath();

  ctx.moveTo(data.x1 * canvas.width, data.y1 * canvas.height);

  ctx.lineTo(
    data.x2 * canvas.width + offsetX,
    data.y2 * canvas.height + offsetY,
  );

  ctx.stroke();

  // 炭笔颗粒
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();

    ctx.arc(
      data.x2 + (Math.random() - 0.5) * 24,
      data.y2 + (Math.random() - 0.5) * 24,
      Math.random() * 2,
      0,
      Math.PI * 2,
    );

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fill();
  }
}

// 实时监听 Firebase
onSnapshot(collection(db, "strokes"), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      renderLine(change.doc.data());
    }
  });
});

// 鼠标
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

// 手机
canvas.addEventListener("touchstart", startDrawing, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", stopDrawing, { passive: false });
canvas.addEventListener("touchcancel", stopDrawing, { passive: false });

// Resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
