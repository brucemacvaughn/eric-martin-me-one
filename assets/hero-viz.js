/* =========================================================================
 * Embedded hero visualizer — stripped-down version of the full Musicated
 * visualizer for use as a background element on the homepage hero.
 * ======================================================================= */

(() => {
  const TEAL_RGB = [95, 201, 214];

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, DPR = 1;
  function size(){
    const rect = canvas.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width  = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  size();
  window.addEventListener('resize', size);

  // Particle dust
  const PARTICLES = 110;
  const particles = Array.from({length: PARTICLES}, () => ({
    x: Math.random(), y: Math.random(),
    r: 0.2 + Math.random() * 1.5,
    vx: (Math.random() - 0.5) * 0.00012,
    vy: -0.00004 - Math.random() * 0.0001,
    a: 0.05 + Math.random() * 0.3,
    twinkle: Math.random() * Math.PI * 2,
  }));

  function fakeSpectrum(t, bins){
    const out = new Float32Array(bins);
    const beat = 1.83;
    const phase = (t * beat) % 4;
    const kick = Math.exp(-((phase % 1) * 6)) * 0.85;
    const snare = (phase > 0.95 && phase < 1.4) || (phase > 2.95 && phase < 3.4) ? 0.7 : 0.0;
    const hat = (Math.sin(t * beat * Math.PI * 4) > 0 ? 0.35 : 0.05);
    for (let i=0;i<bins;i++){
      const f = i / bins;
      const lo = Math.exp(-Math.pow((f - 0.05) * 12, 2)) * (kick * 1.0);
      const mid = Math.exp(-Math.pow((f - 0.35) * 10, 2)) * (snare * 0.9);
      const hi = Math.exp(-Math.pow((f - 0.78) * 8, 2)) * (hat * 0.55);
      const floor = 0.10 + 0.06 * Math.sin(t * 0.6 + f * 7) + 0.04 * Math.sin(t * 1.7 - f * 9);
      out[i] = Math.max(0, Math.min(1, lo + mid + hi + floor));
    }
    return out;
  }

  let start = performance.now();
  function frame(now){
    const t = (now - start) / 1000;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    const spec = fakeSpectrum(t, 64);
    let energy = 0; for (let i=0;i<spec.length;i++) energy += spec[i];
    energy = Math.min(1, energy / spec.length * 1.6);

    // soft teal backdrop pulse
    const bg = ctx.createRadialGradient(W/2, H*0.55, 0, W/2, H*0.55, Math.max(W,H)*0.6);
    bg.addColorStop(0, `rgba(${TEAL_RGB.join(',')},${0.05 + energy*0.05})`);
    bg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // particles
    for (const p of particles){
      p.x += p.vx; p.y += p.vy; p.twinkle += 0.018;
      if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
      const a = p.a * (0.6 + 0.4 * Math.sin(p.twinkle));
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      ctx.arc(p.x*W, p.y*H, p.r, 0, Math.PI*2);
      ctx.fill();
    }

    // vinyl + EQ ring (right-side anchored)
    const cx = W * 0.78, cy = H * 0.55;
    const baseR = Math.min(W, H) * 0.32;

    // vinyl
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.5);
    ctx.fillStyle = '#0a0d0e';
    ctx.beginPath(); ctx.arc(0, 0, baseR, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
    for (let i = 0; i < 22; i++){
      ctx.beginPath();
      ctx.arc(0, 0, baseR * (0.35 + i * 0.028), 0, Math.PI*2);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.fillStyle = '#1a2125'; ctx.arc(0,0,baseR*0.30,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.fillStyle = `rgba(${TEAL_RGB.join(',')},0.85)`; ctx.arc(0,0,baseR*0.10,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.fillStyle = '#000'; ctx.arc(0,0,baseR*0.022,0,Math.PI*2); ctx.fill();
    ctx.restore();

    // EQ ring
    const inner = baseR + 22;
    const outer = baseR + 22 + Math.min(W,H) * 0.10;
    const bars = 88;
    const step = (Math.PI*2) / bars;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.6);
    for (let i = 0; i < bars; i++){
      const idx = Math.floor((Math.abs(((i + bars/4) % bars) - bars/2) / (bars/2)) * (spec.length-1));
      const v = spec[idx];
      const len = (outer - inner) * (0.15 + v * 0.95);
      const a = step * i;
      const x1 = Math.cos(a)*inner, y1 = Math.sin(a)*inner;
      const x2 = Math.cos(a)*(inner+len), y2 = Math.sin(a)*(inner+len);
      ctx.strokeStyle = v > 0.55 ? `rgb(${TEAL_RGB.join(',')})` : `rgba(${TEAL_RGB.join(',')},${0.45 + v*0.5})`;
      ctx.lineWidth = (Math.PI*2*inner / bars) * 0.55;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    }
    ctx.restore();

    // tonearm
    ctx.save(); ctx.translate(cx, cy);
    ctx.rotate(-0.55 + Math.sin(t*0.4)*0.012);
    ctx.fillStyle = '#d8dde0';
    ctx.fillRect(-baseR*1.05, -baseR*0.04, baseR*1.45, baseR*0.06);
    ctx.fillStyle = '#bfc5c8';
    ctx.fillRect(baseR*0.30, -baseR*0.07, baseR*0.10, baseR*0.13);
    ctx.beginPath(); ctx.fillStyle = '#9aa1a4';
    ctx.arc(-baseR*1.05, 0, baseR*0.08, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // vignette
    const vg = ctx.createRadialGradient(W/2, H/2, Math.min(W,H)*0.25, W/2, H/2, Math.max(W,H)*0.7);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = vg; ctx.fillRect(0,0,W,H);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
