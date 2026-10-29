import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ==========================================================================
   1. ROMANTIC MESSAGES QUEUE (Non-repeating Shuffle System)
   ========================================================================== */
const romanticMessages = [
  "I Love You ❤️", "Forever Yours 💕", "My Everything 💖", "Always & Forever 🌹",
  "My Whole World ✨", "You & Me 💓", "My Sweetheart 💘", "My True Love 💫",
  "Only You 🌸", "Endless Love 🤝", "My Soulmate 💍", "My Sunshine ☀️",
  "Stay With Me 🌙", "You're My Magic 🪄", "Simply Yours 🥰", "Crazy For You 💌",
  "You Complete Me 🧩", "Heart To Heart 💓", "My Happiness 🌈", "Love Of My Life 💎",
  "Dream Come True 🌟", "Holding You Close 🫂", "My Sweet Angel 🕊️", "You Light My Soul 🕯️",
  "One In A Million 💎", "Forever In Love 🌷", "With You Always 🌺", "My Safe Place 🏡",
  "My Favorite 🎀", "Falling For You 🍂", "Together Forever 💍", "My Heartbeat 💓",
  "You Are Special ✨", "Just You & I 🌸", "All My Love 💖", "My One & Only 👑",
  "Soul Connection 💫", "Warm Hugs 🤗", "Pure Love 🤍", "Sweetest Kiss 💋",
  "You're Perfection 💎", "Infinite Love ♾️", "Love You More 🌹", "Made For Each Other 🏹",
  "My Destiny 🔮", "So In Love 🥰", "Forever Bound 🕊️", "My Bright Star ⭐",
  "You're My Home 🏠", "Cherish You 💐", "My Treasure 🪙", "Unconditional Love 🤍",
  "You Make Me Smile 😊", "Sweetest Dream 💭", "Always By Your Side 🤝", "My Little World 🌍",
  "Spark Of My Life ⚡", "Forever Mine 🔐", "Deep In Love 🌊", "My Angel 🕊️",
  "Yours Truly 💌", "Every Beat Is Yours 🥁", "My Universe 🌌", "Endlessly In Love 💘",
  "Light Of My Life 💡", "Loving You Forever 🌻", "My Dearest 🌸", "My Forever Valentine 💝",
  "Pure Magic ✨", "Heartfelt Love ❤️", "My Beautiful Love 🌹", "Forever & Always ✨",
  "Thinking Of You 💭", "My Lucky Charm 🍀", "You Are My Gift 🎁"
];

let messageQueue = [];
function getNextUniqueMessage() {
  if (messageQueue.length === 0) {
    messageQueue = [...romanticMessages];
    for (let i = messageQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [messageQueue[i], messageQueue[j]] = [messageQueue[j], messageQueue[i]];
    }
  }
  return messageQueue.pop();
}

/* ==========================================================================
   2. AUDIO SYNTHESIZER (Crisp Balloon Pop & Harmonic Chime)
   ========================================================================== */
let audioCtx = null;
function playBalloonPopSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;

    // Pop body
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.25);

    // Sparkle chime
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(950, now + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(1900, now + 0.2);
    gain2.gain.setValueAtTime(0.25, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.02);
    osc2.stop(now + 0.3);
  } catch (e) {}
}

/* ==========================================================================
   3. THREE.JS SCENE, CAMERA & RENDERER SETUP
   ========================================================================== */
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 23);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 2;
controls.maxDistance = 60;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.35;

/* ==========================================================================
   4. PROCEDURAL CANVASES & TEXTURES
   ========================================================================== */
// Hard-shaped Glowing Heart Texture (256x256)
function createHardGlowingHeartTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const cx = 128, cy = 138, scale = 5.6;

  function traceHeart(s) {
    ctx.beginPath();
    for (let i = 0; i <= 240; i++) {
      const t = (i / 240) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      const px = cx + x * s;
      const py = cy - y * s;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  // Outer Neon Glow
  ctx.save();
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 28;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  traceHeart(scale * 0.97);
  ctx.fill();
  ctx.restore();

  // Medium Glow
  ctx.save();
  ctx.shadowColor = 'rgba(255, 255, 255, 1.0)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  traceHeart(scale * 0.98);
  ctx.fill();
  ctx.restore();

  // Solid Crisp Core
  ctx.save();
  ctx.fillStyle = '#ffffff';
  traceHeart(scale);
  ctx.fill();
  ctx.restore();

  // Border Stroke
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.2;
  traceHeart(scale);
  ctx.stroke();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  return texture;
}

// Shockwave Ring Texture
function createShockwaveTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.arc(64, 64, 52, 0, Math.PI * 2);
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#ffffff';
  ctx.shadowColor = 'rgba(100, 220, 255, 1.0)';
  ctx.shadowBlur = 16;
  ctx.stroke();
  return new THREE.CanvasTexture(canvas);
}

// Burst Sparkle Texture
function createBurstSparkTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.25, 'rgba(230, 245, 255, 0.95)');
  grad.addColorStop(0.55, 'rgba(100, 200, 255, 0.75)');
  grad.addColorStop(0.85, 'rgba(160, 120, 255, 0.35)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

const hardGlowHeartTexture = createHardGlowingHeartTexture();
const shockwaveTexture = createShockwaveTexture();
const burstSparkTexture = createBurstSparkTexture();

/* ==========================================================================
   5. GLOWING HEARTS GALAXY PARTICLE SYSTEM (3,000 Hearts)
   ========================================================================== */
const TOTAL_HEARTS = 3000;
const heartGeom = new THREE.BufferGeometry();
const positions = new Float32Array(TOTAL_HEARTS * 3);
const colors = new Float32Array(TOTAL_HEARTS * 3);
const aSizes = new Float32Array(TOTAL_HEARTS);
const baseSizes = new Float32Array(TOTAL_HEARTS);
const hoverScales = new Float32Array(TOTAL_HEARTS);
const phases = new Float32Array(TOTAL_HEARTS);
const speeds = new Float32Array(TOTAL_HEARTS);
const poppedState = new Uint8Array(TOTAL_HEARTS);

const palette = [
  new THREE.Color(0.12, 0.85, 1.0),  // Vivid Electric Cyan
  new THREE.Color(0.25, 0.65, 1.0),  // Neon Sky Blue
  new THREE.Color(0.08, 0.50, 1.0),  // Deep Royal Sapphire
  new THREE.Color(0.40, 0.95, 1.0),  // Bright Aqua Ice
  new THREE.Color(0.95, 0.98, 1.0),  // Diamond White-Hot Ice
  new THREE.Color(0.70, 0.45, 1.0),  // Electric Violet / Lavender
  new THREE.Color(0.55, 0.70, 1.0),  // Periwinkle Ice Blue
  new THREE.Color(0.15, 0.92, 0.85), // Turquoise Neon
  new THREE.Color(1.0, 0.35, 0.80),  // Neon Pink/Magenta accent
  new THREE.Color(0.85, 0.60, 1.0)   // Soft Lavender
];

for (let i = 0; i < TOTAL_HEARTS; i++) {
  let px, py, pz;

  if (i < TOTAL_HEARTS * 0.65) {
    const progress = i / (TOTAL_HEARTS * 0.65);
    const t = progress * Math.PI * 5 - Math.PI * 2.5;
    const radius = 11.5 + Math.sin(t * 0.8) * 4.2;
    const streamX = Math.cos(t * 0.8) * radius;
    const streamY = Math.sin(t * 0.6) * 7.5 + (progress - 0.5) * 6.0;
    const streamZ = Math.sin(t * 0.8) * (radius * 0.9);

    const scatter = Math.pow(Math.random(), 1.3) * 5.5;
    const scatterAngle = Math.random() * Math.PI * 2;
    const elevation = (Math.random() - 0.5) * Math.PI * 0.85;

    px = streamX + Math.cos(scatterAngle) * Math.cos(elevation) * scatter;
    py = streamY + Math.sin(elevation) * scatter;
    pz = streamZ + Math.sin(scatterAngle) * Math.cos(elevation) * scatter;
  } else {
    const r = 5.0 + Math.pow(Math.random(), 0.65) * 30.0;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    px = r * Math.sin(phi) * Math.cos(theta);
    py = r * Math.cos(phi);
    pz = r * Math.sin(phi) * Math.sin(theta);
  }

  positions[i * 3] = px;
  positions[i * 3 + 1] = py;
  positions[i * 3 + 2] = pz;

  const col = palette[Math.floor(Math.random() * palette.length)].clone();
  colors[i * 3] = col.r;
  colors[i * 3 + 1] = col.g;
  colors[i * 3 + 2] = col.b;

  let size;
  const rand = Math.random();
  if (rand > 0.91) size = 1.9 + Math.random() * 0.6;
  else if (rand > 0.58) size = 1.1 + Math.random() * 0.45;
  else size = 0.55 + Math.random() * 0.35;

  aSizes[i] = size;
  baseSizes[i] = size;
  hoverScales[i] = 1.0;
  phases[i] = Math.random() * Math.PI * 2;
  speeds[i] = 1.2 + Math.random() * 1.6;
  poppedState[i] = 0;
}

heartGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
heartGeom.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
heartGeom.setAttribute('aSize', new THREE.BufferAttribute(aSizes, 1));

const heartShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTexture: { value: hardGlowHeartTexture },
    uTime: { value: 0.0 }
  },
  vertexShader: `
    attribute float aSize;
    attribute vec3 aColor;
    varying vec3 vColor;
    varying float vSize;

    void main() {
      vSize = aSize;
      if (aSize <= 0.001) {
        gl_Position = vec4(99999.0, 99999.0, 99999.0, 1.0);
        gl_PointSize = 0.0;
        return;
      }
      vColor = aColor;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float dist = max(1.0, -mvPosition.z);
      gl_PointSize = clamp(aSize * (230.0 / dist), 0.0, 120.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    varying vec3 vColor;
    varying float vSize;

    void main() {
      if (vSize <= 0.001) discard;
      vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
      vec4 texColor = texture2D(uTexture, uv);
      if (texColor.a < 0.04) discard;

      vec3 core = vec3(1.0) * texColor.r * 0.92;
      vec3 neonGlow = vColor * texColor.rgb * 1.35;
      vec3 finalColor = mix(neonGlow, core, texColor.r * 0.7);
      gl_FragColor = vec4(finalColor, texColor.a * 0.99);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const heartPointsMesh = new THREE.Points(heartGeom, heartShaderMaterial);
scene.add(heartPointsMesh);

/* ==========================================================================
   6. SHOCKWAVE POOL & EXPLOSIVE BURST SPARKS
   ========================================================================== */
// Shockwaves
const MAX_SHOCKWAVES = 15;
const shockwavePool = [];
const shockwaveGeom = new THREE.PlaneGeometry(1, 1);
for (let i = 0; i < MAX_SHOCKWAVES; i++) {
  const mat = new THREE.MeshBasicMaterial({
    map: shockwaveTexture,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(shockwaveGeom, mat);
  mesh.visible = false;
  scene.add(mesh);
  shockwavePool.push({ mesh, mat, active: false, progress: 0, maxRadius: 4.8 });
}
let shockwaveIndex = 0;

function triggerShockwave(pos, color) {
  const sw = shockwavePool[shockwaveIndex];
  shockwaveIndex = (shockwaveIndex + 1) % MAX_SHOCKWAVES;
  sw.mesh.position.copy(pos);
  sw.mesh.quaternion.copy(camera.quaternion);
  sw.mesh.scale.set(0.1, 0.1, 0.1);
  sw.mat.color.copy(color || new THREE.Color(1, 1, 1));
  sw.mat.opacity = 1.0;
  sw.mesh.visible = true;
  sw.active = true;
  sw.progress = 0;
}

// Burst Sparks
const MAX_BURST_SPARKS = 500;
const burstGeom = new THREE.BufferGeometry();
const burstPos = new Float32Array(MAX_BURST_SPARKS * 3);
const burstColors = new Float32Array(MAX_BURST_SPARKS * 3);
const burstSizes = new Float32Array(MAX_BURST_SPARKS);
const burstData = [];
let burstPoolIndex = 0;

for (let i = 0; i < MAX_BURST_SPARKS; i++) {
  burstPos[i * 3] = 99999;
  burstPos[i * 3 + 1] = 99999;
  burstPos[i * 3 + 2] = 99999;
  burstData.push({ vx: 0, vy: 0, vz: 0, baseSize: 1.0, life: 0, maxLife: 40, active: false });
  burstColors[i * 3] = 1;
  burstColors[i * 3 + 1] = 1;
  burstColors[i * 3 + 2] = 1;
  burstSizes[i] = 0.0;
}

burstGeom.setAttribute('position', new THREE.BufferAttribute(burstPos, 3));
burstGeom.setAttribute('aColor', new THREE.BufferAttribute(burstColors, 3));
burstGeom.setAttribute('aSize', new THREE.BufferAttribute(burstSizes, 1));

const burstShaderMaterial = new THREE.ShaderMaterial({
  uniforms: { uTexture: { value: burstSparkTexture } },
  vertexShader: `
    attribute float aSize;
    attribute vec3 aColor;
    varying vec3 vColor;
    varying float vSize;

    void main() {
      vSize = aSize;
      if (aSize <= 0.001) {
        gl_Position = vec4(99999.0, 99999.0, 99999.0, 1.0);
        gl_PointSize = 0.0;
        return;
      }
      vColor = aColor;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float dist = max(1.0, -mvPosition.z);
      gl_PointSize = clamp(aSize * (230.0 / dist), 0.0, 75.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    varying vec3 vColor;
    varying float vSize;

    void main() {
      if (vSize <= 0.001) discard;
      vec4 texColor = texture2D(uTexture, gl_PointCoord);
      if (texColor.a < 0.05) discard;
      gl_FragColor = vec4(vColor * texColor.rgb * 1.35, texColor.a);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const burstSparkPoints = new THREE.Points(burstGeom, burstShaderMaterial);
scene.add(burstSparkPoints);

function triggerBalloonBurstPhysics(pos, color) {
  triggerShockwave(pos, color);

  const posArr = burstGeom.attributes.position.array;
  const colArr = burstGeom.attributes.aColor.array;
  const sizeArr = burstGeom.attributes.aSize.array;

  const countToSpawn = 45;
  for (let c = 0; c < countToSpawn; c++) {
    const idx = (burstPoolIndex + c) % MAX_BURST_SPARKS;
    posArr[idx * 3] = pos.x;
    posArr[idx * 3 + 1] = pos.y;
    posArr[idx * 3 + 2] = pos.z;

    const speed = 0.18 + Math.random() * 0.45;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    burstData[idx].vx = speed * Math.sin(phi) * Math.cos(theta);
    burstData[idx].vy = speed * Math.cos(phi) + 0.14;
    burstData[idx].vz = speed * Math.sin(phi) * Math.sin(theta);
    burstData[idx].life = 0;
    burstData[idx].maxLife = 32 + Math.floor(Math.random() * 22);
    burstData[idx].baseSize = 0.9 + Math.random() * 0.7;
    burstData[idx].active = true;

    colArr[idx * 3] = color ? color.r : 0.5;
    colArr[idx * 3 + 1] = color ? color.g : 0.85;
    colArr[idx * 3 + 2] = color ? color.b : 1.0;
    sizeArr[idx] = burstData[idx].baseSize;
  }

  burstPoolIndex = (burstPoolIndex + countToSpawn) % MAX_BURST_SPARKS;
  burstGeom.attributes.position.needsUpdate = true;
  burstGeom.attributes.aColor.needsUpdate = true;
  burstGeom.attributes.aSize.needsUpdate = true;
}

/* ==========================================================================
   7. IN-PLACE FLOATING ROMANTIC TEXT
   ========================================================================== */
function showFloatingWhiteText(x, y) {
  const textContainer = document.getElementById('floating-text-container');
  if (!textContainer) return;

  const text = getNextUniqueMessage();
  const el = document.createElement('div');
  el.className = 'floating-love-text';
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  textContainer.appendChild(el);

  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 3300);
}

function permanentlyVanishHeart(idx) {
  if (poppedState[idx] === 1) return;
  poppedState[idx] = 1;
  aSizes[idx] = 0.0;
  baseSizes[idx] = 0.0;
  hoverScales[idx] = 0.0;
  heartGeom.attributes.aSize.array[idx] = 0.0;

  positions[idx * 3] = 999999.0;
  positions[idx * 3 + 1] = 999999.0;
  positions[idx * 3 + 2] = 999999.0;
}

/* ==========================================================================
   8. RAYCASTING, HOVER & TAP POP INTERACTION
   ========================================================================== */
let hoveredHeartIndex = -1;
let pointerDownPos = { x: 0, y: 0 };
let pointerDownTime = 0;

function findHeartAtScreenPos(clientX, clientY, maxDistance = 46) {
  let closestIdx = -1;
  let minDist = maxDistance;
  const tempPos = new THREE.Vector3();

  for (let i = 0; i < TOTAL_HEARTS; i++) {
    if (poppedState[i] === 1) continue;
    tempPos.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
    tempPos.project(camera);

    if (tempPos.z > 0 && tempPos.z < 1) {
      const sx = (tempPos.x * 0.5 + 0.5) * window.innerWidth;
      const sy = (-tempPos.y * 0.5 + 0.5) * window.innerHeight;
      const dist = Math.hypot(sx - clientX, sy - clientY);

      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    }
  }
  return closestIdx;
}

function handleMouseMove(e) {
  hoveredHeartIndex = findHeartAtScreenPos(e.clientX, e.clientY, 46);
  document.body.style.cursor = hoveredHeartIndex !== -1 ? 'pointer' : 'default';
}

function handlePointerDown(e) {
  const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
  const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
  pointerDownPos = { x: clientX, y: clientY };
  pointerDownTime = Date.now();
}

function handlePointerUp(e) {
  const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0;
  const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || 0;

  const distance = Math.hypot(clientX - pointerDownPos.x, clientY - pointerDownPos.y);
  const duration = Date.now() - pointerDownTime;

  if (distance > 14 || duration > 450) return;

  const targetIdx = findHeartAtScreenPos(clientX, clientY, 52);

  if (targetIdx !== -1 && poppedState[targetIdx] === 0) {
    const hitPos = new THREE.Vector3(positions[targetIdx * 3], positions[targetIdx * 3 + 1], positions[targetIdx * 3 + 2]);
    const hitColor = new THREE.Color(colors[targetIdx * 3], colors[targetIdx * 3 + 1], colors[targetIdx * 3 + 2]);

    playBalloonPopSound();
    triggerBalloonBurstPhysics(hitPos, hitColor);
    permanentlyVanishHeart(targetIdx);

    hoveredHeartIndex = -1;
    document.body.style.cursor = 'default';

    heartGeom.attributes.aSize.needsUpdate = true;
    heartGeom.attributes.position.needsUpdate = true;

    showFloatingWhiteText(clientX, clientY);
  }
}

window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('mousedown', handlePointerDown);
window.addEventListener('mouseup', handlePointerUp);
window.addEventListener('touchstart', handlePointerDown, { passive: true });
window.addEventListener('touchend', handlePointerUp, { passive: true });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

controls.addEventListener('start', () => { controls.autoRotate = false; });
let idleTimer;
function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { controls.autoRotate = true; }, 3500);
}
window.addEventListener('mousemove', resetIdleTimer);
window.addEventListener('touchmove', resetIdleTimer);

/* ==========================================================================
   9. 60FPS ANIMATION LOOP
   ========================================================================== */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();
  heartShaderMaterial.uniforms.uTime.value = time;

  // Update Hearts: Hover Bulge & Breathing Glow
  const sizeAttr = heartGeom.attributes.aSize;
  for (let i = 0; i < TOTAL_HEARTS; i++) {
    if (poppedState[i] === 1) {
      sizeAttr.array[i] = 0.0;
    } else {
      const targetHover = (i === hoveredHeartIndex) ? 1.55 : 1.0;
      hoverScales[i] += (targetHover - hoverScales[i]) * 0.18;
      const pulse = Math.sin(time * speeds[i] + phases[i]);
      const base = baseSizes[i] * (1.0 + pulse * 0.14);
      sizeAttr.array[i] = base * hoverScales[i];
    }
  }
  sizeAttr.needsUpdate = true;

  // Update Expanding Shockwaves
  for (let i = 0; i < MAX_SHOCKWAVES; i++) {
    const sw = shockwavePool[i];
    if (sw.active) {
      sw.progress += 0.06;
      if (sw.progress >= 1.0) {
        sw.active = false;
        sw.mesh.visible = false;
        sw.mat.opacity = 0;
      } else {
        const curScale = sw.progress * sw.maxRadius;
        sw.mesh.scale.set(curScale, curScale, curScale);
        sw.mat.opacity = Math.pow(1.0 - sw.progress, 1.6);
      }
    }
  }

  // Update Dynamic Burst Sparks
  const posArr = burstGeom.attributes.position.array;
  const burstSizeArr = burstGeom.attributes.aSize.array;
  let hasActiveSparks = false;

  for (let i = 0; i < MAX_BURST_SPARKS; i++) {
    const s = burstData[i];
    if (s.active) {
      s.life++;
      if (s.life >= s.maxLife) {
        s.active = false;
        burstSizeArr[i] = 0.0;
        posArr[i * 3] = 99999.0;
        posArr[i * 3 + 1] = 99999.0;
        posArr[i * 3 + 2] = 99999.0;
      } else {
        const progress = s.life / s.maxLife;
        s.vx *= 0.95;
        s.vz *= 0.95;
        s.vy -= 0.012;
        posArr[i * 3] += s.vx;
        posArr[i * 3 + 1] += s.vy;
        posArr[i * 3 + 2] += s.vz;
        burstSizeArr[i] = s.baseSize * Math.pow(1.0 - progress, 1.2);
      }
      hasActiveSparks = true;
    }
  }

  if (hasActiveSparks) {
    burstGeom.attributes.position.needsUpdate = true;
    burstGeom.attributes.aSize.needsUpdate = true;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
