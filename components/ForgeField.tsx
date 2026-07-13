"use client";

import { useEffect, useRef } from "react";

/*
 * The living background, forged: the molten floor of the forge, as a raw
 * WebGL fragment shader (no dependencies).
 *
 * Animated Voronoi cracks are the seams between dark iron plates. A slow
 * noise field of heat roams the floor, making regions of the seams glow
 * ember from within. The cursor is a crucible — metal melts around a
 * smoothed pointer that eases back — and scroll velocity surges heat through
 * the whole floor while the cracks flow. Crisp emissive veins, no bloom.
 * Reduced motion renders a single cooled frame; no WebGL renders nothing.
 */

const VERT = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }";

const FRAG = `
precision highp float;
uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse; uniform float u_grip;
uniform float u_scroll; uniform float u_energy;

float hash1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 hash2(vec2 p){
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash1(i), hash1(i + vec2(1.0, 0.0)), f.x),
             mix(hash1(i + vec2(0.0, 1.0)), hash1(i + vec2(1.0, 1.0)), f.x), f.y);
}
/* F2 - F1 Voronoi: distance to the nearest crack between plates */
float voronoiEdge(vec2 p, float t){
  vec2 n = floor(p), f = fract(p);
  float f1 = 8.0, f2 = 8.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(float(i), float(j));
    vec2 o = hash2(n + g);
    o = 0.5 + 0.45 * sin(t * 0.35 + 6.2831 * o);
    vec2 r = g + o - f;
    float d = dot(r, r);
    if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) { f2 = d; }
  }
  return sqrt(f2) - sqrt(f1);
}

void main(){
  vec2 p0 = gl_FragCoord.xy / u_res.y * 3.2;
  vec2 m = vec2(u_mouse.x, u_res.y - u_mouse.y) / u_res.y * 3.2;
  float mheat = u_grip * exp(-dot(p0 - m, p0 - m) * 1.6);

  vec2 p = p0;
  p += 0.35 * vec2(vnoise(p * 0.8 + u_time * 0.05), vnoise(p * 0.8 - u_time * 0.04));
  p.y += u_scroll * 0.0005;

  float edge = voronoiEdge(p, u_time);
  float vein = 1.0 - smoothstep(0.005, 0.05, edge);
  float core = 1.0 - smoothstep(0.0, 0.012, edge);

  float patches = vnoise(p * 0.5 + vec2(u_time * 0.06, -u_time * 0.045));
  float heat = clamp(patches * 0.7 + mheat * 0.95 + u_energy * 0.22, 0.0, 1.0);

  vec3 col = mix(vec3(0.42, 0.36, 0.33), vec3(0.86, 0.40, 0.13), smoothstep(0.10, 0.62, heat));
  col = mix(col, vec3(1.0, 0.78, 0.47), core * smoothstep(0.55, 0.95, heat));
  float alpha = vein * (0.08 + 0.55 * heat);
  gl_FragColor = vec4(col * alpha, alpha);
}`;

export default function ForgeField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });
    if (!gl) return; // no WebGL — the plain iron page stands on its own

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(sh) ?? "shader compile failed");
      }
      return sh;
    };

    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    } catch {
      return;
    }
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aLoc = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res: gl.getUniformLocation(program, "u_res"),
      time: gl.getUniformLocation(program, "u_time"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      grip: gl.getUniformLocation(program, "u_grip"),
      scroll: gl.getUniformLocation(program, "u_scroll"),
      energy: gl.getUniformLocation(program, "u_energy"),
    };

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // smoothed cursor with ease-back grip, in device pixels
    let tx = -1;
    let ty = -1;
    let sx = 0;
    let sy = 0;
    let grip = 0;
    let hasCursor = false;
    const onMove = (e: PointerEvent) => {
      if (!hasCursor) {
        sx = e.clientX;
        sy = e.clientY;
        hasCursor = true;
      }
      tx = e.clientX;
      ty = e.clientY;
    };
    const onLeave = () => {
      tx = -1;
      ty = -1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave);

    let lost = false;
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
    };
    const onRestored = () => {
      lost = false;
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    const render = (t: number, scroll: number, energy: number) => {
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, t);
      gl.uniform2f(U.mouse, sx * dpr, sy * dpr);
      gl.uniform1f(U.grip, grip);
      gl.uniform1f(U.scroll, scroll);
      gl.uniform1f(U.energy, energy);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      render(7.3, 0, 0);
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerout", onLeave);
        canvas.removeEventListener("webglcontextlost", onLost);
        canvas.removeEventListener("webglcontextrestored", onRestored);
      };
    }

    let raf = 0;
    let t = 0;
    let lastScroll = window.scrollY;
    let vel = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.hidden || lost) return;

      const sc = window.scrollY;
      vel = vel * 0.86 + (sc - lastScroll) * 0.14;
      lastScroll = sc;
      const energy = Math.min(Math.abs(vel) / 40, 1);

      // scroll surges heat and makes the cracks flow faster
      t += 0.006 + energy * 0.012;

      const present = tx >= 0;
      grip += ((present ? 1 : 0) - grip) * 0.08;
      if (present) {
        sx += (tx - sx) * 0.1;
        sy += (ty - sy) * 0.1;
      }

      render(t, sc, energy);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas className="field" ref={ref} aria-hidden />;
}
