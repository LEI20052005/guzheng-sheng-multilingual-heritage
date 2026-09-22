/**
 * 3D 模型查看器（共享模块）
 * 通过 window.MODEL 配置决定加载哪个模型
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const CONFIG = window.MODEL || {};

/* ---------------- 渲染器 / 场景 / 相机 ---------------- */
const container = document.getElementById('app');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f19);
scene.fog = new THREE.Fog(0x0b0f19, 14, 30);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
const defaultCamPos = new THREE.Vector3(0, 3.2, 7);
const defaultTarget = new THREE.Vector3(0, 1.3, 0);
camera.position.copy(defaultCamPos);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(defaultTarget);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 1.2;
controls.maxDistance = 25;
controls.maxPolarAngle = Math.PI * 0.92;

renderer.domElement.addEventListener('dblclick', () => {
  camera.position.copy(defaultCamPos);
  controls.target.copy(defaultTarget);
});

/* ---------------- 灯光与环境 ---------------- */
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

scene.add(new THREE.AmbientLight(0xffffff, 0.45));

const dirLight = new THREE.DirectionalLight(0xfff1dc, 2.2);
dirLight.position.set(5, 9, 4);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.left = -6;
dirLight.shadow.camera.right = 6;
dirLight.shadow.camera.top = 6;
dirLight.shadow.camera.bottom = -6;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 25;
dirLight.shadow.bias = -0.0004;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x9fc0ff, 0.6);
fillLight.position.set(-5, 3, -4);
scene.add(fillLight);

/* ---------------- 地面与网格 ---------------- */
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(12, 64),
  new THREE.MeshStandardMaterial({ color: 0x151c2b, roughness: 0.9, metalness: 0, transparent: true, opacity: 0.9 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(20, 20, 0x3d4c66, 0x232f45);
grid.position.y = 0.005;
scene.add(grid);

/* ---------------- 模型容器 ---------------- */
const modelGroup = new THREE.Group();
scene.add(modelGroup);

function fitModel(root, targetSize) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) root.scale.multiplyScalar(targetSize / maxDim);
  box.setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box.min.y;
}

function enableShadows(root) {
  root.traverse((o) => {
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
  });
}

function attachFallbackTexture(root, url) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (m && !m.map) {
        m.map = new THREE.TextureLoader().load(url);
        m.needsUpdate = true;
      }
    }
  });
}

/* ---------------- 加载进度与提示 ---------------- */
const loadingEl = document.getElementById('loading');
const loadingText = document.getElementById('loadingText');
const loadingBar = document.getElementById('loadingBar');

function setProgress(ratio) {
  loadingBar.style.width = Math.round(Math.min(1, Math.max(0, ratio)) * 100) + '%';
}

function finishLoading(name) {
  setProgress(1);
  loadingText.textContent = name + ' 加载完成';
  setTimeout(() => loadingEl.classList.add('hidden'), 400);
}

function showBanner(msg) {
  const el = document.getElementById('banner');
  el.innerHTML = msg;
  el.style.display = 'block';
}

// 自包含模式：页面已内嵌模型数据（window.__INLINE_FBX__ / __INLINE_GLB__），
// 即使在 file:// 下也能通过 fetch 拦截器正常加载模型。
const isSelfContained = !!(window.__INLINE_FBX__ || window.__INLINE_GLB__);
const isFileProtocol = location.protocol === 'file:';

if (isFileProtocol && !isSelfContained) {
  showBanner(
    '检测到您正在以 <b>file://</b> 方式打开页面，浏览器会阻止模型加载。<br>' +
    '请通过本地服务器访问本页面。'
  );
  loadingEl.classList.add('hidden');
} else {
  const onSuccess = (root) => {
    fitModel(root, 3);
    enableShadows(root);
    modelGroup.add(root);
    finishLoading(CONFIG.title || CONFIG.key || '模型');
  };
  const onError = (err) => {
    loadingEl.classList.add('hidden');
    showBanner(
      (CONFIG.title || CONFIG.key || '模型') + ' 加载失败：' +
      ((err && err.message) || err) +
      '<br>请确认「' + (CONFIG.path || '') + '」文件存在。'
    );
  };
  const onProgress = (e) => {
    if (e.total) setProgress(e.loaded / e.total);
  };

  if (CONFIG.loaderType === 'fbx') {
    const loader = new FBXLoader();
    if (CONFIG.base) loader.setPath(CONFIG.base);
    loader.load(CONFIG.path, (obj) => {
      if (CONFIG.texture) attachFallbackTexture(obj, CONFIG.texture);
      onSuccess(obj);
    }, onProgress, onError);
  } else {
    const loader = new GLTFLoader();
    // GLB 可能带 Draco 压缩（笙等模型），挂载解码器
    const dracoLoader = new DRACOLoader();
    // file:// 自包含模式：three 本体走 CDN，解码器也走 CDN；
    // http:// 模式：本地 libs/draco/ 由服务器提供
    dracoLoader.setDecoderPath(
      isFileProtocol
        ? 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/'
        : 'libs/draco/'
    );
    loader.setDRACOLoader(dracoLoader);
    loader.load(CONFIG.path, (gltf) => onSuccess(gltf.scene), onProgress, onError);
  }
}

const autoRotate = document.getElementById('autoRotate');
if (autoRotate) {
  autoRotate.addEventListener('change', (e) => {
    controls.autoRotate = e.target.checked;
    controls.autoRotateSpeed = 1.6;
  });
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
