import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "https://unpkg.com/three@0.164.1/examples/jsm/loaders/RGBELoader.js";
import CannonDebugger from "https://cdn.jsdelivr.net/npm/cannon-es-debugger@1.0.0/+esm";
import * as CANNON from "cannon";

// Variables
let scene, camera, renderer;
let capsuleHeight = 1.6;
let collisionCapsule;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let LeftController_inputY, LeftController_inputX;
let RightController_inputY, RightController_inputX;
const characterSpeed = 0.03;
let controls;
let raycaster, intersectedObject, rayLine, listener;
let isRaycasting = false;
let audioLoader, sound;
let grp;
let rayLength = 5;
let world;
let collisionCapsuleBody;
let cannonDebugger;
let debug = false;
let StartingLoader;

async function init() {
  scene = new THREE.Scene();

  StartingLoader = new THREE.LoadingManager();
  
  StartingLoader.onLoad = function () {
    const loader = document.querySelector(".flexbox");
    if (loader) {
        loader.style.display = "none";
    }
  };
  
  
  raycaster = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, 0, -1),
    0,
    rayLength
  );
  listener = new THREE.AudioListener();
  audioLoader = new THREE.AudioLoader();
  sound = new THREE.Audio(listener);
  grp = new THREE.Group();

  //Cannonjs impl
  world = new CANNON.World();
  world.gravity.set(0, -9.81, 0);
  cannonDebugger = new CannonDebugger(scene, world);

  const noBounceMaterial = new CANNON.Material("noBounce");
  const plasticContactConcreteMaterial = new CANNON.Material("plastic");
  
  // ✅ AGREGAR ESTA LÍNEA JUSTO AQUÍ:
  window.plasticContactConcreteMaterial = plasticContactConcreteMaterial;
  
  const noBounceContactMaterial = new CANNON.ContactMaterial(
    noBounceMaterial,
    plasticContactConcreteMaterial,
    {
      friction: 0.9,
      restitution: 0,
    }
  );
  world.addContactMaterial(noBounceContactMaterial);

  //ground
  const planeShape = new CANNON.Plane();
  const planeBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    shape: planeShape,
  });
  planeBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(1, 0, 0),
    -Math.PI * 0.5
  );
  world.addBody(planeBody);

  // Set up the camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    500
  );
  camera.position.set(0, 1.6, 3);
  camera.add(listener);

  // Set up the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);
  document.body.appendChild(VRButton.createButton(renderer));
  setupLightning(renderer, scene);

  // Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  // Create a collision capsule for character
  const capsuleGeometry = new THREE.CapsuleGeometry(0.1, capsuleHeight / 2, 1);
  const capsuleMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    opacity: 0,
    transparent: true,
  });
  collisionCapsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
  scene.add(collisionCapsule);

  collisionCapsule.add(camera);
  collisionCapsule.position.set(0, 0, 0);

  //physics body for capsule
//physics body for capsule
collisionCapsuleBody = new CANNON.Body({
  mass: 1, // ← Cambiar a 1 (muy ligero pero con físicas)
  shape: new CANNON.Box(new CANNON.Vec3(0.25, capsuleHeight / 2, 0.25)), // ← Más grande
  position: new CANNON.Vec3(0, 1, 0),
  material: noBounceMaterial,
  fixedRotation: true, // ← Evita que rote
  linearDamping: 0.95, // ← Frena rápido
  angularDamping: 0.95 // ← Frena rotación
});
collisionCapsuleBody.angularFactor.set(0, 1, 0);
world.addBody(collisionCapsuleBody);

  // Create a line to represent the ray
  const rayGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -rayLength),
  ]);

  const rayMaterial = new THREE.LineBasicMaterial({
    color: 0x00eaff,
  });

  setupControllers();

  rayLine = new THREE.Line(rayGeometry, rayMaterial);
  controller2.add(rayLine);
  rayLine.visible = false;

  // Load the 3D model
  await loadModel("./assets/Oxygenation.glb", false);
  await loadModel("./assets/Oxygenation_Collidors.glb", true);

  await loadInteractiveModel("./assets/Warehouse_Shelving_Unit.glb", new THREE.Vector3(2, .01, 9.3), new THREE.Vector3(0.03, 0.03, 0.03), Math.PI / 2);
  await loadInteractiveModel("./assets/Power_Plant.glb", new THREE.Vector3(12.4, .02, 1.26), new THREE.Vector3(1, 1, 1), Math.PI / 2);
  await loadInteractiveModel("./assets/Forklift.glb", new THREE.Vector3(-4.50, 1.26, -8), new THREE.Vector3(2, 2, 2), Math.PI / 2);
  await loadInteractiveModel("./assets/industrial_robot.glb", new THREE.Vector3(1, .7, -7.2), new THREE.Vector3(0.0038, 0.0038, 0.0038), Math.PI);
  addManualColliders();
  
  scene.add(grp);
  renderer.xr.addEventListener("sessionend", onSessionEnd);
  renderer.setAnimationLoop(render);
}

function onSessionEnd() {

  collisionCapsule.position.set(0, 0, 0);
  camera.position.set(0, 1.6, 3);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.near = 0.01;
  camera.far = 500;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize.bind(this));
function setupControllers() {
  const controllerModelFactory = new XRControllerModelFactory();

  // Controller 1
  controller1 = renderer.xr.getController(0);
  controller1.addEventListener("connected", onController1Connected);
  controller1.addEventListener("selectstart", onSelectStartController1);
  controller1.addEventListener("selectend", onSelectEndController1);
  collisionCapsule.add(controller1);

  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(
    controllerModelFactory.createControllerModel(controllerGrip1)
  );
  collisionCapsule.add(controllerGrip1);

  // Controller 2
  controller2 = renderer.xr.getController(1);
  controller2.addEventListener("connected", onController2Connected);
  controller2.addEventListener("selectstart", onSelectStartController2);
  controller2.addEventListener("selectend", onSelectEndController2);
  collisionCapsule.add(controller2);

  controllerGrip2 = renderer.xr.getControllerGrip(1);
  controllerGrip2.add(
    controllerModelFactory.createControllerModel(controllerGrip2)
  );
  collisionCapsule.add(controllerGrip2);
}

// Function for handling inputs...
function onController2Connected(event) {
  controller2.userData = event.data;
}
function onController1Connected(event) {
  controller1.userData = event.data;
}

function onSelectStartController1(event) {}

function onSelectEndController1() {}

function onSelectStartController2() {
  if (!isRaycasting) {
    rayLine.visible = true;
    isRaycasting = true;
  } else {
    rayLine.visible = false;
    isRaycasting = false;
  }
}

function onSelectEndController2() {
  
}

async function loadModel(path, hide) {
  const draco = new DRACOLoader(StartingLoader);
  draco.setDecoderConfig({ type: "js" });
  draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
  const loader = new GLTFLoader(StartingLoader);
  loader.setDRACOLoader(draco);

  try {
    loader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(1, 1, 1);
        model.position.set(0, 0, 0);
        // scene.add(model);
        if (hide) {
          grp.add(model);
          model.visible = false;
        } else {
          scene.add(model);
        }

        if (hide) {
          model.traverse((child) => {
            if (child.isMesh) {
              const geometry = child.geometry;
              let shape;
              const box = new THREE.Box3().setFromObject(child);
              const size = new THREE.Vector3();
              box.getSize(size);
              shape = new CANNON.Box(
                new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
              );

              const body = new CANNON.Body({
                mass: 0, // Static body
                position: new CANNON.Vec3(
                  child.position.x,
                  child.position.y,
                  child.position.z
                ),
                shape: shape,
              });
              // body.addShape(shape);
              world.addBody(body);
              child.userData.body = body;
            }
          });
        }
      },
      (xhr) => {
        const percentLoaded = (xhr.loaded / xhr.total) * 100;
        console.log(`Model loading: ${Math.round(percentLoaded)}%`);
      },
      (error) => {
        console.error("An error occurred while loading the model:", error);
      }
    );
  } catch (error) {
    console.error("An error occurred while loading the model:", error);
  }
}

async function loadInteractiveModel(path, position, scale, rotationY = 0) {
  const draco = new DRACOLoader(StartingLoader);
  draco.setDecoderConfig({ type: "js" });
  draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
  const loader = new GLTFLoader(StartingLoader);
  loader.setDRACOLoader(draco);

  return new Promise((resolve) => {
    loader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        model.scale.copy(scale);
        model.position.copy(position);
        model.rotation.y = rotationY;
        
        // ✅ OBTENER NOMBRE DEL ARCHIVO
        const fileName = path.split('/').pop().replace('.glb', '');
        
        // ✅ ASIGNAR NOMBRE AL MODELO PADRE
        model.name = fileName;
        
        // ✅ ASIGNAR EL MISMO NOMBRE A TODOS LOS HIJOS (IMPORTANTE)
        model.traverse((child) => {
          if (child.isMesh) {
            child.name = fileName; // ← ESTA LÍNEA ES CLAVE
            console.log("🔍 Mesh renombrado:", child.name);
          }
        });
        
        grp.add(model);
        model.visible = true;
        
        console.log(`✅ Modelo cargado: ${model.name}`);
        resolve(model);
      },
      undefined,
      (error) => {
        console.error("❌ Error cargando modelo:", error);
        resolve(null);
      }
    );
  });
}

function addManualColliders() {
  console.log("🔧 Creando colliders manuales...");

  // ✅ Warehouse_Shelving_Unit - El estante es ALTO y ANCHO
  // Visual: posición (2, .01, 9.3), escala 0.03
  const shelfCollider = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(2, 1.5, 9.3), // Más alto (era 1.0)
    shape: new CANNON.Box(new CANNON.Vec3(1.2, 1.5, 0.6)), // Más ancho y alto
    material: window.plasticContactConcreteMaterial
  });
  shelfCollider.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
  world.addBody(shelfCollider);
  console.log("✅ Warehouse:9m ancho=.5m, alto=3m, profundo=1.2m");

  // ✅ Power_Plant - Los generadores son LARGOS y ANCHOS
  // Visual: posición (12.4, .02, 1.26), escala 1
  const plantCollider = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(13, 0.8, 0), // Centrado en altura
    shape: new CANNON.Box(new CANNON.Vec3(2.5, 0.8, 1.2)), // MUY ancho (era 1.5)
    material: window.plasticContactConcreteMaterial
  });
  plantCollider.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
  world.addBody(plantCollider);
  console.log("✅ Power_Plant: ancho=5m, alto=1.6m, profundo=2.4m");

  // ✅ Forklift - El montacargas (ya está bien configurado)
  const forkliftCollider = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(-4.50, 1.8, -8),
    shape: new CANNON.Box(new CANNON.Vec3(1.5, 1.8, 1.0)),
    material: window.plasticContactConcreteMaterial
  });
  forkliftCollider.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
  world.addBody(forkliftCollider);
  console.log("✅ Forklift: ancho=3m, alto=3.6m, profundo=2m");

  // ✅ industrial_robot - Los robots tienen brazos EXTENDIDOS
  // Visual: posición (1, .7, -7.2), escala 0.0038
  const robotCollider = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(1, 1.2, -7.2), // Más alto (era 0.6)
    shape: new CANNON.Box(new CANNON.Vec3(1.5, 1.2, 1.5)), // MUCHO más grande
    material: window.plasticContactConcreteMaterial
  });
  robotCollider.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
  world.addBody(robotCollider);
  console.log("✅ Robot: ancho=3m, alto=2.4m, profundo=3m");

  console.log("✅ Todos los colliders manuales creados");
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize && !renderer.xr.isPresenting) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function handleControllerInputForLeft(controller) {
  if (renderer.xr.isPresenting) {
    if (
      controller.userData.gamepad &&
      controller.userData.gamepad.axes &&
      controller.userData.gamepad.axes
    ) {
      // For deadzone...
      if (
        controller.userData.gamepad.axes[2] <= 0.1 &&
        controller.userData.gamepad.axes[2] >= -0.1
      ) {
        LeftController_inputX = 0;
      } else {
        LeftController_inputX = controller.userData.gamepad.axes[2];
      }

      if (
        controller.userData.gamepad.axes[3] <= 0.1 &&
        controller.userData.gamepad.axes[3] >= -0.1
      ) {
        LeftController_inputY = 0;
      } else {
        LeftController_inputY = -1 * controller.userData.gamepad.axes[3];
      }
    }
  }
}

function handleControllerInputForRight(controller) {
  if (renderer.xr.isPresenting) {
    if (
      controller.userData.gamepad &&
      controller.userData.gamepad.axes &&
      controller.userData.gamepad.axes
    ) {
      // For deadzone...
      if (
        controller.userData.gamepad.axes[2] <= 0.1 &&
        controller.userData.gamepad.axes[2] >= -0.1
      ) {
        RightController_inputX = 0;
      } else {
        RightController_inputX = controller.userData.gamepad.axes[2];
      }

      if (
        controller.userData.gamepad.axes[3] <= 0.1 &&
        controller.userData.gamepad.axes[3] >= -0.1
      ) {
        RightController_inputY = 0;
      } else {
        RightController_inputY = -1 * controller.userData.gamepad.axes[3];
      }
    }
  }
}

const clock = new THREE.Clock();

//tick
let previousElapseTime = 0;

// Event tick
function render(time, xrFrame) {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousElapseTime;
  previousElapseTime = elapsedTime;

  if (debug) {
    cannonDebugger.update();
  }
  world.step(Math.min(deltaTime, 0.1));

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  handleControllerInputForLeft(controller1);
  handleControllerInputForRight(controller2);

  if (renderer.xr.isPresenting) {
    // Orientation
    handleMovement();
    handleTurn();

    if (isRaycasting) {
      updateRay(controller2);
    }
    collisionCapsule.quaternion.copy(collisionCapsuleBody.quaternion);
    collisionCapsule.position.copy(collisionCapsuleBody.position);
  }
  renderer.render(scene, camera);
}

function playAudio(obj) {
  let path = "";
  
  console.log("🎯 Objeto intersectado:", obj.name); // ← DEBUG
  
  if (obj.name == "Oil_Absorber") {
    path = "./assets/Audio/Oil_Absorber.mp3";
  } else if (obj.name == "Moisture_Absorber") {
    path = "./assets/Audio/Moisture_Absorber.mp3";
  } else if (obj.name == "Purger") {
    path = "./assets/Audio/Purger.mp3";
  } else if (obj.name == "Carbon_Dioxide_Drying_Unit") {
    path = "./assets/Audio/Carbon_Dioxide_Drying_Unit.mp3";
  } else if (obj.name == "After_Cooler") {
    path = "./assets/Audio/After_Cooler.mp3";
  } else if (obj.name == "Nitrogen_Cooler") {
    path = "./assets/Audio/Nitrogen_Cooler.mp3";
  } else if (obj.name == "Freon_Cooler") {
    path = "./assets/Audio/Freon_Cooler.mp3";
  } else if (obj.name == "Cold_Box") {
    path = "./assets/Audio/Cold_Box.mp3";
  } else if (obj.name == "Air_Expander") {
    path = "./assets/Audio/Air_Expander.mp3";
  } else if (obj.name == "Air_Filter") {
    path = "./assets/Audio/Air_Filter.mp3";
  } else if (obj.name == "Air_Compressor") {
    path = "./assets/Audio/Air_Compressor.mp3";
  } else if (obj.name == "Cylinder_Filling_Ramp") {
    path = "./assets/Audio/Cylinder_Filling_Ramp.mp3";
  } else if (obj.name == "Liquid_Oxygen_Pump") {
    path = "./assets/Audio/Liquid_Oxygen_Pump.mp3";
  } else if (obj.name == "Regeneration_Heater") {
    path = "./assets/Audio/Regeneration_Heater.mp3";
  } else if (obj.name == "Warehouse_Shelving_Unit") {
    path = "./assets/Audio/Warehouse_Shelving_Unit.mp3";
  } else if (obj.name == "Power_Plant") {
    path = "./assets/Audio/Power_Plant.mp3";
  } else if (obj.name == "Forklift") {
    path = "./assets/Audio/Forklift.mp3";
  } else if (obj.name == "industrial_robot") {
    path = "./assets/Audio/Industrial_Robot.mp3";
  }

  console.log("📁 Ruta de audio encontrada:", path); // ← DEBUG

  if (path != "") {
    if (sound.isPlaying) {
      console.log("⏹️ Parando audio anterior...");
      sound.stop();
    }
    
    audioLoader.load(path, function (buffer) {
      console.log("✅ Audio cargado correctamente:", path);
      sound.setBuffer(buffer);
      sound.setLoop(false);
      sound.setVolume(0.3);
      sound.play();
      console.log("▶️ Reproduciendo audio...");
    }, 
    function (xhr) {
      console.log("📊 Cargando audio: " + (xhr.loaded / xhr.total * 100) + "%");
    },
    function (error) {
      console.error("❌ Error cargando audio:", error);
    });
    
    sound.onEnded = () => {
      console.log("🔚 Audio terminado");
    };
  } else {
    console.warn("⚠️ No se encontró ruta de audio para:", obj.name);
  }
}

let prevIntersectObject = null;
function updateRay(controller) {
  raycaster.setFromXRController(controller2);

  const direction = new THREE.Vector3(0, 0, -1)
    .applyMatrix4(controller.matrixWorld)
    .sub(raycaster.ray.origin)
    .normalize();
  raycaster.ray.direction.copy(direction);

  const intersects = raycaster.intersectObjects(grp.children, true);
  
  console.log("🎯 Objetos intersectados:", intersects.length); // ← DEBUG
  
  if (intersects.length > 0) {
    intersectedObject = intersects[0].object;
    console.log("🎯 Objeto detectado:", intersectedObject.name); // ← DEBUG
    
    if (
      prevIntersectObject == null ||
      prevIntersectObject.name != intersectedObject.name
    ) {
      console.log("🔄 Nuevo objeto detectado, reproduciendo audio...");
      playAudio(intersectedObject);
    } else {
      console.log("🔁 Mismo objeto, no reproducir");
    }
    prevIntersectObject = intersectedObject;
  } else {
    console.log("❌ No hay objetos intersectados");
    intersectedObject = null;
    prevIntersectObject = null;
  }
}

init();

function getForwardVector(object) {
  var forward = new THREE.Vector3(0, 0, -1);
  forward.applyQuaternion(object.quaternion);
  forward.normalize();
  return forward;
}

function getRightVector(object) {
  var right = new THREE.Vector3(1, 0, 0);
  right.applyQuaternion(object.quaternion);
  right.normalize();
  return right;
}

function handleMovement() {
  if (
    isNaN(LeftController_inputX) ||
    isNaN(LeftController_inputY) ||
    isNaN(characterSpeed)
  ) {
    return;
  }

  const vrCamera = renderer.xr.getCamera(camera);

  const forwardVec = getForwardVector(collisionCapsuleBody);
  const rightVec = getRightVector(collisionCapsuleBody);

  forwardVec.multiplyScalar(LeftController_inputY);
  rightVec.multiplyScalar(LeftController_inputX);

  // Combine the forward and right vectors
  let resultantVec = new THREE.Vector3();
  resultantVec.addVectors(forwardVec, rightVec);
  resultantVec.multiplyScalar(characterSpeed);

  const cameraQuaternion = vrCamera.quaternion;

  resultantVec.applyQuaternion(cameraQuaternion);
  resultantVec.y = 0;

  if (
    !isNaN(resultantVec.x) &&
    !isNaN(resultantVec.y) &&
    !isNaN(resultantVec.z)
  ) {
    // ✅ Velocidad original restaurada
    collisionCapsule.position.add(resultantVec);
    collisionCapsuleBody.position.vadd(
      resultantVec,
      collisionCapsuleBody.position
    );
  } else {
    console.error("NaN detected in resultant vector:", resultantVec);
  }
}

let isStarted = false;
function handleTurn(check = true) {
  if (
    !isStarted &&
    (RightController_inputX > 0 || RightController_inputX < 0)
  ) {
    isStarted = true;
    if (isNaN(RightController_inputX) || isNaN(RightController_inputY)) {
      console.error(
        "Invalid input:",
        RightController_inputX,
        RightController_inputY
      );
      return;
    }
    let rotationAmount = 0;

    if (RightController_inputX < 0) {
      rotationAmount = 45;
    } else {
      rotationAmount = -45;
    }
    // Apply rotation to the collision capsule
    collisionCapsule.rotateY(rotationAmount);
    collisionCapsuleBody.quaternion.set(
      collisionCapsule.quaternion.x,
      collisionCapsule.quaternion.y,
      collisionCapsule.quaternion.z,
      collisionCapsule.quaternion.w
    );
  } else if (RightController_inputX >= -0.1 && RightController_inputX <= 0.1) {
    isStarted = false;
  }
}

async function setupLightning(renderer, scene) {
  const loader = new RGBELoader(StartingLoader);
  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  pmremGenerator.compileEquirectangularShader();

  await loader.load(
    "./assets/industrial_sunset_puresky_1k.hdr",
    (texture) => {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      pmremGenerator.dispose();
      scene.environment = envMap;
      scene.environmentIntensity = 0.8;
    },
    undefined,
    (err) => {
      console.error("An error occurred setting the environment", err);
    }
  );
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}