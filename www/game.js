import * as THREE from 'three';

const $ = (id) => document.getElementById(id);
const canvas = $('game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ac9eb);
scene.fog = new THREE.Fog(0x9ac9eb, 60, 170);

const camera = new THREE.PerspectiveCamera(54, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 9.5, -17);
camera.lookAt(0, 0, 19);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;

scene.add(new THREE.HemisphereLight(0xdff4ff, 0x364761, 2.15));
const sun = new THREE.DirectionalLight(0xfff0d7, 3.1);
sun.position.set(-16, 29, 15);
scene.add(sun);

const mat = (color, roughness = 0.75, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const roadMat = mat(0x283b53, 0.91);
const edgeMat = mat(0x768da0, 0.64, 0.3);
const blueMat = mat(0x176bea, 0.48, 0.15);
const lightBlueMat = mat(0x63baff, 0.42, 0.12);
const plasmaMat = mat(0x62efff, 0.3, 0.28);
const swordMat = mat(0x75edff, 0.3, 0.28);
const armorMat = mat(0x173b78, 0.5, 0.2);
const gunMat = mat(0x202c3b, 0.5, 0.55);
const redMat = mat(0xcd3442, 0.55, 0.12);
const goldMat = mat(0xffcb61, 0.45, 0.25);
const whiteMat = mat(0xf4f8ff, 0.7);
const darkMat = mat(0x192331, 0.85);
const reusableMatrix = new THREE.Matrix4();
const dummy = new THREE.Object3D();

function box(parent, width, height, depth, material, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  parent.add(mesh);
  return mesh;
}

function addBridge() {
  const tiles = [];
  for (let i = 0; i < 3; i += 1) {
    const tile = new THREE.Group();
    tile.position.z = i * 58;
    box(tile, 13, 0.72, 59, roadMat, [0, -0.43, 29]);
    box(tile, 0.12, 0.025, 58, mat(0xc4d6e0, 0.7), [-4.25, -0.055, 29]);
    box(tile, 0.12, 0.025, 58, mat(0xc4d6e0, 0.7), [4.25, -0.055, 29]);
    for (const side of [-1, 1]) {
      box(tile, 0.36, 1.25, 59, edgeMat, [side * 6.37, 0.15, 29]);
      box(tile, 0.17, 0.22, 59, mat(0x41bfff, 0.38, 0.22), [side * 6.16, 0.79, 29]);
      for (let z = 5; z < 58; z += 13) {
        box(tile, 0.5, 0.46, 0.65, mat(0x8ba3b5, 0.62, 0.2), [side * 6.34, 0.92, z]);
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.56, 9, 8), mat(0x8ea9ba, 0.83));
        pillar.position.set(side * 9.3, -4.7, z);
        tile.add(pillar);
      }
    }
    for (let z = 3; z < 58; z += 5.8) {
      box(tile, 0.18, 0.02, 1.6, mat(0x698198, 0.86), [0, -0.055, z]);
    }
    const farArch = new THREE.Group();
    farArch.position.set(0, 0, 47);
    box(farArch, 0.38, 9, 0.5, edgeMat, [-5.65, 4, 0]);
    box(farArch, 0.38, 9, 0.5, edgeMat, [5.65, 4, 0]);
    box(farArch, 11.7, 0.48, 0.7, edgeMat, [0, 8.25, 0]);
    tile.add(farArch);
    scene.add(tile);
    tiles.push(tile);
  }
  return tiles;
}

const bridgeTiles = addBridge();

function makeSoldiers(maxCount, material, weaponMaterial) {
  const parts = [
    { name: 'body', geometry: new THREE.BoxGeometry(0.35, 0.43, 0.27), offset: [0, 0.69, 0], scale: [1, 1, 1] },
    { name: 'head', geometry: new THREE.SphereGeometry(0.13, 8, 6), offset: [0, 1.0, 0.015], scale: [1, 1, 0.94] },
    { name: 'helmet', geometry: new THREE.SphereGeometry(0.15, 8, 5), offset: [0, 1.08, 0.015], scale: [1.15, 0.72, 1.05] },
    { name: 'leftArm', geometry: new THREE.BoxGeometry(0.12, 0.34, 0.14), offset: [-0.24, 0.69, 0], scale: [1, 1, 1] },
    { name: 'rightArm', geometry: new THREE.BoxGeometry(0.12, 0.34, 0.14), offset: [0.24, 0.69, 0], scale: [1, 1, 1] },
    { name: 'leftLeg', geometry: new THREE.BoxGeometry(0.14, 0.36, 0.17), offset: [-0.105, 0.24, 0], scale: [1, 1, 1] },
    { name: 'rightLeg', geometry: new THREE.BoxGeometry(0.14, 0.36, 0.17), offset: [0.105, 0.24, 0], scale: [1, 1, 1] },
    { name: 'weapon', geometry: new THREE.BoxGeometry(0.09, 0.1, 0.47), offset: [0.16, 0.72, 0.3], scale: [1, 1, 1] }
  ];
  return parts.map((part) => {
    const partMaterial = part.name === 'weapon' ? weaponMaterial : part.name === 'helmet' ? lightBlueMat : material;
    const mesh = new THREE.InstancedMesh(part.geometry, partMaterial, maxCount);
    mesh.count = 0;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.userData.part = part;
    scene.add(mesh);
    return mesh;
  });
}

const blueSoldiers = makeSoldiers(520, blueMat, gunMat);
const enemySoldiers = makeSoldiers(72, redMat, darkMat);

const state = {
  mode: 'lobby',
  x: 0,
  count: 12,
  coins: 0,
  runCoins: 0,
  distance: 0,
  kills: 0,
  waves: 0,
  miniBosses: 0,
  strength: 1,
  boss: null,
  bossHudTimeout: 0,
  objects: [],
  effects: [],
  nextWave: 0,
  lastTime: 0,
  sound: null,
  toastTimeout: 0,
  lastBossHit: 0,
  storage: loadSave()
};

function loadSave() {
  const defaults = { coins: 0, startingArmy: 12, strengthLevel: 0, coinLevel: 0, weapons: ['Assault Rifle'] };
  try {
    const saved = JSON.parse(localStorage.getItem('army-rush-save') || '{}');
    return { ...defaults, ...saved, weapons: Array.isArray(saved.weapons) ? saved.weapons : defaults.weapons };
  } catch (error) {
    console.warn('Could not read the ARMY RUSH save; starting with a fresh profile.', error);
    return defaults;
  }
}

function save() {
  try {
    localStorage.setItem('army-rush-save', JSON.stringify(state.storage));
  } catch (error) {
    console.error('Could not save ARMY RUSH progress.', error);
    toast('SAVE FAILED');
  }
}

function currentWeapon() {
  return state.storage.weapons[state.storage.weapons.length - 1] || 'Assault Rifle';
}

const weaponUnlocks = [
  { name: 'Plasma Rifle', cost: 250 },
  { name: 'Shotgun', cost: 450 },
  { name: 'Gatling', cost: 800 },
  { name: 'Energy Greatsword', cost: 1200 }
];

function nextWeapon() {
  return weaponUnlocks.find((weapon) => !state.storage.weapons.includes(weapon.name)) || null;
}

function upgradeCost(type) {
  if (type === 'army') return 50 + Math.floor((state.storage.startingArmy - 12) / 5) * 55;
  if (type === 'strength') return 75 + state.storage.strengthLevel * 90;
  return 100 + state.storage.coinLevel * 110;
}

function renderLobby() {
  $('bankCoins').textContent = Math.floor(state.storage.coins);
  $('armyUpgrade').textContent = `${state.storage.startingArmy} SOLDIERS`;
  $('armyCost').textContent = `◆ ${upgradeCost('army')}`;
  $('strengthUpgrade').textContent = `${(1 + state.storage.strengthLevel * 0.2).toFixed(1)}× POWER`;
  $('strengthCost').textContent = `◆ ${upgradeCost('strength')}`;
  $('bonusUpgrade').textContent = `${state.storage.coinLevel * 10}% BONUS`;
  $('bonusCost').textContent = `◆ ${upgradeCost('bonus')}`;
  const weapon = nextWeapon();
  $('weaponUpgrade').textContent = weapon ? `UNLOCK ${weapon.name.toUpperCase()}` : `${currentWeapon().toUpperCase()} · MAX`;
  $('weaponCost').textContent = weapon ? `NEXT: ◆ ${weapon.cost}` : `${state.storage.weapons.length} WEAPONS UNLOCKED`;
}

function notify(text, positive = true) {
  toast(text, positive);
}

function toast(text, positive = true) {
  const element = $('toast');
  element.textContent = text;
  element.style.color = positive ? '#ffffff' : '#ff827a';
  element.classList.add('show');
  clearTimeout(state.toastTimeout);
  state.toastTimeout = window.setTimeout(() => element.classList.remove('show'), 950);
}

function buyUpgrade(type) {
  if (type === 'weapon') {
    const weapon = nextWeapon();
    if (!weapon) return notify('ARSENAL MAXED');
    if (state.storage.coins < weapon.cost) return notify('NOT ENOUGH COINS', false);
    state.storage.coins -= weapon.cost;
    state.storage.weapons.push(weapon.name);
    save();
    renderLobby();
    return notify(`${weapon.name.toUpperCase()} UNLOCKED`);
  }
  const cost = upgradeCost(type);
  if (state.storage.coins < cost) return notify('NOT ENOUGH COINS', false);
  state.storage.coins -= cost;
  if (type === 'army') state.storage.startingArmy += 5;
  if (type === 'strength') state.storage.strengthLevel += 1;
  if (type === 'bonus') state.storage.coinLevel += 1;
  save();
  renderLobby();
  notify('UPGRADE ACQUIRED');
}

function makeTextSprite(text, color = '#ffffff') {
  const textCanvas = document.createElement('canvas');
  textCanvas.width = 512;
  textCanvas.height = 160;
  const ctx = textCanvas.getContext('2d');
  ctx.font = '900 84px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#07152a';
  ctx.shadowBlur = 12;
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#07152a';
  ctx.strokeText(text, 256, 83);
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 83);
  const texture = new THREE.CanvasTexture(textCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(5.2, 1.62, 1);
  return sprite;
}

function addPopup(text, x, z, color = '#9bffbe') {
  const sprite = makeTextSprite(text, color);
  sprite.position.set(x, 2.3, z);
  scene.add(sprite);
  state.effects.push({ object: sprite, life: 1.05, maxLife: 1.05, rise: 1.35 });
}

function playTone(kind = 'gate', value = 1) {
  try {
    if (!state.sound) state.sound = new AudioContext();
    if (state.sound.state === 'suspended') void state.sound.resume();
    const context = state.sound;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const base = kind === 'hit' ? 135 : kind === 'boss' ? 92 : 480;
    oscillator.type = kind === 'hit' ? 'sawtooth' : 'sine';
    oscillator.frequency.setValueAtTime(base * Math.min(Math.max(value, 0.6), 2.3), context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(base * 1.65, context.currentTime + 0.11);
    gain.gain.setValueAtTime(0.065, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.24);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.25);
  } catch (error) {
    console.warn('Audio playback is unavailable.', error);
  }
}

function setArmy(value, cause = '') {
  state.count = Math.max(0, Math.floor(value));
  $('armyCount').textContent = state.count.toLocaleString();
  $('armyMeter').style.width = `${Math.max(4, Math.min(100, (state.count / 120) * 100))}%`;
  if (cause) addPopup(cause, state.x, 3, value > 0 ? '#99ffbd' : '#ff8179');
  if (state.count === 0 && state.mode === 'running') endRun();
}

function addCoins(amount) {
  const earned = Math.max(0, Math.round(amount * (1 + state.storage.coinLevel * 0.1)));
  state.runCoins += earned;
  $('runCoins').textContent = state.runCoins;
}

function createGate(label, x, z, good) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  const signMat = mat(good ? 0x137a9f : 0x9e2733, 0.43, 0.22);
  const trimMat = good ? lightBlueMat : mat(0xff756d, 0.45, 0.22);
  for (const side of [-1, 1]) {
    box(group, 0.24, 5.1, 0.3, edgeMat, [side * 2.82, 2.55, 0]);
    box(group, 0.48, 0.22, 0.46, goldMat, [side * 2.82, 5.08, 0]);
  }
  box(group, 5.8, 0.28, 0.35, edgeMat, [0, 4.98, 0]);
  box(group, 5.1, 1.42, 0.37, signMat, [0, 3.91, 0.01]);
  box(group, 5.13, 0.07, 0.42, trimMat, [0, 4.65, 0.02]);
  const sprite = makeTextSprite(label, good ? '#8df4ff' : '#ffd2cd');
  sprite.scale.set(3.55, 1.1, 1);
  sprite.position.set(0, 3.9, 0.25);
  group.add(sprite);
  scene.add(group);
  state.objects.push({ kind: 'gate', group, x, z, label, good, checked: false, pair: true });
}

function spawnGates(z) {
  createGate(['+10', '+20', '+50', '×2', '×3', '×5'][state.waves % 6], -3.05, z, true);
  createGate(['-10', '÷2'][state.waves % 2], 3.05, z, false);
}

function spawnHazard(z, x = (Math.random() * 5 - 2.5)) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  const kind = state.waves % 3;
  if (kind === 0) {
    const pivot = new THREE.Group();
    pivot.position.y = 2.65;
    box(pivot, 3.1, 0.32, 0.42, mat(0xff754f, 0.48, 0.22));
    for (let i = -1; i <= 1; i += 1) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.23, 0.75, 4), darkMat);
      spike.rotation.z = Math.PI;
      spike.position.set(i * 0.85, -0.47, 0);
      pivot.add(spike);
    }
    group.add(pivot);
    group.userData.pivot = pivot;
  } else if (kind === 1) {
    const blade = new THREE.Group();
    blade.position.y = 1.65;
    const rotor = new THREE.Group();
    for (let i = 0; i < 4; i += 1) {
      const angle = i * Math.PI / 2;
      box(rotor, 0.31, 2.25, 0.32, edgeMat, [Math.sin(angle) * 0.75, Math.cos(angle) * 0.75, 0], [0, 0, angle]);
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 4), darkMat);
      spike.position.set(Math.sin(angle) * 1.65, Math.cos(angle) * 1.65, 0);
      spike.rotation.z = -angle;
      rotor.add(spike);
    }
    blade.add(rotor);
    blade.userData.rotor = rotor;
    group.add(blade);
    group.userData.pivot = rotor;
  } else {
    box(group, 5.6, 1.4, 0.6, mat(0xc74e4a, 0.48, 0.16), [0, 0.75, 0]);
    for (let i = -2; i <= 2; i += 1) box(group, 0.13, 1.7, 0.67, goldMat, [i * 1, 0.75, 0]);
  }
  box(group, 0.35, 3.6, 0.4, darkMat, [0, 1.8, -0.43]);
  scene.add(group);
  state.objects.push({ kind: 'hazard', group, x, z, checked: false, damage: 8 + Math.floor(state.count * 0.07) });
}

function createEnemy(z, x = (Math.random() * 5 - 2.5)) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  const count = 14 + Math.floor(Math.random() * 25);
  const members = makeSoldiers(40, redMat, darkMat);
  const label = makeTextSprite(`ENEMY ${count}`, '#ffaaa3');
  label.scale.set(4.5, 1.4, 1);
  label.position.set(0, 4.0, 0);
  group.add(label);
  scene.add(group);
  state.objects.push({ kind: 'enemy', group, x, z, count, members, checked: false, labelCount: count });
  return group;
}

function createBoss(z, titan) {
  const group = new THREE.Group();
  group.position.set(0, 0, z);
  const scale = titan ? 1.9 : 1;
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.5 * scale, 2.0 * scale, 0.9 * scale), redMat);
  torso.position.y = 2.15 * scale;
  group.add(torso);
  const chest = new THREE.Mesh(new THREE.BoxGeometry(1.65 * scale, 0.48 * scale, 1.0 * scale), goldMat);
  chest.position.set(0, 2.35 * scale, 0.08);
  group.add(chest);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.55 * scale, 12, 8), mat(0x923342, 0.5, 0.18));
  head.position.y = 3.65 * scale;
  group.add(head);
  const helmet = new THREE.Mesh(new THREE.ConeGeometry(0.72 * scale, 0.55 * scale, 6), goldMat);
  helmet.position.y = 4.15 * scale;
  group.add(helmet);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.43 * scale, 1.55 * scale, 0.5 * scale), redMat);
    arm.position.set(side * 1.0 * scale, 2.28 * scale, 0);
    arm.rotation.z = side * -0.14;
    group.add(arm);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.52 * scale, 1.3 * scale, 0.58 * scale), darkMat);
    leg.position.set(side * 0.42 * scale, 0.7 * scale, 0);
    group.add(leg);
  }
  const banner = makeTextSprite(titan ? 'TITAN' : 'MINI-BOSS', titan ? '#ffdc7f' : '#ffaaa3');
  banner.scale.set(titan ? 6.8 : 4.7, 1.25, 1);
  banner.position.set(0, 5.45 * scale, 0);
  group.add(banner);
  const hpBack = new THREE.Mesh(new THREE.PlaneGeometry(titan ? 4.6 : 3.4, 0.25), darkMat);
  hpBack.position.set(0, 4.8 * scale, 0.15);
  group.add(hpBack);
  const hpFill = new THREE.Mesh(new THREE.PlaneGeometry(titan ? 4.5 : 3.3, 0.17), mat(0xff534d, 0.4));
  hpFill.position.set(0, 4.8 * scale, 0.25);
  group.add(hpFill);
  scene.add(group);
  const maxHp = (titan ? 10000 : 1700) + state.distance * (titan ? 5 : 1.4);
  const boss = { group, hp: maxHp, maxHp, titan, x: 0, z, checked: false, hpFill };
  state.objects.push({ kind: 'boss', ...boss });
  return boss;
}

function spawnWave() {
  const wave = state.waves % 3;
  if (wave === 0) spawnGates(76);
  if (wave === 1) createEnemy(76);
  if (wave === 2) {
    spawnHazard(76);
    state.miniBosses += 1;
    createBoss(108, state.miniBosses % 3 === 0);
  }
  state.waves += 1;
  state.nextWave = state.distance + 38;
}

function updateSoldiers(meshes, count, centerX, animation, side = 0) {
  const columns = side ? 6 : 10;
  const gap = side ? 0.39 : 0.43;
  const weapon = currentWeapon();
  for (const mesh of meshes) {
    const part = mesh.userData.part;
    const sword = part.name === 'weapon' && weapon === 'Energy Greatsword';
    if (part.name === 'weapon') {
      mesh.material = weapon === 'Plasma Rifle' ? plasmaMat : sword ? swordMat : gunMat;
    }
    for (let i = 0; i < count; i += 1) {
      const row = Math.floor(i / columns);
      const column = i % columns;
      const centerColumn = Math.min(columns, count - row * columns);
      const x = centerX + (column - (centerColumn - 1) / 2) * gap + Math.sin(animation * 2 + row * 0.55) * 0.035;
      const z = side ? 0.15 + row * 0.41 : 2.9 - row * 0.48;
      const gait = Math.sin(animation * 9 + row * 0.75 + column * 0.3);
      const swing = part.name === 'leftLeg' ? gait * 0.52 : part.name === 'rightLeg' ? -gait * 0.52 : part.name === 'leftArm' ? -gait * 0.35 : part.name === 'rightArm' ? gait * 0.35 : 0;
      const bob = part.name === 'body' || part.name === 'head' || part.name === 'helmet' || part.name === 'weapon' ? Math.abs(gait) * 0.035 : 0;
      dummy.position.set(x + part.offset[0], part.offset[1] + bob, z + part.offset[2]);
      dummy.rotation.set(0, 0, swing);
      if (part.name === 'weapon') dummy.rotation.x = -0.05;
      if (part.name === 'weapon') {
        dummy.scale.set(sword ? 1.15 : weapon === 'Gatling' ? 1.55 : weapon === 'Shotgun' ? 1.25 : 1, sword ? 1.5 : 1, sword ? 2 : 1);
      } else {
        dummy.scale.set(...part.scale);
      }
      dummy.updateMatrix();
      reusableMatrix.copy(dummy.matrix);
      mesh.setMatrixAt(i, reusableMatrix);
    }
    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
  }
}

function updateEnemyInstances(entry, time) {
  const localCount = Math.min(entry.count, 40);
  const columns = 6;
  for (const mesh of entry.members) {
    const part = mesh.userData.part;
    for (let i = 0; i < localCount; i += 1) {
      const row = Math.floor(i / columns);
      const column = i % columns;
      const width = Math.min(columns, localCount - row * columns);
      const gait = Math.sin(time * 9 + i * 0.6);
      const swing = part.name === 'leftLeg' || part.name === 'rightArm' ? gait * 0.45 : part.name === 'rightLeg' || part.name === 'leftArm' ? -gait * 0.45 : 0;
      dummy.position.set(entry.x + (column - (width - 1) / 2) * 0.43 + part.offset[0], part.offset[1], entry.z + 0.2 + row * 0.44 + part.offset[2]);
      dummy.rotation.set(0, 0, swing);
      dummy.scale.set(...part.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.count = localCount;
    mesh.instanceMatrix.needsUpdate = true;
  }
  if (entry.labelCount !== entry.count) {
    const sign = entry.group.children[0];
    if (sign?.material?.map) {
      sign.material.map.dispose();
      sign.material.dispose();
    }
    const updated = makeTextSprite(`ENEMY ${entry.count}`, '#ffaaa3');
    updated.scale.set(4.5, 1.4, 1);
    updated.position.set(0, 4, 0);
    entry.group.remove(sign);
    entry.group.add(updated);
    entry.labelCount = entry.count;
  }
}

function addShockwave(x, z) {
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.12, 40), new THREE.MeshBasicMaterial({ color: 0xff794a, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.08, z);
  scene.add(ring);
  state.effects.push({ object: ring, life: 1.3, maxLife: 1.3, shockwave: true });
}

function applyGate(entry) {
  const leftGate = entry.x < 0;
  const label = entry.label;
  if (label.startsWith('+')) {
    const amount = Number(label.slice(1));
    setArmy(state.count + amount, `+${amount}`);
    addCoins(Math.max(2, Math.floor(amount / 5)));
  } else if (label.startsWith('-')) {
    const amount = Number(label.slice(1));
    setArmy(state.count - amount, `-${amount}`);
    playTone('hit', 0.8);
  } else if (label.startsWith('×')) {
    const factor = Number(label.slice(1));
    const previous = state.count;
    setArmy(state.count * factor, `×${factor}`);
    addCoins(Math.max(4, Math.floor(previous * factor / 10)));
    playTone('gate', factor / 2);
  } else if (label === '÷2') {
    setArmy(Math.ceil(state.count / 2), '÷2');
    playTone('hit', 0.8);
  }
  if (leftGate && !label.startsWith('-') && !label.startsWith('÷')) addCoins(8);
  playTone('gate', label.startsWith('×') ? Number(label.slice(1)) / 2 : 1);
  entry.checked = true;
  disposeObject(entry);
}

function damageArmy(amount, message = '') {
  if (state.mode !== 'running') return;
  setArmy(state.count - amount, message || `-${amount}`);
  playTone('hit');
}

function collideEnemy(entry) {
  entry.checked = true;
  const strength = state.count * state.strength;
  if (strength >= entry.count * 0.74) {
    const losses = Math.max(1, Math.ceil(entry.count / (4 + state.strength * 2)));
    damageArmy(losses, `-${losses}`);
    state.kills += entry.count;
    addCoins(18 + Math.floor(entry.count / 2));
    addPopup('SQUAD ELIMINATED', entry.x, 4, '#aaffd0');
    playTone('gate', 1.3);
    disposeObject(entry);
  } else {
    const losses = Math.min(state.count, Math.ceil(entry.count / (1.7 + state.strength)));
    damageArmy(losses, `-${losses}`);
    entry.count = 0;
    disposeObject(entry);
  }
}

function engageBoss(entry, now) {
  if (!state.boss || state.boss.group !== entry.group) state.boss = entry;
  entry.group.position.z = Math.max(10, entry.group.position.z);
  $('bossHud').hidden = false;
  $('bossName').textContent = entry.titan ? 'TITAN MEGA-BOSS' : 'MINI-BOSS';
  const fraction = Math.max(0, entry.hp / entry.maxHp);
  $('bossMeter').style.width = `${fraction * 100}%`;
  $('bossPercent').textContent = `${Math.ceil(fraction * 100)}%`;
  if (now - state.lastBossHit > (entry.titan ? 1000 : 760)) {
    state.lastBossHit = now;
    entry.hp -= state.count * state.strength * (entry.titan ? 2.4 : 3.8);
    playTone('boss', entry.titan ? 0.8 : 1);
    if (entry.hp <= 0) {
      state.kills += entry.titan ? 250 : 70;
      addCoins(entry.titan ? 450 : 120);
      addPopup(entry.titan ? 'TITAN DOWN!' : 'BOSS DEFEATED!', 0, 10, '#ffe08a');
      disposeObject(entry);
      state.boss = null;
      $('bossHud').hidden = true;
      state.lastBossHit = 0;
      return;
    }
    if (entry.titan) addShockwave(0, 4);
  }
  if (state.boss === entry && entry.hp < entry.maxHp * 0.76 && Math.random() < 0.008) {
    damageArmy(Math.ceil(3 + entry.count * 0.025), 'GROUND SLAM');
  }
}

function disposeObject(entry) {
  scene.remove(entry.group);
  entry.group.traverse((child) => {
    child.geometry?.dispose();
    if (child.isSprite) {
      child.material.map?.dispose();
      child.material.dispose();
    }
  });
  if (entry.members) {
    entry.members.forEach((mesh) => {
      scene.remove(mesh);
      mesh.count = 0;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.geometry.dispose();
    });
  }
  if (entry.kind === 'boss') entry.hpFill.material.dispose();
  if (state.boss === entry) state.boss = null;
  const index = state.objects.indexOf(entry);
  if (index >= 0) state.objects.splice(index, 1);
}

function endRun() {
  if (state.mode !== 'running') return;
  state.mode = 'result';
  state.storage.coins += state.runCoins;
  save();
  $('hud').hidden = true;
  $('resultDistance').textContent = `${Math.floor(state.distance)} m`;
  $('resultCoins').textContent = `+${state.runCoins}`;
  $('resultKills').textContent = state.kills.toLocaleString();
  $('result').hidden = false;
}

function resetWorld() {
  for (const entry of [...state.objects]) disposeObject(entry);
  for (const effect of state.effects) {
    scene.remove(effect.object);
    effect.object.geometry?.dispose();
    effect.object.material?.map?.dispose();
    effect.object.material?.dispose();
  }
  state.effects.length = 0;
  state.boss = null;
  for (const mesh of blueSoldiers) { mesh.count = 0; mesh.instanceMatrix.needsUpdate = true; }
  for (const mesh of enemySoldiers) { mesh.count = 0; mesh.instanceMatrix.needsUpdate = true; }
}

function startRun() {
  resetWorld();
  state.mode = 'running';
  state.x = 0;
  state.distance = 0;
  state.waves = 0;
  state.miniBosses = 0;
  state.nextWave = 8;
  state.runCoins = 0;
  state.kills = 0;
  state.strength = 1 + state.storage.strengthLevel * 0.2;
  state.lastBossHit = 0;
  $('runCoins').textContent = '0';
  $('distance').textContent = '0 m';
  $('bossHud').hidden = true;
  $('lobby').hidden = true;
  $('result').hidden = true;
  $('hud').hidden = false;
  $('dragHint').hidden = false;
  window.setTimeout(() => { $('dragHint').hidden = true; }, 3500);
  setArmy(state.storage.startingArmy);
  state.lastTime = performance.now();
  playTone('gate');
}

let pointerDown = false;
let lastPointerX = 0;
canvas.addEventListener('pointerdown', (event) => {
  if (state.mode !== 'running') return;
  pointerDown = true;
  lastPointerX = event.clientX;
  canvas.setPointerCapture(event.pointerId);
  if (state.sound?.state === 'suspended') void state.sound.resume();
});
canvas.addEventListener('pointermove', (event) => {
  if (!pointerDown || state.mode !== 'running') return;
  const delta = event.clientX - lastPointerX;
  lastPointerX = event.clientX;
  state.x = THREE.MathUtils.clamp(state.x + delta / innerWidth * 8.7, -4.35, 4.35);
});
canvas.addEventListener('pointerup', () => { pointerDown = false; });
canvas.addEventListener('pointercancel', () => { pointerDown = false; });
window.addEventListener('blur', () => { pointerDown = false; });

$('playButton').addEventListener('click', startRun);
$('returnButton').addEventListener('click', () => {
  $('result').hidden = true;
  $('lobby').hidden = false;
  renderLobby();
});
document.querySelectorAll('[data-upgrade]').forEach((button) => {
  button.addEventListener('click', () => buyUpgrade(button.dataset.upgrade));
});

function update(delta, now) {
  const running = state.mode === 'running';
  const safeDelta = Math.min(delta, 0.045);
  if (running) {
    const speed = 16;
    state.distance += speed * safeDelta;
    if (state.distance >= state.nextWave) spawnWave();
    $('distance').textContent = `${Math.floor(state.distance)} m`;
    for (const tile of bridgeTiles) {
      tile.position.z -= speed * safeDelta;
      if (tile.position.z < -58) tile.position.z += 174;
    }
    for (const entry of [...state.objects]) {
      if (!state.objects.includes(entry)) continue;
      if (entry.kind === 'boss' && entry.z <= 13) entry.z = 10;
      else entry.z -= speed * safeDelta;
      entry.group.position.z = entry.z;
      if (entry.kind === 'hazard' && entry.group.userData.pivot) {
        entry.group.userData.pivot.rotation.z = Math.sin(now * 0.004) * 0.68;
        if (entry.group.userData.pivot.userData.rotor) entry.group.userData.pivot.userData.rotor.rotation.z = now * 0.004;
      }
      if (entry.kind === 'enemy' && !entry.checked && entry.z <= 4.5) {
        const inLane = Math.abs(state.x - entry.x) < 3.1;
        entry.checked = true;
        if (inLane) collideEnemy(entry);
      }
      if (entry.kind === 'hazard' && !entry.checked && entry.z <= 2.2 && entry.z >= -1.5) {
        if (Math.abs(state.x - entry.x) < 1.9) damageArmy(entry.damage, `-${entry.damage}`);
        entry.checked = true;
      }
      if (entry.kind === 'gate' && !entry.checked && entry.z <= 2.2 && entry.z >= -1) {
        if (entry.x < 0 ? state.x < 0.15 : state.x >= 0.15) applyGate(entry);
        else entry.checked = true;
      }
      if (entry.kind === 'boss' && entry.z <= 13) engageBoss(entry, now);
      if (entry.z < -14) disposeObject(entry);
    }
  } else {
    for (const tile of bridgeTiles) {
      tile.position.z -= safeDelta * 2.2;
      if (tile.position.z < -58) tile.position.z += 174;
    }
  }
  const targetCameraX = state.x * 0.2;
  camera.position.x += (targetCameraX - camera.position.x) * Math.min(1, safeDelta * 5);
  camera.lookAt(state.x * 0.16, 0.8, 19);
  updateSoldiers(blueSoldiers, running ? Math.min(state.count, 520) : Math.min(state.storage.startingArmy, 24), state.x, now / 1000);
  for (const entry of state.objects) if (entry.kind === 'enemy') updateEnemyInstances(entry, now / 1000);
  for (let i = state.effects.length - 1; i >= 0; i -= 1) {
    const effect = state.effects[i];
    effect.life -= safeDelta;
    if (effect.shockwave) {
      const progress = 1 - effect.life / effect.maxLife;
      effect.object.scale.setScalar(1 + progress * 9);
      effect.object.material.opacity = Math.max(0, (1 - progress) * 0.78);
      if (state.mode === 'running' && !effect.hit && progress >= 0.58 && Math.abs(state.x - effect.object.position.x) < 3) {
        effect.hit = true;
        damageArmy(4, 'SHOCKWAVE');
      }
    } else {
      effect.object.position.y += effect.rise * safeDelta;
      effect.object.material.opacity = Math.max(0, effect.life / effect.maxLife);
    }
    if (effect.life <= 0) {
      scene.remove(effect.object);
      effect.object.geometry?.dispose();
      effect.object.material?.map?.dispose();
      effect.object.material?.dispose();
      state.effects.splice(i, 1);
    }
  }
}

function animate(now) {
  requestAnimationFrame(animate);
  const delta = state.lastTime ? (now - state.lastTime) / 1000 : 0.016;
  state.lastTime = now;
  update(delta, now);
  renderer.render(scene, camera);
}

function resize() {
  const width = innerWidth;
  const height = innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  renderer.setSize(width, height, false);
}

window.addEventListener('resize', resize, { passive: true });
window.addEventListener('orientationchange', resize, { passive: true });
renderLobby();
animate(performance.now());
