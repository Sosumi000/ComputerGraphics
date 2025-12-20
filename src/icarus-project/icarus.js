import * as THREE from 'three';

// ==========================================
// 0. 텍스처 로드
// ==========================================
const textureLoader = new THREE.TextureLoader();

const waterColorTexture = textureLoader.load('./assets/textures/water/waterColor.jpg');
const waterNormalTexture = textureLoader.load('./assets/textures/water/waterNormal.jpg');
const skinTexture = textureLoader.load('./assets/textures/feather/feather.jpg');
const featherTexture = textureLoader.load('./assets/textures/feather/feather.jpg');
// 화살표 텍스처 제거됨

waterColorTexture.wrapS = waterColorTexture.wrapT = THREE.RepeatWrapping;
waterNormalTexture.wrapS = waterNormalTexture.wrapT = THREE.RepeatWrapping;
waterColorTexture.repeat.set(50, 50);
waterNormalTexture.repeat.set(50, 50);

// ==========================================
// 1. 기본 설정
// ==========================================
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x87CEEB, 0.0004); 
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 50, 150); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ==========================================
// 2. 조명 및 태양
// ==========================================
const sunGeometry = new THREE.SphereGeometry(300, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.set(0, 1000, -4000); 
scene.add(sunMesh);

const sunlight = new THREE.PointLight(0xffaa00, 2.0, 10000);
sunlight.position.copy(sunMesh.position);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(4096, 4096);
sunlight.shadow.camera.near = 10;
sunlight.shadow.camera.far = 10000;
scene.add(sunlight);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// ==========================================
// 3. 이카루스 모델 (화살표 제거됨)
// ==========================================
const icarusGroup = new THREE.Group();
scene.add(icarusGroup);
icarusGroup.position.set(0, 100, 300); 

const visualGroup = new THREE.Group();
icarusGroup.add(visualGroup);

const bodyGeo = new THREE.BoxGeometry(3, 7, 3);
const bodyMat = new THREE.MeshStandardMaterial({ 
    map: skinTexture, color: 0xffffff, roughness: 0.6 
}); 
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.castShadow = true;
visualGroup.add(body);

function createWing(isLeft) {
    const wingGroup = new THREE.Group();
    const wingGeo = new THREE.BoxGeometry(16, 0.5, 7); 
    const wingMat = new THREE.MeshStandardMaterial({ 
        map: featherTexture, color: 0xffffff, roughness: 0.8, side: THREE.DoubleSide
    }); 
    const wing = new THREE.Mesh(wingGeo, wingMat);
    // 날개의 중심축을 몸통 쪽으로 이동시켜서 줄어들 때 몸통 쪽으로 줄어들게 함
    wing.position.x = isLeft ? -8 : 8; 
    wing.castShadow = true;
    wingGroup.add(wing);
    return wingGroup;
}

const leftWing = createWing(true);
leftWing.position.set(-1.5, 3, 0); 
visualGroup.add(leftWing);

const rightWing = createWing(false);
rightWing.position.set(1.5, 3, 0);
visualGroup.add(rightWing);

// ==========================================
// 4. 파티클 및 바다
// ==========================================
let feathers;
function createFeathers(position) {
    const geom = new THREE.BufferGeometry();
    const count = 500;
    const positions = [];
    const velocities = [];
    for(let i=0; i<count; i++) {
        positions.push(
            position.x + (Math.random() - 0.5) * 10,
            position.y + (Math.random() - 0.5) * 10,
            position.z + (Math.random() - 0.5) * 10
        );
        velocities.push((Math.random() - 0.5) * 3, -Math.random() * 3 - 2, (Math.random() - 0.5) * 3);
    }
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
    const mat = new THREE.PointsMaterial({
        size: 2, map: featherTexture, transparent: true, opacity: 0.9,
        blending: THREE.AdditiveBlending, depthWrite: false
    });
    feathers = new THREE.Points(geom, mat);
    scene.add(feathers);
}

const seaGeo = new THREE.PlaneGeometry(50000, 50000); 
const seaMat = new THREE.MeshStandardMaterial({ 
    map: waterColorTexture, normalMap: waterNormalTexture,
    normalScale: new THREE.Vector2(0.8, 0.8), roughness: 0.1, metalness: 0.8, color: 0x006994
});
const sea = new THREE.Mesh(seaGeo, seaMat);
sea.rotation.x = -Math.PI / 2;
sea.position.y = -100;
sea.receiveShadow = true;
scene.add(sea);

// ==========================================
// 5. 컨트롤 로직
// ==========================================
const keyState = { w: false, a: false, s: false, d: false, shift: false };
let isSpinning = false;
let spinProgress = 0;

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (keyState.hasOwnProperty(key)) keyState[key] = true;
    if (e.shiftKey) keyState.shift = true;

    if (e.code === 'Space' && !isSpinning && !isMelting && !isDead) {
        isSpinning = true;
        spinProgress = 0;
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keyState.hasOwnProperty(key)) keyState[key] = false;
    if (!e.shiftKey) keyState.shift = false;
});

document.body.addEventListener('click', () => {
    document.body.requestPointerLock();
});

let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body && !isMelting && !isDead) {
        mouseX = e.movementX;
        mouseY = e.movementY;
    }
});

// ==========================================
// 6. 애니메이션 루프
// ==========================================
let step = 0;
let isMelting = false;
let isDead = false;

// 물리 변수
let speed = 0;
const acceleration = 0.1;
const friction = 0.98;
const turnSpeed = 0.015;

function animate() {
    requestAnimationFrame(animate);
    step += 0.1;

    waterNormalTexture.offset.x += 0.002;
    waterNormalTexture.offset.y += 0.002;

    const infoDiv = document.getElementById('info');
    
    // ★ 거리 계산을 미리 수행 (날개 크기 조절용)
    const distToSun = icarusGroup.position.distanceTo(sunMesh.position);

    if (!isMelting && !isDead) {
        // =========================================================
        // ★ [신화적 연출] 거리 비례 날개 축소 및 속도 저하
        // =========================================================
        const meltStartDist = 4000; // 이 거리부터 녹기 시작
        const meltEndDist = 1000;   // 이 거리에서 완전히 사라짐

        // 0.0(완전히 녹음) ~ 1.0(멀쩡함) 사이의 값 계산
        let integrity = (distToSun - meltEndDist) / (meltStartDist - meltEndDist);
        integrity = Math.max(0, Math.min(1, integrity)); // 범위 제한

        // 1. 날개 크기 줄이기 (X, Y, Z 축 모두 축소)
        leftWing.scale.set(integrity, integrity, integrity);
        rightWing.scale.set(integrity, integrity, integrity);

        // 2. 속도 패널티 (녹을수록 최대 속도가 느려짐)
        // integrity가 1이면 100% 속도, 0이면 20% 속도까지 떨어짐
        const speedPenalty = 0.2 + (integrity * 0.8); 

        // =========================================================

        // [이동 로직]
        let maxSpeed = keyState.shift ? 4.0 : 1.5;
        maxSpeed *= speedPenalty; // ★ 패널티 적용

        if (keyState.w) speed += acceleration * speedPenalty; // 가속력도 줄어듦
        else if (keyState.s) speed -= acceleration * speedPenalty;
        else speed *= friction; 
        
        speed = Math.max(Math.min(speed, maxSpeed), -maxSpeed / 2);

        icarusGroup.translateZ(-speed);

        // [회전 로직]
        if (keyState.a) icarusGroup.rotation.y += turnSpeed;
        if (keyState.d) icarusGroup.rotation.y -= turnSpeed;

        if (!isSpinning) {
            icarusGroup.rotation.y -= mouseX * 0.0015;
            icarusGroup.rotation.x -= mouseY * 0.004; // 상하 감도 유지
            icarusGroup.rotation.x = Math.max(-1.5, Math.min(1.5, icarusGroup.rotation.x));
            mouseX *= 0.8; mouseY *= 0.8;
        }

        // [뱅킹]
        let targetBank = 0;
        if (keyState.a) targetBank = 0.8;  
        if (keyState.d) targetBank = -0.8; 
        
        if (!isSpinning) {
            visualGroup.rotation.z += (targetBank - visualGroup.rotation.z) * 0.1;
        } else {
            const rollSpeed = 0.10;
            visualGroup.rotation.z -= rollSpeed;
            spinProgress += rollSpeed;
            if (spinProgress >= Math.PI * 2) {
                isSpinning = false;
                visualGroup.rotation.z = 0;
            }
        }

        // [날갯짓] (날개가 작아질수록 더 필사적으로 빨리 퍼덕거림)
        const flapSpeed = 0.2 + (Math.abs(speed) * 0.05) + ((1 - integrity) * 0.5); 
        const flapAmp = (0.2 + (Math.abs(speed) * 0.05)) * integrity; // 크기는 작아짐
        
        leftWing.rotation.z = Math.sin(step * flapSpeed) * flapAmp;
        rightWing.rotation.z = -Math.sin(step * flapSpeed) * flapAmp;
        visualGroup.position.y = Math.sin(step * 0.5) * 0.5;

        // [정보 표시]
        if(infoDiv) {
            let statusText = `Distance: ${Math.floor(distToSun)} | Wing Condition: ${Math.floor(integrity * 100)}%`;
            if(integrity < 0.3) {
                statusText = "WARNING: WINGS MELTING!";
                infoDiv.style.color = "red";
            } else {
                infoDiv.style.color = "white";
            }
            infoDiv.innerText = statusText;
        }

        // ★ [추락 조건] 거리가 1000 미만이면 사망
        if (distToSun < 1000) { 
            isMelting = true;
            createFeathers(icarusGroup.position);
            // 날개 완전히 제거
            visualGroup.remove(leftWing);
            visualGroup.remove(rightWing);
            
            if(infoDiv) {
                infoDiv.innerText = "ICARUS FALLING...";
                infoDiv.style.color = "red";
            }
            document.exitPointerLock();
        }

    } else if (isMelting) {
        // [추락 애니메이션]
        icarusGroup.position.y -= 3.0;
        icarusGroup.rotation.x += 0.05;
        icarusGroup.rotation.z += 0.05;
        
        // 관성 이동
        icarusGroup.translateZ(-speed * 0.5);

        if (feathers) {
            const pos = feathers.geometry.attributes.position.array;
            const vel = feathers.geometry.attributes.velocity.array;
            for (let i = 0; i < pos.length; i += 3) {
                pos[i] += vel[i]; pos[i+1] += vel[i+1]; pos[i+2] += vel[i+2];
            }
            feathers.geometry.attributes.position.needsUpdate = true;
        }
        if (icarusGroup.position.y < -90) {
            isDead = true;
            isMelting = false;
            icarusGroup.position.y = -90;
        }
    }

    if (!isDead) {
        const fixedDist = 90; 
        const fixedHeight = 35;
        const relativeCameraOffset = new THREE.Vector3(0, fixedHeight, fixedDist);
        const cameraOffset = relativeCameraOffset.applyMatrix4(icarusGroup.matrixWorld);

        camera.position.lerp(cameraOffset, 0.1);
        camera.lookAt(icarusGroup.position);
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();