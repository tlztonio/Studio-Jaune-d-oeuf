import './style.scss'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'dat.gui'
import vertexShader1 from './shaders/vertex1.glsl'
import vertexShader2 from './shaders/vertex2.glsl'

import { SmoothScroll } from './native.smooth.scroll.js';

// const smoothScroll = new SmoothScroll({
//   container: document.querySelector(".container"),
//   // round the threshold to 1 pixel
//   threshold: 1,
//   // use built-in raf loop
//   useRaf: true
// })

// window.addEventListener("resize", () => {
//   smoothScroll.resize()
// })

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xaaaaaa)

/**
 * Loaders
 */
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      // child.material.envMapIntensity = 5
      child.material.needsUpdate = true
      // child.castShadow = true
      // child.receiveShadow = true
    }
  })
}

/**
 * Environment map
 */
// const environmentMap = cubeTextureLoader.load([
//   '/textures/environmentMaps/0/px.jpg',
//   '/textures/environmentMaps/0/nx.jpg',
//   '/textures/environmentMaps/0/py.jpg',
//   '/textures/environmentMaps/0/ny.jpg',
//   '/textures/environmentMaps/0/pz.jpg',
//   '/textures/environmentMaps/0/nz.jpg'
// ])
// environmentMap.encoding = THREE.sRGBEncoding
// scene.background = environmentMap
// scene.environment = environmentMap

/**
 * Material
 */
// Textures
// const mapTexture = textureLoader.load('/models/Shirt/shinyshirttest.jpg')
// mapTexture.encoding = THREE.sRGBEncoding
// mapTexture.flipY = false

const colorTexture = textureLoader.load('/textures/basecolor.jpg')
const heightTexture = textureLoader.load('/textures/height.png')
const normalTexture = textureLoader.load('/textures/normal.jpg')
const ambientOcclusionTexture = textureLoader.load('/textures/ambientOcclusion.jpg')
const roughnessTexture = textureLoader.load('/textures/roughness.jpg')

// Material
const material = new THREE.MeshStandardMaterial({
  // map: colorTexture,
  // normalMap: normalTexture,
})
// material.roughness = 0.1

const depthMaterial = new THREE.MeshDepthMaterial(
  { depthPacking: THREE.RGBADepthPacking }
)

let customUniforms = {
  uTime: { value: 0 },
  uMouse: { value: new THREE.Vector3() }
}

material.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = customUniforms.uTime
  shader.uniforms.uMouse = customUniforms.uMouse
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `
            #include <common>

            uniform float uTime;
            uniform vec3 uMouse;

            mat2 get2dRotateMatrix(float _angle)
            {
                return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
            }
        `
  )
  shader.vertexShader = shader.vertexShader.replace(
    '#include <beginnormal_vertex>', vertexShader2
  )
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>', vertexShader1
  )
}

depthMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = customUniforms.uTime
  console.log(shader)
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `
            #include <common>

            uniform float uTime;

            mat2 get2dRotateMatrix(float _angle)
            {
                return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
            }
        `
  )
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
            #include <begin_vertex>
            
            float angle = sin( position.y * uTime) * 0.2;
            mat2 rotateMatrix = get2dRotateMatrix(angle);

            transformed.xz = rotateMatrix * transformed.xz;
        `
  )
}

/**
 * Models
 */
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

let bottom = null
let top = null
let egg = null
gltfLoader.load(
  '/models/egg/entireEgg.glb',
  (gltf) => {
    // Model
    egg = gltf.scene
    bottom = gltf.scene.children[0]
    top = gltf.scene.children[1]
    // egg.material = material
    // mesh.position.x = 1
    bottom.position.y = -0.4
    top.position.y = -0.4
    // mesh.position.z = 1
    // mesh.rotation.x = 1.2
    // mesh.rotation.y = 0.4
    // mesh.rotation.z = -0.4
    // gui.add(mesh.position, 'x').min(-10).max(10).step(0.1)
    // gui.add(mesh.position, 'y').min(-10).max(10).step(0.1)
    // gui.add(mesh.position, 'z').min(-10).max(10).step(0.1)
    // gui.add(mesh.rotation, 'x').min(-10).max(10).step(0.1)
    // gui.add(mesh.rotation, 'y').min(-10).max(10).step(0.1)
    // gui.add(mesh.rotation, 'z').min(-10).max(10).step(0.1)
    egg.customDepthMaterial = depthMaterial // a bouger avec els lignes du shader ?
    scene.add(egg)
    // Update materials
    updateAllMaterials()
  }
)

/**
 * uMouse
 */
document.addEventListener("mousemove", (e) => {
  customUniforms.uMouse.value.x = (e.clientX / window.innerWidth) * 2 - 1
  customUniforms.uMouse.value.y = -(e.clientY / window.innerHeight) * 2 + 1
  if (top != null) {
    top.position.y = (-(e.clientY / window.innerHeight) * 2) + 1.60
    egg.rotation.y = (e.clientX / window.innerWidth) * 2 + 1 * 0.05
    egg.rotation.z = (-(e.clientX / window.innerWidth) * 2 + 1) * 0.3
    top.rotation.z = ((-(e.clientY / window.innerWidth) * 2 + 1) * -0.3) - 0.4
    bottom.rotation.z = (-(e.clientY / window.innerWidth) * 2 + 1) * 0.3 + 0.2
  }
})

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 5)
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
scene.add(directionalLightHelper)
directionalLight.position.set(0, 3, 2)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 3)
// camera.rotation.set(0, 0, 0)
scene.add(camera)
gui.add(camera.position, 'x').min(-10).max(10).step(0.1)
gui.add(camera.position, 'y').min(-10).max(10).step(0.1)
gui.add(camera.position, 'z').min(-10).max(10).step(0.1)
gui.add(camera.rotation, 'x').min(-10).max(10).step(0.1)
gui.add(camera.rotation, 'y').min(-10).max(10).step(0.1)
gui.add(camera.rotation, 'z').min(-10).max(10).step(0.1)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  // Update Shirt position
  if (egg != null) {
    egg.position.y = Math.sin(elapsedTime) * 0.05
  }
  // Update controls
  // controls.update()
  // Update uTime
  customUniforms.uTime.value = elapsedTime
  // Render
  renderer.render(scene, camera)
  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}
tick()