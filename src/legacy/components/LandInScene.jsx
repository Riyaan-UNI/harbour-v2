import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
function organicDisc(radius, height, color, seed) {
  const segments = 112;
  const rings = 14;
  const positions = [];
  const indices = [];
  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    for (let segment = 0; segment < segments; segment++) {
      const angle = segment / segments * Math.PI * 2;
      const edge = 1 + Math.sin(angle * 3 + seed) * 0.035 + Math.cos(angle * 7 - seed) * 0.018;
      const r = Math.max(0.018, radius * t * edge);
      const undulation = Math.sin(angle * 4 + t * 8 + seed) * 0.018 * t;
      const rise = Math.pow(1 - t, 1.7) * height + undulation;
      positions.push(Math.cos(angle) * r, rise, Math.sin(angle) * r * 0.68);
    }
  }
  for (let ring = 0; ring < rings; ring++) {
    for (let segment = 0; segment < segments; segment++) {
      const next = (segment + 1) % segments;
      const a = ring * segments + segment;
      const b = ring * segments + next;
      const c = (ring + 1) * segments + segment;
      const d = (ring + 1) * segments + next;
      indices.push(a, b, c, b, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.94, metalness: 0, flatShading: false });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return mesh;
}
function makeRock(scale = 1) {
  const points = [
    new THREE.Vector2(0, -0.26),
    new THREE.Vector2(0.5, -0.18),
    new THREE.Vector2(0.66, 0.05),
    new THREE.Vector2(0.45, 0.42),
    new THREE.Vector2(0.15, 0.57),
    new THREE.Vector2(0, 0.6)
  ];
  const rock = new THREE.Mesh(
    new THREE.LatheGeometry(points, 10),
    new THREE.MeshStandardMaterial({ color: [0x485d57, 0x58675c, 0x6b7466][Math.floor(Math.random() * 3)], roughness: 1, flatShading: true })
  );
  rock.scale.set(scale * (1 + Math.random() * 0.35), scale * (0.7 + Math.random() * 0.4), scale);
  rock.rotation.set(Math.random() * 0.2, Math.random() * Math.PI, Math.random() * 0.16);
  rock.castShadow = true;
  return rock;
}
function makeTree(x, z, size, warm = false) {
  const tree = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.04, size * 0.35, -0.02),
    new THREE.Vector3(-0.08, size * 0.72, 0.03),
    new THREE.Vector3(0.03, size, 0)
  ]);
  const trunk = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 9, 0.07 * size, 7, false),
    new THREE.MeshStandardMaterial({ color: 7295297, roughness: 1 })
  );
  trunk.castShadow = true;
  tree.add(trunk);
  const greens = warm ? [7967839, 9939310, 6127711] : [4287320, 6260066, 7903850];
  const clumps = [
    [-0.24, 0.94, 0, 0.38],
    [0.21, 0.96, 0.03, 0.34],
    [0, 1.2, 0, 0.41],
    [0.05, 0.87, 0.22, 0.3],
    [-0.08, 1.02, -0.2, 0.32]
  ];
  clumps.forEach(([cx, cy, cz, s], index) => {
    const crown = new THREE.Mesh(
      new THREE.IcosahedronGeometry(size * s, 1),
      new THREE.MeshStandardMaterial({ color: greens[index % greens.length], roughness: 0.88, flatShading: true })
    );
    crown.position.set(size * cx, size * cy, size * cz);
    crown.scale.set(1, 0.8 + index % 2 * 0.17, 0.9);
    crown.rotation.set(index * 0.31, index * 0.73, 0);
    crown.castShadow = true;
    tree.add(crown);
  });
  tree.position.set(x, 0.15, z);
  return tree;
}
function makeWelcomeSign() {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  context.fillStyle = "#f7e8bd";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#123c36";
  context.font = "600 102px Georgia";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("LandIn", 384, 112);
  context.font = "500 28px Arial";
  context.letterSpacing = "8px";
  context.fillText("WELCOME ASHORE", 384, 196);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 0.83),
    new THREE.MeshStandardMaterial({ map: texture, emissive: 16763257, emissiveIntensity: 0.17, roughness: 0.72 })
  );
  sign.position.set(1.15, 1.62, 0.72);
  sign.rotation.x = -0.05;
  sign.castShadow = true;
  return sign;
}
function makeArrivalPoint() {
  const group = new THREE.Group();
  const timber = new THREE.MeshStandardMaterial({ color: 10253137, roughness: 0.9 });
  const darkTimber = new THREE.MeshStandardMaterial({ color: 6243127, roughness: 0.95 });
  for (let i = 0; i < 10; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.09, 0.34), i % 2 ? timber : darkTimber);
    plank.position.set(0.2, 0.22 + i * 6e-3, 0.95 + i * 0.38);
    plank.castShadow = true;
    group.add(plank);
  }
  [-0.62, 1.02].forEach((x) => [1.08, 4.88].forEach((z) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.95, 8), darkTimber);
    post.position.set(x, -0.08, z);
    post.castShadow = true;
    group.add(post);
  }));
  const building = new THREE.Mesh(
    new THREE.ExtrudeGeometry(
      new THREE.Shape().moveTo(-0.9, 0).lineTo(0.9, 0).lineTo(0.9, 0.82).lineTo(0, 1.4).lineTo(-0.9, 0.82).lineTo(-0.9, 0),
      { depth: 1.35, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.05, bevelSegments: 2 }
    ),
    new THREE.MeshStandardMaterial({ color: 15190155, roughness: 0.88 })
  );
  building.position.set(0.2, 0.28, -0.92);
  building.castShadow = true;
  building.receiveShadow = true;
  group.add(building);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.67), new THREE.MeshStandardMaterial({ color: 3105374, roughness: 0.8 }));
  door.position.set(0.2, 0.64, 0.44);
  group.add(door);
  [-0.55, 0.91].forEach((x) => {
    const lamp = new THREE.PointLight(16758362, 4, 3.2, 2);
    lamp.position.set(x, 1.12, 0.54);
    group.add(lamp);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), new THREE.MeshStandardMaterial({ color: 16766352, emissive: 16751680, emissiveIntensity: 2 }));
    bulb.position.copy(lamp.position);
    group.add(bulb);
  });
  group.add(makeWelcomeSign());
  return group;
}
function makeBoat() {
  const boat = new THREE.Group();
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-1.65, 0.3);
  hullShape.bezierCurveTo(-1.2, -0.48, 0.95, -0.5, 1.72, 0.15);
  hullShape.lineTo(1.34, 0.58);
  hullShape.bezierCurveTo(0.3, 0.35, -0.72, 0.38, -1.65, 0.3);
  const hull = new THREE.Mesh(
    new THREE.ExtrudeGeometry(hullShape, { depth: 0.92, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.09, bevelThickness: 0.08 }),
    new THREE.MeshPhysicalMaterial({ color: 1526859, roughness: 0.38, clearcoat: 0.35 })
  );
  hull.position.z = -0.46;
  hull.castShadow = true;
  boat.add(hull);
  const deckShape = new THREE.Shape();
  deckShape.moveTo(-1.2, 0);
  deckShape.lineTo(1.23, 0);
  deckShape.lineTo(0.98, 0.5);
  deckShape.lineTo(-0.9, 0.5);
  deckShape.closePath();
  const deck = new THREE.Mesh(new THREE.ExtrudeGeometry(deckShape, { depth: 0.7, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 }), new THREE.MeshStandardMaterial({ color: 14268282, roughness: 0.75 }));
  deck.rotation.x = Math.PI / 2;
  deck.position.set(0, 0.39, -0.35);
  deck.castShadow = true;
  boat.add(deck);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.48, 0.64), new THREE.MeshStandardMaterial({ color: 15787468, roughness: 0.7 }));
  cabin.position.set(-0.22, 0.72, 0);
  cabin.castShadow = true;
  boat.add(cabin);
  const glass = new THREE.MeshStandardMaterial({ color: 9160393, roughness: 0.18, metalness: 0.1 });
  const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.2), glass);
  windowMesh.position.set(0.125, 0.78, 0.326);
  boat.add(windowMesh);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 1.2, 8), new THREE.MeshStandardMaterial({ color: 15324846, roughness: 0.8 }));
  mast.position.set(-0.2, 1.42, 0);
  boat.add(mast);
  const sailShape = new THREE.Shape();
  sailShape.moveTo(-0.1, 0.12);
  sailShape.bezierCurveTo(0.24, 0.1, 0.72, 0.28, 1.02, 0.48);
  sailShape.bezierCurveTo(0.76, 0.84, 0.4, 1.32, 0.02, 1.5);
  sailShape.bezierCurveTo(0.02, 1.06, -0.08, 0.48, -0.1, 0.12);
  const sail = new THREE.Mesh(new THREE.ShapeGeometry(sailShape, 18), new THREE.MeshPhysicalMaterial({ color: 0xf2e5ca, roughness: 0.86, side: THREE.DoubleSide, clearcoat: 0.12 }));
  sail.position.set(-0.12, 1.25, 0.025);
  boat.add(sail);
  const sailStripe = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 1.12), new THREE.MeshStandardMaterial({ color: 0xa65142, side: THREE.DoubleSide, roughness: 0.8 }));
  sailStripe.position.set(0.21, 1.9, 0.04);
  sailStripe.rotation.z = -0.12;
  boat.add(sailStripe);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.17), new THREE.MeshStandardMaterial({ color: 0xb55243, side: THREE.DoubleSide }));
  flag.position.set(0.08, 2.06, 0);
  boat.add(flag);
  const railMaterial = new THREE.MeshStandardMaterial({ color: 16116433, roughness: 0.45 });
  [-0.42, 0.42].forEach((z) => {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 2.35, 6), railMaterial);
    rail.rotation.z = Math.PI / 2;
    rail.position.set(0.05, 0.66, z);
    boat.add(rail);
  });
  const bowLight = new THREE.PointLight(16765065, 5, 4);
  bowLight.position.set(1.55, 0.52, 0);
  boat.add(bowLight);
  boat.scale.setScalar(0.82);
  boat.rotation.y = Math.PI / 2;
  // PROTECTED: expose child meshes so the animation loop (in the effect scope)
  // can reach them. Do NOT redeclare `sail`/`flag` inside makeBoat without also
  // attaching them to userData — the animate() closure cannot see local vars here.
  boat.userData.sail = sail;
  boat.userData.flag = flag;
  return boat;
}
function StaticLandIn({ mode }) {
  return /* @__PURE__ */ jsxs("svg", { className: "landin-static", viewBox: "0 0 900 720", role: "img", "aria-label": "LandIn island at dusk with a boat approaching a lit pier", children: [
    /* @__PURE__ */ jsxs("defs", { children: [
      /* @__PURE__ */ jsxs("linearGradient", { id: `sky-${mode}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { stopColor: "#183e54" }),
        /* @__PURE__ */ jsx("stop", { offset: ".55", stopColor: "#d47f68" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#f0c477" })
      ] }),
      /* @__PURE__ */ jsxs("linearGradient", { id: `sea-${mode}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { stopColor: "#397c84" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#082e3b" })
      ] }),
      /* @__PURE__ */ jsx("filter", { id: `soft-${mode}`, children: /* @__PURE__ */ jsx("feGaussianBlur", { stdDeviation: "12" }) })
    ] }),
    /* @__PURE__ */ jsx("path", { fill: `url(#sky-${mode})`, d: "M0 0h900v720H0z" }),
    /* @__PURE__ */ jsx("circle", { cx: "690", cy: "150", r: "68", fill: "#ffd28b", opacity: ".72", filter: `url(#soft-${mode})` }),
    /* @__PURE__ */ jsx("path", { fill: "#456f70", opacity: ".42", d: "M0 355 120 250l90 66 113-136 126 167 125-92 96 70 116-124 114 139v112H0z" }),
    /* @__PURE__ */ jsx("path", { fill: `url(#sea-${mode})`, d: "M0 390c180-34 315 24 470-5 172-32 277-6 430 18v317H0z" }),
    /* @__PURE__ */ jsxs("g", { opacity: ".28", fill: "none", stroke: "#c7eeee", strokeWidth: "5", children: [
      /* @__PURE__ */ jsx("path", { d: "M0 490q180-40 360 0t360 0 180 0" }),
      /* @__PURE__ */ jsx("path", { d: "M-70 570q190-34 380 0t380 0 380 0" }),
      /* @__PURE__ */ jsx("path", { d: "M20 650q160-29 320 0t320 0 320 0" })
    ] }),
    /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx("path", { fill: "#d8bb72", d: "M355 455c41-91 159-131 288-91 70 22 131 75 145 136-92 48-326 64-433-45Z" }),
      /* @__PURE__ */ jsx("path", { fill: "#57795b", d: "M368 433c56-91 171-117 284-72 61 24 103 61 118 105-99 31-287 36-402-33Z" }),
      /* @__PURE__ */ jsx("path", { fill: "#365f50", d: "M404 412c67-74 157-83 245-45 40 18 72 45 91 73-102 20-238 12-336-28Z" }),
      /* @__PURE__ */ jsxs("g", { fill: "#315444", children: [
        /* @__PURE__ */ jsx("path", { d: "m452 417 9-107 20 1 2 104Z" }),
        /* @__PURE__ */ jsx("path", { d: "M413 320c22-47 91-55 118-1-13 62-100 66-118 1Z" }),
        /* @__PURE__ */ jsx("path", { d: "m672 426-5-89 16-2 11 93Z" }),
        /* @__PURE__ */ jsx("path", { d: "M631 342c19-45 77-49 105-8-1 54-91 64-105 8Z" })
      ] }),
      /* @__PURE__ */ jsxs("g", { fill: "#6f6b55", children: [
        /* @__PURE__ */ jsx("path", { d: "m374 449 24-33 35 4 18 37Z" }),
        /* @__PURE__ */ jsx("path", { d: "m721 465 22-34 37 16-1 30Z" })
      ] }),
      /* @__PURE__ */ jsx("path", { fill: "#9b714e", d: "m585 451 169 68-10 21-174-68Z" }),
      /* @__PURE__ */ jsxs("g", { fill: "#e8c885", children: [
        /* @__PURE__ */ jsx("path", { d: "m502 390 92-31 64 35-8 77-120-4Z" }),
        /* @__PURE__ */ jsx("path", { fill: "#254f4d", d: "m548 421 33-9 4 48-34 2Z" })
      ] }),
      /* @__PURE__ */ jsxs("g", { filter: `url(#soft-${mode})`, fill: "#ffd17c", children: [
        /* @__PURE__ */ jsx("circle", { cx: "538", cy: "414", r: "17" }),
        /* @__PURE__ */ jsx("circle", { cx: "631", cy: "401", r: "17" })
      ] }),
      /* @__PURE__ */ jsx("path", { fill: "#f7e8bd", d: "m610 353 132 19-6 45-132-18Z" }),
      /* @__PURE__ */ jsx("text", { x: "672", y: "391", textAnchor: "middle", fill: "#123c36", fontFamily: "Georgia", fontWeight: "700", fontSize: "26", transform: "rotate(8 672 391)", children: "LandIn" })
    ] }),
    /* @__PURE__ */ jsxs("g", { transform: "translate(170 530) rotate(-6)", children: [
      /* @__PURE__ */ jsx("path", { fill: "#123f49", d: "M0 40q90 42 190 4l-28 58H34Z" }),
      /* @__PURE__ */ jsx("path", { fill: "#d9b77a", d: "m35 35 126-2-17 30H50Z" }),
      /* @__PURE__ */ jsx("path", { fill: "#f1e4c9", d: "M76 0h55v40H76z" }),
      /* @__PURE__ */ jsx("path", { fill: "#77b8bd", d: "M85 8h36v17H85z" }),
      /* @__PURE__ */ jsx("path", { stroke: "#f4e8cd", strokeWidth: "5", d: "M28 46h135M102 0v-49" }),
      /* @__PURE__ */ jsx("path", { fill: "#ee7b65", d: "m105-46 46 12-46 19Z" })
    ] })
  ] });
}
function LandInScene({ mode = "login" }) {
  const mountRef = useRef(null);
  const [fallback, setFallback] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || reduced) return;
    let frame = 0;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      setFallback(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8a5e68);
    scene.fog = new THREE.FogExp2(0x8a5e68, 0.018);
    const sky = new THREE.Mesh(new THREE.SphereGeometry(80, 40, 24), new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
      vertexShader: `varying vec3 skyDirection; void main() { vec4 worldPosition = modelMatrix * vec4(position, 1.); skyDirection = worldPosition.xyz; gl_Position = projectionMatrix * viewMatrix * worldPosition; }`,
      fragmentShader: `varying vec3 skyDirection; void main() { float h = normalize(skyDirection).y; vec3 ember = vec3(.86, .46, .36); vec3 rose = vec3(.45, .33, .40); vec3 deep = vec3(.06, .19, .25); vec3 color = mix(ember, rose, smoothstep(-.04, .3, h)); color = mix(color, deep, smoothstep(.25, .82, h)); gl_FragColor = vec4(color, 1.); }`
    }));
    sky.renderOrder = -100;
    scene.add(sky);
    const camera = new THREE.PerspectiveCamera(mode === "arrival" ? 47 : 42, 1, 0.1, 100);
    camera.position.set(mode === "arrival" ? -7 : -6.4, mode === "arrival" ? 4.2 : 4.7, mode === "arrival" ? 9.5 : 9.2);
    camera.lookAt(0.5, 0.95, 0);
    scene.add(new THREE.HemisphereLight(11130594, 3425591, 2.4));
    const dusk = new THREE.DirectionalLight(16759680, 4.2);
    dusk.position.set(-5, 9, 4);
    dusk.castShadow = true;
    dusk.shadow.mapSize.set(2048, 2048);
    dusk.shadow.camera.left = -8;
    dusk.shadow.camera.right = 8;
    dusk.shadow.camera.top = 7;
    dusk.shadow.camera.bottom = -7;
    scene.add(dusk);
    const rim = new THREE.DirectionalLight(7847373, 2.1);
    rim.position.set(7, 3, -6);
    scene.add(rim);
    const sun = new THREE.Mesh(new THREE.CircleGeometry(1.55, 64), new THREE.MeshBasicMaterial({ color: 0xffc879, fog: false, side: THREE.DoubleSide }));
    sun.position.set(4.5, 5.4, -10);
    scene.add(sun);
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = glowCanvas.height = 256;
    const glowContext = glowCanvas.getContext("2d");
    // PROTECTED: `halo` is referenced by the animation loop below, so it must
    // live in the effect scope, NOT inside this `if` branch. Declared here and
    // assigned within the branch. Re-declaring it with `const` inside the branch
    // was what threw "halo is not defined" and killed the WebGL render loop.
    let halo = null;
    if (glowContext) {
      const glow = glowContext.createRadialGradient(128, 128, 8, 128, 128, 126);
      glow.addColorStop(0, "rgba(255,226,174,.9)");
      glow.addColorStop(0.25, "rgba(255,188,119,.38)");
      glow.addColorStop(1, "rgba(255,153,106,0)");
      glowContext.fillStyle = glow;
      glowContext.fillRect(0, 0, 256, 256);
      const glowTexture = new THREE.CanvasTexture(glowCanvas);
      halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, transparent: true, depthWrite: false, fog: false }));
      halo.position.copy(sun.position);
      halo.scale.set(5.2, 5.2, 1);
      scene.add(halo);
    }
    const distant = organicDisc(9.5, 2.3, 0x547b77, 7);
    distant.position.set(2.2, 0.15, -12);
    distant.scale.z = 0.18;
    distant.rotation.y = 0.08;
    scene.add(distant);
    const farRidge = organicDisc(7.2, 1.8, 0x426f70, 3.3);
    farRidge.position.set(-5.2, 0.08, -10.5);
    farRidge.scale.z = 0.16;
    scene.add(farRidge);
    const island = new THREE.Group();
    const shore = organicDisc(6.05, 1.05, 0xd4b878, 2.4);
    shore.position.y = 0.02;
    island.add(shore);
    const terrain = organicDisc(5.15, 1.95, 0x587d60, 4.1);
    terrain.position.y = 0.3;
    island.add(terrain);
    const upperTerrain = organicDisc(3.6, 1.28, 0x416d54, 6.8);
    upperTerrain.position.set(-0.55, 1.12, -0.36);
    upperTerrain.rotation.y = -0.18;
    island.add(upperTerrain);
    [[-5.45,0.1,0.72],[-4.9,2.05,0.64],[-3.9,3.05,0.54],[-2.1,3.6,0.67],[0.1,3.85,0.62],[2.6,3.5,0.78],[4.45,2.45,0.72],[5.35,0.25,0.66],[4.6,-2.3,0.8],[2.2,-3.5,0.57],[-0.4,-3.8,0.72],[-3.1,-3.3,0.64],[-4.7,-2.3,0.58]].forEach(([x, z, s]) => {
      const rock = makeRock(s);
      rock.position.set(x, 0.34 + s * 0.1, z);
      island.add(rock);
    });
    [
      [-2.5, -0.4, 1.25],
      [-1.55, -1.25, 0.9],
      [-0.9, -0.8, 1.15],
      [1.6, -1.1, 1.05],
      [2.45, -0.35, 0.92],
      [-2.2, 1, 0.72],
      [2.7, 0.72, 0.8],
      [0.25, -1.55, 0.75]
    ].forEach(([x, z, s], index) => island.add(makeTree(x, z, s, index % 3 === 0)));
    island.add(makeArrivalPoint());
    island.position.set(1.1, 0.72, -1.15);
    scene.add(island);
    const waterUniforms = { time: { value: 0 }, dusk: { value: new THREE.Color(15635575) } };
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 45, 120, 90),
      new THREE.ShaderMaterial({
        uniforms: waterUniforms,
        transparent: false,
        vertexShader: `
          uniform float time;
          varying float lift;
          varying vec3 worldPos;
          void main() {
            vec3 p = position;
            float a = sin(p.x * .58 + time * .8) * .045;
            float b = sin(p.y * 1.2 - time * 1.15 + p.x * .18) * .022;
            float c = cos((p.x + p.y) * .7 + time * .45) * .012;
            p.z += a + b + c;
            lift = a + b + c;
            vec4 world = modelMatrix * vec4(p, 1.);
            worldPos = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 dusk;
          varying float lift;
          varying vec3 worldPos;
          void main() {
            float distanceFade = smoothstep(-8., 8., worldPos.z);
            float glint = pow(max(0., sin(worldPos.x * 2.2 + worldPos.z * .8 + time) * .5 + .5), 12.);
            vec3 deep = vec3(.025, .20, .25);
            vec3 near = vec3(.10, .39, .43);
            vec3 color = mix(deep, near, distanceFade + lift * .9);
            float sunsetPath = exp(-abs(worldPos.x + 4.) * .28) * .2;
            color = mix(color, dusk, sunsetPath + glint * .13);
            gl_FragColor = vec4(color, 1.);
          }
        `
      })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.28;
    scene.add(water);
    const boat = makeBoat();
    // PROTECTED: pull the sail/flag meshes back into this (effect) scope so the
    // S-05 animation lines below can animate them. See makeBoat() userData.
    const sail = boat.userData.sail;
    const flag = boat.userData.flag;
    boat.position.set(mode === "arrival" ? -4.8 : -3.8, 0.3, mode === "arrival" ? 5.4 : 5.1);
    scene.add(boat);
    const reflections = new THREE.Group();
    for (let i = 0; i < 14; i++) {
      const streak = new THREE.Mesh(
        new THREE.PlaneGeometry(0.18 + Math.random() * 0.7, 0.018),
        new THREE.MeshBasicMaterial({ color: i % 3 ? 16759412 : 10147031, transparent: true, opacity: 0.3 })
      );
      streak.rotation.x = -Math.PI / 2;
      streak.position.set(-5 + Math.random() * 11, 0.035, 1 + Math.random() * 5);
      reflections.add(streak);
    }
    scene.add(reflections);
    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      if (width < 620) {
        camera.fov = 53;
        camera.position.set(-5.4, 4.2, 10.8);
      } else if (width >= 1440) {
        camera.fov = mode === "arrival" ? 48 : 43;
        camera.position.set(mode === "arrival" ? -7.2 : -6.6, mode === "arrival" ? 4.2 : 4.7, mode === "arrival" ? 10.0 : 9.6);
      } else {
        camera.fov = mode === "arrival" ? 47 : 42;
        camera.position.set(mode === "arrival" ? -7 : -6.4, mode === "arrival" ? 4.2 : 4.7, mode === "arrival" ? 9.5 : 9.2);
      }
      camera.lookAt(0.5, 0.95, 0);
      sun.lookAt(camera.position);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();
    let elapsed = 0;
    let previous = performance.now();
    let running = true;
    const animate = (now) => {
      if (!running) return;
      // Accumulate time so pausing the tab freezes the scene instead of jumping.
      elapsed += Math.min(now - previous, 100) / 1e3;
      previous = now;
      waterUniforms.time.value = elapsed;
      boat.position.y = 0.3 + Math.sin(elapsed * 1.45) * 0.045;
      boat.rotation.z = Math.sin(elapsed * 1.15) * 0.018;
      if (mode === "arrival") {
        const progress = Math.min(elapsed / 5.2, 1);
        boat.position.x = -4.8 + progress * 5.6;
        boat.position.z = 5.4 - progress * 0.45;
      boat.scale.setScalar(0.82 + progress * 0.1);
      }
      reflections.children.forEach((child, index) => {
        child.position.x += Math.sin(elapsed * 0.5 + index) * 7e-4;
      });
      sail.rotation.z = Math.sin(elapsed * 1.8) * 0.025;
      flag.rotation.y = Math.sin(elapsed * 3.2) * 0.12;
      flag.scale.x = 1 + Math.sin(elapsed * 2.7) * 0.06;
      // PROTECTED: sail/flag come from boat.userData (set in makeBoat); halo is
      // declared in the effect scope above. All three must stay in scope here or
      // the loop throws and the whole intro goes blank. Do not inline `const`
      // declarations of these inside nested blocks.
      if (halo) halo.scale.setScalar(5.2 + Math.sin(elapsed * 0.6) * 0.25);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    // Stop rendering while the tab is hidden so the scene costs nothing in the background.
    const onVisibilityChange = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frame);
      } else if (!running) {
        running = true;
        previous = performance.now();
        frame = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      observer.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if ("map" in material && material.map instanceof THREE.Texture) material.map.dispose();
            material.dispose();
          });
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [mode, reduced]);
  if (reduced || fallback) return /* @__PURE__ */ jsx(StaticLandIn, { mode });
  return /* @__PURE__ */ jsx("div", { ref: mountRef, className: "landin-canvas", "aria-label": "Animated 3D LandIn island at dusk with an approaching harbour boat", role: "img" });
}
export {
  LandInScene as default
};
