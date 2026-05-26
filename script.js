import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZVhboBByfpVQnZFLZYBqFjyVVjvvd08M",
  authDomain: "arma-christi-wall.firebaseapp.com",
  projectId: "arma-christi-wall",
  storageBucket: "arma-christi-wall.firebasestorage.app",
  messagingSenderId: "191623333645",
  appId: "1:191623333645:web:f0add4a441b5d31fb59244",
  measurementId: "G-5GBRR963ER",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const canvas = document.getElementById("draw");
const drawSection = document.getElementById("drawSection");
const ctx = canvas.getContext("2d");
const submitBtn = document.getElementById("submitBtn");
const navGalleryBtn = document.getElementById("navGallery");

let drawing = false;
let lastX = 0;
let lastY = 0;
let hasUnsavedChanges = false;
let isSubmitting = false;

function resizeCanvas() {
  const width = drawSection.clientWidth;
  const height = drawSection.clientHeight;

  canvas.width = width;
  canvas.height = height;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // If the canvas is resized, its content is cleared, so consider it "saved/empty".
  hasUnsavedChanges = false;
}

resizeCanvas();

function getPosition(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX =
    e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
  const clientY =
    e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function startDrawing(e) {
  e.preventDefault();

  const pos = getPosition(e);

  drawing = true;
  lastX = pos.x;
  lastY = pos.y;
  hasUnsavedChanges = true;
}

function stopDrawing(e) {
  if (e) e.preventDefault();
  drawing = false;
}

function draw(e) {
  if (!drawing) return;

  e.preventDefault();

  const pos = getPosition(e);

  const jitter = 10;
  const offsetX = (Math.random() - 0.5) * jitter;
  const offsetY = (Math.random() - 0.5) * jitter;

  ctx.strokeStyle = "white";
  ctx.lineWidth = 12 + Math.random() * 14;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

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

async function submitTrace() {
  isSubmitting = true;
  submitBtn.disabled = true;
  submitBtn.textContent = "submitting...";

  try {
    const imageData = canvas.toDataURL("image/jpeg", 0.7);

    await addDoc(collection(db, "artworks"), {
      imageData: imageData,
      createdAt: serverTimestamp(),
      width: canvas.width,
      height: canvas.height,
      userAgent: navigator.userAgent,
    });

    submitBtn.textContent = "submitted";
    hasUnsavedChanges = false;

    setTimeout(() => {
      submitBtn.textContent = "submit trace";
      submitBtn.disabled = false;
    }, 1500);
  } catch (error) {
    console.error("Submit failed:", error);
    submitBtn.textContent = "failed";

    setTimeout(() => {
      submitBtn.textContent = "submit trace";
      submitBtn.disabled = false;
    }, 1500);
  } finally {
    isSubmitting = false;
  }
}

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

canvas.addEventListener("touchstart", startDrawing, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", stopDrawing, { passive: false });
canvas.addEventListener("touchcancel", stopDrawing, { passive: false });

submitBtn.addEventListener("click", submitTrace);

window.addEventListener("resize", resizeCanvas);

if (navGalleryBtn) {
  navGalleryBtn.addEventListener("click", (e) => {
    if (!hasUnsavedChanges) return;

    e.preventDefault();
    const message = isSubmitting
      ? "Submission is in progress. Are you sure you want to leave for the Gallery?"
      : "You have an unsaved drawing. Are you sure you want to leave for the Gallery?";

    const ok = window.confirm(
      message
    );
    if (ok) window.location.href = navGalleryBtn.href;
  });
}
