import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import GUI from 'lil-gui';
import { Water } from 'three/examples/jsm/objects/Water2';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(17, 20, 70);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);


//Shadow attributes
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
directionalLight.shadow.bias = -0.0002;



// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);



// Ground (Sand Texture)
const textureLoader = new THREE.TextureLoader();
const sandTexture = textureLoader.load('/textures/sand/sand.jpg');
sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
sandTexture.repeat.set(10, 10);

const sandMaterial = new THREE.MeshStandardMaterial({
    map: sandTexture,
    bumpMap: sandTexture,
    bumpScale: 0.2,
});
const sandGeometry = new THREE.PlaneGeometry(30, 30, 30, 30);
const sandMesh = new THREE.Mesh(sandGeometry, sandMaterial);
sandMesh.rotation.x = -Math.PI / 2;
sandMesh.position.y=0.01;
scene.add(sandMesh);

//shadow attribute
sandMesh.receiveShadow = true;

// Aquarium Walls
const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x88ccee,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 0.5,
    side: THREE.DoubleSide,
});
const wallGeometry = new THREE.BoxGeometry(30, 15, 30);
const walls = new THREE.Mesh(wallGeometry, glassMaterial);
walls.position.y = 7.5;
walls.scale.set(1, 1, 1);
scene.add(walls);

walls.castShadow = true;
walls.receiveShadow = true;

const aquariumSize = { width: 30, height: 15, depth: 30 };
function keepFishInside(fish) {
    if (fish.position.x > aquariumSize.width / 2 - 3) fish.position.x = aquariumSize.width / 2 - 1;
    if (fish.position.x < -aquariumSize.width / 2 + 1) fish.position.x = -aquariumSize.width / 2 + 1;
    if (fish.position.y > aquariumSize.height - 1) fish.position.y = aquariumSize.height - 1;
    if (fish.position.y < 1) fish.position.y = 1;
    if (fish.position.z > aquariumSize.depth / 2 - 1) fish.position.z = aquariumSize.depth / 2 - 1;
    if (fish.position.z < -aquariumSize.depth / 2 + 1) fish.position.z = -aquariumSize.depth / 2 + 1;
}

// Aquarium Cover
const coverMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
const coverGeometry = new THREE.BoxGeometry(33.5, 1, 33.5);
const cover = new THREE.Mesh(coverGeometry, coverMaterial);
cover.position.y = 15.5;
scene.add(cover);

cover.castShadow = true;
cover.receiveShadow = true;

//Pjesa Posht
const coverMaterial2 = new THREE.MeshStandardMaterial({ color: 0x444444 });
const coverGeometry2 = new THREE.BoxGeometry(31, 1, 31);
const cover2 = new THREE.Mesh(coverGeometry2, coverMaterial2);
cover2.position.y = -.5;
scene.add(cover2);

//shadow attribute
cover2.castShadow = true;
cover2.receiveShadow = true;
// Water Surface
const waterGeometry = new THREE.PlaneGeometry(30, 30);
const water = new Water(waterGeometry, {
    color: 0x001e0f,
    scale: 1,
    flowDirection: new THREE.Vector2(1, 1),
    textureWidth: 1024,
    textureHeight: 1024,
});
water.position.y = 14.2;
water.rotation.x = -Math.PI / 2;
scene.add(water);

// Reflector for Sunlight Effects
const reflectorGeometry = new THREE.PlaneGeometry(30, 30);
const reflector = new Reflector(reflectorGeometry, {
    clipBias: 0.003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0x777777,
});
reflector.position.y = 14.3;
reflector.rotation.x = -Math.PI / 2;
scene.add(reflector);

// Bubbles
const bubbleGeometry = new THREE.SphereGeometry(0.1, 16, 16);
const bubbleMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const bubbles = Array.from({ length: 50 }, () => {
    const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
    bubble.position.set(
        Math.random() * 28 - 14,
        Math.random() * 14,
        Math.random() * 28 - 14
    );
    scene.add(bubble);
    return bubble;
});

function animateBubbles() {
    bubbles.forEach((bubble) => {
        bubble.position.y += Math.random() * 0.02 + 0.01;
        if (bubble.position.y > reflector.position.y-1) bubble.position.y = 0;
    });
}

// Table (Underneath the Aquarium)
const tableLoader = new MTLLoader();
tableLoader.load('/textures/table/table.mtl', (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('/textures/table/table.obj', (table) => {
        table.position.set(0, -20.1, 0);
        table.scale.set(50, 40, 55);
        table.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // Adjust lighting and material if needed
        table.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x8B4513, // or use the material from MTLLoader
                    roughness: 0.5,
                    metalness: 0.2,
                });
            }
        });

        scene.add(table);
    });
});

const waterReflection = new Reflector(reflectorGeometry, {
    clipBias: 0.003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0x888888, // Light color for realism
    recursion: 1, // Improves reflection quality
});
waterReflection.position.y = 14.3;
waterReflection.rotation.x = -Math.PI / 2;
scene.add(waterReflection);



const gui = new GUI();
const fishFolder = gui.addFolder('Fish Controls');
const fishData = [];
// Load Fish
function loadFish(name, objPath, mtlPath, position, scale, speed, rotation) {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(mtlPath, (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(objPath, (object) => {
            object.position.set(position.x, position.y, position.z);
            object.scale.set(0.1, 0.1, 0.1);
            object.rotation.set(rotation.x, rotation.y, rotation.z);
            scene.add(object);

            const fish = { object, speed, position, scale };
            fishData.push(fish);
            const folder = fishFolder.addFolder(name);
            folder.add(fish, 'speed', 0.001, 0.05, 0.001).name('Speed');
            folder.add(fish.position, 'x', -10, 10, 0.1).onChange(() => fish.object.position.x = fish.position.x);
            folder.add(fish.position, 'y', 1, 10, 0.1).onChange(() => fish.object.position.y = fish.position.y);
            folder.add(fish.position, 'z', -10, 10, 0.1).onChange(() => fish.object.position.z = fish.position.z);
            folder.add(fish, 'scale', 0.2, 3, 0.05).onChange(() => fish.object.scale.set(fish.scale, fish.scale, fish.scale));
        

            const swim = () => {
                object.position.x += Math.sin(Date.now() * speed -10) * 0.05;
                object.position.z += Math.cos(Date.now() * speed -10) * 0.05;
                keepFishInside(object);
            };
            fishAnimations.push(swim);

        });
    });
}

const fishAnimations = [];
loadFish('Butterflyfish','/textures/fish1/13003_Auriga_Butterflyfish_v1_L3.obj', '/textures/fish1/13003_Auriga_Butterflyfish_v1_L3.mtl', { x: 10, y: 5, z: 0 }, 1, 0.005, { x: 0, y: Math.PI / 2, z: 0 });
loadFish('Blue Tang','/textures/fish2/13006_Blue_Tang_v1_l3.obj', '/textures/fish2/13006_Blue_Tang_v1_l3.mtl', { x: 5, y: 4, z: 5 }, 1, 0.005, { x: 0, y: Math.PI / 2, z: 0 });
loadFish('Clown Goby Citrinis','/textures/fish3/13008_Clown_Goby_Citrinis_v1_l3.obj', '/textures/fish3/13008_Clown_Goby_Citrinis_v1_l3.mtl', { x: -5, y: 5, z: -5 }, 1, 0.005, { x: 0, y: Math.PI / 2, z: 0 });
loadFish('Coral Beauty Angelfish','/textures/fish4/13009_Coral_Beauty_Angelfish_v1_l3.obj', '/textures/fish4/13009_Coral_Beauty_Angelfish_v1_l3.mtl', { x: -5, y: 2, z: -5 }, 1, 0.005, { x: 0, y: Math.PI / 2, z: 0 });
loadFish('Clown Fish','/textures/fish5/12265_Fish_v1_L2.obj', '/textures/fish5/12265_Fish_v1_L2.mtl', { x: -5, y: 2, z: -5 }, 1, 0.005, { x: Math.PI / 2, y: Math.PI / 2, z: Math.PI / 2 });
loadFish('Long Fin White','/textures/fish6/12993_Long_Fin_White_Cloud_v1_l3.obj', '/textures/fish6/12993_Long_Fin_White_Cloud_v1_l3.mtl', { x: -5, y: 1, z: -5 }, 1, 0.005, { x: 0, y: Math.PI / 2, z: 0 });
loadFish('Red head Solon','/textures/fish7/13013_Red_Head_Solon_Fairy_Wrasse_v1_l3.obj', '/textures/fish7/13013_Red_Head_Solon_Fairy_Wrasse_v1_l3.mtl', { x: 0, y: 2, z: -5 }, 1, 0.005, { x: 0, y: Math.PI / 2, z: 0 });
loadFish('Six Line Wrasse','/textures/fish8/13014_Six_Line_Wrasse_v1_l3.obj', '/textures/fish8/13014_Six_Line_Wrasse_v1_l3.mtl', { x: -5, y: 3, z: -5 }, 1, 0.005, { x: 0, y: Math.PI / 2, z: 0 });



const settings = {
    waterHeight: reflector.position.y,
    sunPositionX: 10,
    sunPositionY: 20,
    sunPositionZ: 10,
};

gui.add(settings, 'waterHeight', 10, aquariumSize.height - 1).onChange((value) => {
        reflector.position.y = value;
    directionalLight.shadow.camera.updateProjectionMatrix();
});

gui.add(settings, 'sunPositionX', -50, 50).onChange((value) => {
    directionalLight.position.x = value;
    directionalLight.shadow.camera.updateProjectionMatrix();
});

gui.add(settings, 'sunPositionY', -50, 50).onChange((value) => {
    directionalLight.position.y = value;
    directionalLight.shadow.camera.updateProjectionMatrix();
});

gui.add(settings, 'sunPositionZ', -50, 50).onChange((value) => {
    directionalLight.position.z = value;
    directionalLight.shadow.camera.updateProjectionMatrix();
});



// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    fishData.forEach(fish => {
        fish.object.position.x += Math.sin(Date.now() * fish.speed) * 0.05;
        fish.object.position.z += Math.cos(Date.now() * fish.speed) * 0.05;
    });
    
    animateBubbles();
    
    if (water.material.uniforms && water.material.uniforms['time']) {
        water.material.uniforms['time'].value += 1.0 / 60.0;
    }

    fishAnimations.forEach((swim) => swim());
    renderer.render(scene, camera);
}

animate();

// Resize Handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});