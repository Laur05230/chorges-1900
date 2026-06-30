const params = new URLSearchParams(window.location.search);
const photoNumber = params.get("photo") || "1";

const camera = document.getElementById("camera");
const overlay = document.getElementById("overlay");
const opacitySlider = document.getElementById("opacity");
const resetBtn = document.getElementById("resetBtn");
const hideBtn = document.getElementById("hideBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const subtitle = document.getElementById("subtitle");

overlay.src = `images/${photoNumber}.png`;
subtitle.textContent = `Vue ${photoNumber}`;

let state = { x: 0, y: 0, scale: 1, rotation: 0, opacity: 0.55 };
let pointers = new Map();
let startState = { ...state };
let startDistance = 0;
let startAngle = 0;
let startCenter = { x: 0, y: 0 };

function applyTransform() {
  overlay.style.opacity = state.opacity;
  overlay.style.transform =
    `translate(calc(-50% + ${state.x}px), calc(-50% + ${state.y}px)) ` +
    `scale(${state.scale}) rotate(${state.rotation}deg)`;
}

function distance(a, b) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}
function angle(a, b) {
  return Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180 / Math.PI;
}
function center(a, b) {
  return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });
    camera.srcObject = stream;
  } catch (error) {
    alert("Impossible d’ouvrir la caméra. Autorisez la caméra dans le navigateur.");
  }
}

overlay.addEventListener("pointerdown", (e) => {
  overlay.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, e);
  startState = { ...state };

  const pts = [...pointers.values()];
  if (pts.length === 1) {
    startCenter = { x: pts[0].clientX, y: pts[0].clientY };
  }
  if (pts.length === 2) {
    startDistance = distance(pts[0], pts[1]);
    startAngle = angle(pts[0], pts[1]);
    startCenter = center(pts[0], pts[1]);
  }
});

overlay.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, e);

  const pts = [...pointers.values()];
  if (pts.length === 1) {
    state.x = startState.x + (pts[0].clientX - startCenter.x);
    state.y = startState.y + (pts[0].clientY - startCenter.y);
  }
  if (pts.length >= 2) {
    const currentDistance = distance(pts[0], pts[1]);
    const currentAngle = angle(pts[0], pts[1]);
    const currentCenter = center(pts[0], pts[1]);

    state.scale = Math.max(0.2, Math.min(5, startState.scale * (currentDistance / startDistance)));
    state.rotation = startState.rotation + (currentAngle - startAngle);
    state.x = startState.x + (currentCenter.x - startCenter.x);
    state.y = startState.y + (currentCenter.y - startCenter.y);
  }
  applyTransform();
});

["pointerup", "pointercancel", "pointerleave"].forEach(eventName => {
  overlay.addEventListener(eventName, (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size === 1) {
      const remaining = [...pointers.values()][0];
      startState = { ...state };
      startCenter = { x: remaining.clientX, y: remaining.clientY };
    }
  });
});

opacitySlider.addEventListener("input", (e) => {
  state.opacity = Number(e.target.value);
  applyTransform();
});

resetBtn.addEventListener("click", () => {
  state = { x: 0, y: 0, scale: 1, rotation: 0, opacity: 0.55 };
  opacitySlider.value = state.opacity;
  overlay.classList.remove("hiddenOverlay");
  hideBtn.textContent = "👁 Masquer";
  applyTransform();
});

hideBtn.addEventListener("click", () => {
  overlay.classList.toggle("hiddenOverlay");
  hideBtn.textContent = overlay.classList.contains("hiddenOverlay") ? "👁 Afficher" : "👁 Masquer";
});

fullscreenBtn.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch (e) {}
});

overlay.addEventListener("error", () => {
  alert(`Image introuvable : images/${photoNumber}.png`);
});

applyTransform();
startCamera();
