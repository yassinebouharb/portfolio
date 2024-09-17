import * as THREE from 'three';
import {
    BoxGeometry,
    Group,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    MeshPhongMaterial,
    PlaneGeometry,
    SphereGeometry,
    TextureLoader
} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {FontLoader} from "three/addons/loaders/FontLoader";
import {TextGeometry} from "three/addons/geometries/TextGeometry";

// Create the scene, camera, and renderer
const scene = new THREE.Scene();
let isMoving=true;
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const earthTexture = new TextureLoader().load("earth.jpg")
const smokeTexture = new TextureLoader().load("smoke.png");


const l = new THREE.CubeTextureLoader();
const texture = l.load([
    'posx.png',  // Right
    'negx.png',   // Left
    'posy.png',    // Top
    'negy.png', // Bottom
    'posz.png',  // Front
    'negz.png'    // Back
]);

scene.background = texture;
// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040); // soft light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // bright directional light
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);
let planetMeshes=[];


// Create a Map to store planets
const planets = new Map();

// Add planets to the Map
planets.set('mars', {
    texture: 'pink.jpg',
    position: { x: 100, y: -250, z: -50 },
    radius: 20,
    info: `
            <strong>Programming Languages:</strong> Python, Java, C, C++<br>
            <strong>Data Science and Machine Learning:</strong> TensorFlow, PyTorch, Scikit-Learn, Pandas, NumPy, Matplotlib<br>
            <strong>Web Development:</strong> JavaScript, TypeScript, HTML, CSS, Flask (Python), Spring Boot (Java), Express.js<br>
            <strong>Big Data Technologies:</strong> Hadoop, Hive, Hudi, PySpark<br>
            <strong>Database Management:</strong> MySQL, MongoDB<br>
            <strong>Cloud and Containerization:</strong> Docker, Cloud Integration<br>
          
        `
});
planets.set('earth', {
    texture: 'earth.jpg',
    position: { x: 200, y: 0, z: -150 },
    radius: 15,
    info:'\n' +
        '    <strong>Chief Technology Officer (CTO), Moving Eye </strong> ' +
        '  <p><strong>Startup Development:</strong> Co-founded a startup to advance the "Moving Eye" concept,\n a smart glasses solution designed to assist visually impaired individuals.<br>\n</p>  ' +
        '    <strong>Key Achievements:</strong><br>\n' +
        '    <ul>\n' +
        '        <li>Spearheaded the training and optimization of an advanced image detection model using YOLOv5, resulting in enhanced performance accuracy (80%) and reduced latency (0.1ms).</li>\n' +
        '        <li>Integrated a virtual assistant powered by natural language processing (NLP) to allow users to interact with the application, providing real-time answers and enhanced navigation assistance.</li>\n' +
        '        <li>Developed a mobile application using Flutter.</li>\n' +
        '    </ul>\n' +
        ''
});

planets.set('neptune', {
    texture: 'jupyter.jpg',
    position: { x: -30, y: 170, z: -250 },
    radius: 15,
    info:"  <strong>Diploma in IT Engineering</strong><br>\n" +
        "    Honoris United Universities Esprit with a specialization in AI/IoT<br>\n" +

        "    <strong>Sept 2018 – May 2023</strong>"
});
planets.set('jupyter', {
    texture: 'jupyter2.jpg',
    position: { x: -300, y: 150, z: 170 },
    radius: 15,
    info:
        "    <strong>Smart Lock System</strong>\n" +
        "    <ul>\n" +
        "        <li>Designed and implemented a smart home lock system using face detection technology.</li>\n" +
        "    </ul>\n" +
        "\n" +
        "    <strong>E-commerce Microservice Architecture</strong>\n" +
        "    <ul>\n" +
        "        <li>Architected and deployed a microservices-based e-commerce application using<strong> Docker, Spring Boot, MongoDB, MySQL, Eureka and Kafka.</strong></li>\n" +
        "    </ul>\n" +
        "\n" +
        "    <strong>CV Maker Telegram Bot</strong> (2024)\n" +
        "    <ul>\n" +
        "        <li>Developed a Telegram bot for generating CVs based on user inputs and formatting resumes.</li>\n" +
        "    </ul>\n"
});
planets.set('mercure', {
    texture: 'mercure.jpg',
    position: { x: 300, y: 250, z: -350 },
    radius: 15,
    info:
        "  <p></p>\n" +
        "<strong>🚀 Startup Incubator Experience: Collectivelab (2023-2024)</strong><br>\n" +
        "Participated in a startup incubator program, gaining hands-on experience and training in essential domains for startup growth and management.<br>\n" +
        "<strong>📚 Courses Taken:</strong><br>\n" +
        "<ul>\n" +
        "    <li>Marketing 📈</li>\n" +
        "    <li>Sales 💼</li>\n" +
        "    <li>Finance 💵</li>\n" +
        "    <li>HR Management 👥</li>\n" +
        "</ul>\n" +
        "\n" +
        "<strong>🏆 Second Place, ALECSO Arab Camp for Talented and Innovative Youth: Oman (2024)</strong><br>\n" +
        "Awarded second place for a healthcare project at the ALECSO Arab Camp, competing among over 500 projects.<br>\n" +
        "\n" +
        "<strong>🥉 Third Place, Pitch Demo Day: Honoris United Universities (2023)</strong><br>\n" +
        "Recognized for the project’s excellence in concept, development, and overall impact.<br>\n" +
        "\n" +
        "<strong>🥇 First Place in the University’s Project Showcase: Honoris United Universities Esprit (2022)</strong><br>\n" +
        "Awarded first place for outstanding work on a final year project.<br>\n" +
        "\n" +
        "<strong>📜 Certifications</strong><br>\n" +
        "<ul>\n" +
        "    <li>Palo Alto Networks Certified Network Security Engineer (PCNSE) 🔐</li>\n" +
        "    <li>Cisco CCNA 4 Certifications 🌐</li>\n" +
        "    <li>Scrum Certification (Coursera) 📅</li>\n" +
        "</ul>\n"
});
let i=0;
// Function to create a planet from the Map
function createPlanet(key, planetData) {
    const { texture, position, radius,info } = planetData;
    const planetGeometry = new THREE.SphereGeometry(radius, 30, 30);
    const planetMaterial = new THREE.MeshPhongMaterial({
     map: new THREE.TextureLoader().load(texture), specular: "#000000"
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.set(position.x, position.y, position.z);
    planet.rotationSpeed = 0.0003;
    planet.orbitAngle = Math.random() * 2 * Math.PI; // Random starting angle
    planet.orbitRadius = position;
    planet.info=info;
    planetMeshes.push( planet);
    const light = new THREE.PointLight("#FF0000", 1, 200); // White light, intensity 1, distance 100
    light.position.set(position.x+10, position.y+10, position.z+10).add(new THREE.Vector3(10, 10, 10)); // Adjust position behind the planet
    scene.add(light);
    scene.add(planet);
    return planet;
}

// Create planets from the Map
planets.forEach((planetData, key) => {
    createPlanet(key, planetData);
});
const ringTexture = new THREE.TextureLoader().load('JupiterRings.png'); // Replace with actual URL or local path
const ringGeometry = new THREE.TorusGeometry(32, 0.5, 16, 100);
const ringMaterial = new THREE.MeshStandardMaterial({
    map: ringTexture,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1
});
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = Math.PI / 2; // Rotate to make the ring horizontal
ring.position.set(-300,150,170)
scene.add(ring);
let planet, planetMixer;
function loadPlanet() {
    const loader = new GLTFLoader();
    loader.load(
        'earth-cartoon.glb', // Update with planet model path
        (gltf) => {
            planet = gltf.scene;
            planet.scale.set(11, 11, 11); // Adjust size as needed
            planet.position.set(0, 0, -20); // Set planet at the origin

            planet.traverse((child) => {

                child.info = '<p>Hello! I’m <strong>Yassine Bouharb</strong>, a dedicated and innovative IT professional. My background spans multiple domains: <strong>software development, data science, and IoT</strong> 🌐🚀.</p>\n' +
                    '\n' +
                    '<p>I’ve worked on diverse projects ranging from mobile and web applications to embedded systems and AI solutions 🤖💻.</p>\n' +
                    '\n' +
                    '<p>My drive to innovate and improve technology fuels my career, and I am always looking for new challenges and opportunities to apply my skills and contribute to exciting projects 🔍✨.</p>\n' +
                    '\n' +
                    '<p>Feel free to connect with me to discuss potential collaborations or technology trends! 🤝💬</p>';


            });
            scene.add(planet);
            // Animation Mixer for Planet
            planetMixer = new THREE.AnimationMixer(planet);
            gltf.animations.forEach((clip) => {
                const action = planetMixer.clipAction(clip);
                action.play(); // Start animation
            });
        },
        undefined,
        (error) => {
            console.error('Error loading planet model:', error);
        }
    );
}
loadPlanet();

function createCometHead(radius = 2, textureURL = 'planet-texture.jpg') {
    // Create the sphere geometry for the comet head
    const cometGeometry = new THREE.SphereGeometry(radius, 16, 16);

    // Load the comet texture (optional)
    const cometTexture = new THREE.TextureLoader().load(textureURL);

    // Create a material with the texture
    const cometMaterial = new THREE.MeshStandardMaterial({
        map: cometTexture,
        roughness: 1,
        metalness: 0
    });


    // Return the comet head
    return new THREE.Mesh(cometGeometry, cometMaterial);
}

const skillModels = {
    'python': { url: 'python.glb', scale: 10 },
    'java': { url: 'java.glb', scale: 10 },
    'html': { url: 'html.glb', scale: 0.2 },
    'css': { url: 'css.glb', scale: 0.2 },
    'docker': { url: 'docker.glb', scale: 15 },
    'c': { url: 'c.glb', scale: 1 }
};

const skillPositions = {
    'python': { x: 350, y: -380, z: 40 },
    'java': { x: 350, y: -380, z: 40 },
    'html': { x: 350, y: -380, z: 40 },
    'css': { x: 350, y: -380, z: 40 },
    'docker': { x: 350, y: -380, z: 40 },
    'c': { x: 350, y: -380, z: 40 }
};

const skillSpeeds = {
    'python': 0.5,
    'java': 0.4,
    'html': 0.6,
    'css': 0.7,
    'docker': 0.45,
    'c': 0.55
};

const skillObjects = {};

// Load skill models with specific scales
function loadSkillModel(key, url, scale, position) {
    const loader = new GLTFLoader();
    loader.load(
        url,
        (gltf) => {
            const skill = gltf.scene;
            skill.scale.set(scale, scale, scale); // Set the scale for each model
            skill.position.set(position.x, position.y, position.z);
            skillObjects[key] = skill;

            // Add skill model to the scene
            scene.add(skill);
        },
        undefined,
        (error) => {
            console.error(`Error loading skill model ${key}:`, error);
        }
    );
}

// Load all skill models
Object.keys(skillModels).forEach(key => {
    const { url, scale } = skillModels[key];
    loadSkillModel(key, url, scale, skillPositions[key]);
});

// Orbit the skill models around the planet
function updateSkillOrbits() {
    const time = Date.now() * 0.001; // Time in seconds

    Object.keys(skillObjects).forEach(key => {
        const skill = skillObjects[key];
        const position = skillPositions[key];

        // Set speed for each skill orbit
        const speed = skillSpeeds[key];

        // Update position for elliptical orbits
        const x = position.x * Math.cos(time * speed) - position.z * Math.sin(time * speed)+150;
        const z = position.x * Math.sin(time * speed) + position.z * Math.cos(time * speed)-100;

        skill.position.set(x, position.y, z);
    });
}


function createComet() {
    const comet = new THREE.Object3D();

    // Create the comet head and tail
    const cometHead = createCometHead();

    // Add the head and tail to the comet
    comet.add(cometHead);


    return comet;
}

// Add the comet to the scene
const comet = createComet();
scene.add(comet);



let cometAngle = 0; // The starting angle of the comet's orbit
const orbitRadiusX = 30; // Orbit radius in the X axis (elliptical orbit)
const orbitRadiusZ = 20; // Orbit radius in the Z axis (elliptical orbit)

let cometSpeed = 0.01;
let cometDirection = new THREE.Vector3(1, 0, 0);  // Direction of comet movement

function moveComet(comet) {
    // Move the comet in the direction
    comet.position.addScaledVector(cometDirection, cometSpeed);




    // Update the comet's angle in its orbit

    cometAngle += cometSpeed;

    // Calculate the comet's position using an elliptical orbit
    const x = orbitRadiusX * Math.cos(cometAngle);
    const z = orbitRadiusZ * Math.sin(cometAngle);

    comet.position.set(x, 0, z);

    // Make the comet look at the center of the orbit
    comet.lookAt(0, 0, 0); // Assuming the center of the orbit is at (0, 0, 0)

    // Update the comet's tail to point away from the center

}
let cursor;
const cursorSpeed = 0.13; // Speed of the cursor movement
const cursorRange = 6; // Maximum distance from the center (0, 0, 0)
let cursorDirection = 1; // Direction of movement (1 for forward, -1 for backward)
let cursorPosition = -5; // Initial distance from (0, 0, 0)
// Variable to store the cursor model
// Load the cursor model
function loadCursor() {
    const loader = new GLTFLoader();
    loader.load(
        'cursor.glb', // Update with the actual path to the cursor model
        (gltf) => {
            cursor = gltf.scene;
            cursor.scale.set(20, 20,20); // Adjust the cursor size
// Start position far from (0, 0, 0)
            cursor.traverse((child) => {
                if (child.isMesh) {
                    // Modify the material to increase brightness and add emissive properties
                    child.material.emissive = new THREE.Color("#ff0000"); // Emissive color
                    child.material.emissiveIntensity = 1.5; // Adjust intensity
                    child.material.shininess = 300; // Make it shinier
                }
            });
            scene.add(cursor);
        },
        undefined,
        (error) => {
            console.error('Error loading cursor model:', error);
        }
    );
}

// Function to move the cursor in a loop towards (0, 0, 0)
function updateCursorMovement() {
    const time = Date.now() * 0.00009; // Time-based movement
    const loopRadius = 100; // Define how far the cursor moves from the planet

    if (cursor) {
        cursorPosition += cursorSpeed * cursorDirection;

        // Reverse direction if the cursor exceeds the range
        if (cursorPosition > cursorRange || cursorPosition < -cursorRange) {
            cursorDirection *= -1; // Reverse direction
        }

        // Set the new cursor position
        cursor.position.set(cursorPosition-10, cursorPosition, 0);

        // Circular motion around the planet with decreasing radius
       // cursor.position.x = distance * Math.cos(angle);
       // cursor.position.z = distance * Math.sin(angle);
       // cursor.position.y = distance * Math.sin(angle); // Optional: add vertical looping as well

        // Make the cursor look at the planet (0, 0, 0)
        cursor.lookAt(-100,-100,100)
    }
}



loadCursor();


const texts = [
    { content: 'Yassine \n Bouharb', size: 10, position: { x: -22, y: 40, z: -60 } },
    { content: 'Skills', size: 8, position: { x:50 , y: -235, z: -70 } },
    { content: 'Project', size: 6, position: { x: -300, y: 180, z: 170 }},
    { content: 'Awards &' +
            ' Certifications\n', size: 6, position: { x: 200, y: 290, z: -450 }},
    { content: 'Education', size: 6, position: { x: -10, y: 185, z: -240 } },
    { content: 'Professional\n Experience', size: 6, position:  { x: 175, y: 50, z: -170 }}
];

// Load a font
const loa = new FontLoader();
loa.load('font1.json', function (font) {

    // Create text geometry
    texts.forEach(text => {
    const textGeometry = new TextGeometry(text.content, {
        font: font,
        size: text.size,
        height: 2,
        bevelEnabled: false // Set to true if you want beveled text
    });

        // Create material for the text
        const textMaterial = new THREE.MeshBasicMaterial({
            color: "#FFEAC5",
            transparent: true,
            opacity: 0.7 // Adjust opacity as needed
        });

        // Create a mesh using the text geometry and material
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Set the position of the text
        textMesh.position.set(text.position.x, text.position.y, text.position.z);

        // Add text to the scene
        scene.add(textMesh);
    });
});



const cubes = new Group();
const smokes = new Group();
for (let i = 0; i < 1000; i++) {
    const cube = new Mesh(
        new BoxGeometry(.02, .02, .02),
        new MeshBasicMaterial({ color: "#fff", transparent: true })
    )
    cube.material.opacity = Math.random()
    cube.position.x = (Math.random() * 200) - 100
    cube.position.y = (Math.random() * 200) - 50
    cube.position.z = -300
    cubes.add(cube)
}

for (let i = 0; i < 1000; i++) {
    const cube = new Mesh(
        new BoxGeometry(.04, .04, .04),
        new MeshBasicMaterial({ color: "#ff3c00", transparent: true })
    )
    cube.material.opacity = Math.random()
    cube.position.x = (Math.random() * 200) - 100
    cube.position.y = (Math.random() * 200) - 50
    cube.position.z = -11
    cubes.add(cube)
}
for (let i = 0; i < 1000; i++) {
    const cube = new Mesh(
        new BoxGeometry(.02, .02, .02),
        new MeshBasicMaterial({ color: "#0033ff", transparent: true })
    )
    cube.material.opacity = Math.random()
    cube.position.x = (Math.random() * 300) - 100
    cube.position.y = (Math.random() * 500) - 50
    cube.position.z = -11
    cubes.add(cube)
}
scene.add(cubes)
const earth = new Mesh(
    new SphereGeometry(10),
    new MeshPhongMaterial({ map: earthTexture, specular: "#000000" })
)
earth.position.set(0,0,-20)

scene.add(earth)


// Particle system variables
const particleCount = 100;  // Number of particles for the fire effect
const particlesGeometry = new THREE.BufferGeometry();
const particlesMaterial = new THREE.PointsMaterial({
    color: 0xff4500,  // Orange-red color for the fire
    size: 0.5,  // Size of each particle
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending  // Makes the fire glow
});

const positions = [];
for (let i = 0; i < particleCount; i++) {
    positions.push(0, 0, 0);  // All particles start at the origin of the spaceship
}
particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

// Create exhaust flame function
function createExhaustFlame() {
    // Create a particle system for the exhaust flame
    const fireParticles = new THREE.Points(particlesGeometry, particlesMaterial);
    fireParticles.position.set(0, -1, 0); // Set position relative to the spaceship

    return fireParticles;  // Return the particle system to be attached to the spaceship
}

// Update exhaust flame position and animation
function updateExhaustFlame() {
    if (!spaceship) return; // Make sure spaceship is loaded

    const positionsArray = particlesGeometry.attributes.position.array;

    // Move each particle slightly backward from the spaceship to create the exhaust effect
    for (let i = 0; i < particleCount; i++) {
        positionsArray[i * 3 + 2] -= Math.random() ;  // Move along the Z-axis
        positionsArray[i * 3 + 1] -= (Math.random() ) ;  // Y-axis flicker
        positionsArray[i * 3] -= (Math.random() * 0.5) * 0.2;  // X-axis flicker

        // Reset particles that go too far behind the spaceship
        if (positionsArray[i * 3 + 2] < -5) {  // Reset when far back
            positionsArray[i * 3] = 0;
            positionsArray[i * 3 + 1] = 0;
            positionsArray[i * 3 + 2] = 0;
        }
    }
    // Update the particle positions
    particlesGeometry.attributes.position.needsUpdate = true;
}
// Raycaster and mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


// Add event listener for mouse movement
window.addEventListener('mousemove', onMouseMove, false);

let graduation;
const loar = new GLTFLoader();
loar.load('graduation_hat.glb', function (gltf) {
    graduation = gltf.scene;
    graduation.scale.set(3, 3, 3); // Adjust size
    graduation.position.set(-20, 183, -250);
    // Create exhaust flame and attach it to the spaceship

graduation.rotation.z-=(Math.PI/6)
    // Add spaceship to the scene
    scene.add(graduation);
}, undefined, function (error) {
    console.error(error);
});


let spaceship;
const loader = new GLTFLoader();
loader.load('space_rocket.glb', function (gltf) {
    spaceship = gltf.scene;
    spaceship.scale.set(3, 3, 3); // Adjust size
    spaceship.position.set(0, 0, 10);
    // Create exhaust flame and attach it to the spaceship

    const fireParticles = createExhaustFlame();
    fireParticles.name = 'fireParticles';
    spaceship.add(fireParticles);  // Attach the fire to the spaceship

    // Add spaceship to the scene
    scene.add(spaceship);
}, undefined, function (error) {
    console.error(error);
});
function onMouseMove(event) {
    // Normalize mouse coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster
    // Ensure the raycaster uses the updated world matrix
    raycaster.ray.origin.copy(camera.position);
    raycaster.ray.direction.set(mouse.x, mouse.y, 1).unproject(camera).sub(raycaster.ray.origin).normalize();

    // Check for intersections
    const intersects = raycaster.intersectObjects(scene.children,true);

    // Update info box
    const infoDiv = document.getElementById('info');


    if (intersects.length > 0 && intersects[0].object.info!=null)  {
        const intersectedObject = intersects[0].object;
        infoDiv.style.display = 'block';
        infoDiv.style.left = `${event.clientX}px`;
        infoDiv.style.top = `${event.clientY}px`;
        infoDiv.innerHTML = `
        ${intersectedObject.info || ' '}`;
    } else {
        infoDiv.style.display = 'none';
    }
}

// Set up camera controls (mouse interaction)
function centerCameraOnSpaceship(z) {
    if (!spaceship) return;

    // Calculate bounding box of the spaceship
    const boundingBox = new THREE.Box3().setFromObject(spaceship);
    const center = boundingBox.getCenter(new THREE.Vector3());
    // Position the camera
    camera.position.copy(center);

    camera.position.z =z
    camera.lookAt(center); // Make the camera look at the center of the spaceship
}

// Function to move spaceship between planets
earth.visible=false
let targetPlanet =earth
let moveSpeed = 0.01;

let intialspaceshipposotion;

let time=0;
let focus=50;
function moveSpaceship() {
    if (spaceship && isMoving) {
        const spaceshipPosition = spaceship.position;
        let targetPosition = targetPlanet.position.clone();
        targetPosition.y+=3+targetPlanet.geometry.parameters.radius;
        targetPosition.z=targetPlanet.position.z+targetPlanet.geometry.parameters.radius;
        // Move spaceship towards the target planet
        spaceship.lookAt(targetPlanet.position);
        spaceship.rotation.x = -Math.PI;

        spaceship.rotateY(-Math.PI);
        spaceshipPosition.lerp(targetPosition, moveSpeed);
        centerCameraOnSpaceship(spaceshipPosition.z+50);
        intialspaceshipposotion=spaceshipPosition.y
        spaceship.getObjectByName('fireParticles').visible = true;

        if (spaceshipPosition.distanceTo(targetPosition) < 20) {
            // focus-=0.1
            centerCameraOnSpaceship(spaceshipPosition.z + focus);
            time += 0.01

            spaceship.getObjectByName('fireParticles').visible = false;

            // Make the spaceship float up and down using a sine wave
            spaceship.position.y = intialspaceshipposotion + Math.sin(time) * 0.05;
        }
        // Check if spaceship is close enough to the target to switch targets
        if (spaceshipPosition.distanceTo(targetPosition) < 1.5) {

focus=50
            if(i===planetMeshes.length)
                i=0;
            targetPlanet = planetMeshes[i]
            i+=1;
            isMoving=false
             // Switch to next planet

        }

    }
    window.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {

            isMoving = true; // Start moving the spaceship
        }
    });
    document.addEventListener('DOMContentLoaded', () => {
        // Get the button element
        const button = document.getElementById('delete-button');

        // Add a click event listener to the button
        button.addEventListener('click', () => {
            isMoving = true;
            // Add your desired functionality here
        });
    });
    window.addEventListener('keydown', (event) => {
        if (event.key === 'H' || event.key === 'h') {
            i=0;
            isMoving = true;
            targetPlanet = earth; // Start moving the spaceship
        }
    });

    requestAnimationFrame(moveSpaceship);
    renderer.render(scene, camera);
}
const clock = new THREE.Clock();

const animate = () => {
    requestAnimationFrame(animate);


        const delta = clock.getDelta();

        // Update mixers for animations
        if (planetMixer) planetMixer.update(delta);
    planetMeshes.forEach(planet => {
        planet.rotation.y += planet.rotationSpeed; // Rotate around the y-axis
    });
    cubes.children.forEach(cube => {
        cube.rotation.z += .01;
        cube.rotation.x += .01;
    })

    smokes.children.forEach(smoke => {
        smoke.rotation.z += .001 * (Math.random() >= .5 ? 1 : -1);
    })
    ring.rotation.z += 0.005;

    earth.rotation.x += 0.0003;
    earth.rotation.z += 0.0003;
    moveComet(comet);
    // Update the exhaust flame
    updateCursorMovement();

    updateSkillOrbits();
   updateExhaustFlame();
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation loop
moveSpaceship();
