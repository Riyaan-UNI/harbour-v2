import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * The fibre-optic warp that plays inside the `/arrival` transition.
 *
 * Why it is built this way:
 *
 * - **Curved, not straight.** Each trail is a `CatmullRomCurve3` swept by a
 *   `TubeGeometry`, so the light bends like a fibre run instead of a laser.
 *   Straight lines read as "speed"; curves read as "data".
 * - **Additive, not post-processed.** Bloom via `EffectComposer` would add a
 *   second bundle and a frame cost we cannot justify for a ~3s transition. The
 *   glow is additive blending on the trails plus a CSS `drop-shadow` on the
 *   host (see `.fiber-warp` in `entry-story.css`), which mimics bloom for a
 *   fraction of the weight. The brief's "high-performance material properties
 *   that mimic bloom" is answered here.
 * - **Reduced motion is honoured.** When the user asks for less motion —
 *   either `prefers-reduced-motion: reduce` or the shell's calm switch
 *   (`data-calm` on `<html>`) — we render exactly one still frame and stop the
 *   loop. We do not simply hide the canvas: a flat black panel would look
 *   broken, so the trails are drawn once at a settled moment instead.
 *
 * Geometry, materials and the renderer are all disposed on unmount.
 */

const COLORS = [0x9b6cff, 0x45e8e7, 0x3b8cff, 0x65b8ff, 0xc17bff];
const TRAIL_COUNT = 128;
const WARP_SECONDS = 2.35;
const SETTLED_WARP = 0.025;

function prefersStillness(): boolean {
  if (typeof window === 'undefined') return false;
  if (document.documentElement.dataset.calm === 'true') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Lightweight Three.js warp scene: curved light trails resolve into a quiet starfield. */
export function FiberWarp(): JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
    } catch {
      host.classList.add('fiber-warp--fallback');
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 180);
    camera.position.set(0, 0, 14);
    camera.lookAt(0, 0, -18);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');

    const trails: THREE.Mesh[] = [];
    for (let index = 0; index < TRAIL_COUNT; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 17;
      const bend = (Math.random() - 0.5) * 7;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, -58),
        new THREE.Vector3(Math.cos(angle + bend * 0.035) * radius * 0.72, Math.sin(angle + bend * 0.035) * radius * 0.72, -40),
        new THREE.Vector3(Math.cos(angle + bend * 0.09) * (radius * 0.24 + 0.3), Math.sin(angle + bend * 0.09) * (radius * 0.24 + 0.3), -18),
        new THREE.Vector3(Math.cos(angle + bend * 0.14) * 0.12, Math.sin(angle + bend * 0.14) * 0.12, 0),
      ]);
      const geometry = new THREE.TubeGeometry(curve, 28, 0.009 + Math.random() * 0.012, 4, false);
      const material = new THREE.MeshBasicMaterial({
        color: COLORS[index % COLORS.length],
        transparent: true,
        opacity: 0.58 + Math.random() * 0.38,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const trail = new THREE.Mesh(geometry, material);
      trail.position.z = -Math.random() * 58;
      trail.userData.speed = 18 + Math.random() * 30;
      trails.push(trail);
      scene.add(trail);
    }

    const starPositions = new Float32Array(900 * 3);
    for (let index = 0; index < starPositions.length; index += 3) {
      starPositions[index] = (Math.random() - 0.5) * 100;
      starPositions[index + 1] = (Math.random() - 0.5) * 70;
      starPositions[index + 2] = -Math.random() * 100;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0x9dcfff, size: 0.09, transparent: true, opacity: 0.48, sizeAttenuation: true }));
    scene.add(stars);

    const resize = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };

    const dispose = () => {
      trails.forEach(trail => {
        trail.geometry.dispose();
        (trail.material as THREE.Material).dispose();
      });
      starGeometry.dispose();
      (stars.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };

    // Stillness: draw one settled frame, no animation loop, no observer churn.
    if (prefersStillness()) {
      resize();
      stars.rotation.z = 0.35;
      renderer.render(scene, camera);
      return dispose;
    }

    // `Timer` rather than `Clock`: `Clock` is deprecated in three 0.186, and
    // `Timer.connect` gives us the Page Visibility API for free — a hidden tab
    // stops accumulating delta, so the warp never resumes mid-burst with a
    // huge time step. `getElapsed` replaces our own `performance.now()`
    // bookkeeping, and `update(timestamp)` takes the rAF argument directly.
    const timer = new THREE.Timer();
    timer.connect(document);
    let frame = 0;
    const render = (timestamp?: number) => {
      timer.update(timestamp);
      const elapsed = timer.getElapsed();
      const delta = Math.min(timer.getDelta(), 0.04);
      const warping = elapsed < WARP_SECONDS;
      const warp = warping ? 1 - Math.pow(elapsed / WARP_SECONDS, 2) * 0.72 : SETTLED_WARP;
      trails.forEach(trail => {
        trail.position.z += trail.userData.speed * delta * warp;
        if (trail.position.z > 30) trail.position.z = -60 - Math.random() * 22;
        const material = trail.material as THREE.MeshBasicMaterial;
        material.opacity = Math.min(0.9, (0.48 + warp * 0.38) * (warping ? 1 : 0.22));
      });
      stars.rotation.z += delta * (warping ? 0.008 : 0.018);
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };
    frame = window.requestAnimationFrame(render);

    const observer = new ResizeObserver(resize);
    observer.observe(host);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      timer.dispose();
      dispose();
    };
  }, []);

  return <div ref={hostRef} className="fiber-warp" />;
}
