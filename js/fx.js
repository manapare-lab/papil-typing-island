/* パーティクル・コンボ文字・画面の揺れ */
(function (global) {
  const Fx = {
    canvas: null,
    ctx: null,
    parts: [],
    shakes: 0,
    running: false,
    floats: [],

    mount(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.resize();
      window.addEventListener("resize", () => this.resize());
      if (!this.running) {
        this.running = true;
        const loop = () => {
          this.draw();
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      }
    },

    resize() {
      if (!this.canvas) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = innerWidth * dpr;
      this.canvas.height = innerHeight * dpr;
      this.canvas.style.width = innerWidth + "px";
      this.canvas.style.height = innerHeight + "px";
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    burst(x, y, color, n) {
      const c = color || "#ffe566";
      const count = n || 18;
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const sp = 2 + Math.random() * 5;
        this.parts.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 1.5,
          life: 1,
          decay: 0.016 + Math.random() * 0.02,
          r: 2 + Math.random() * 3.5,
          color: c,
          star: Math.random() < 0.45,
        });
      }
    },

    spark(x, y) {
      this.burst(x, y, ["#fff1a8", "#7cf0ff", "#ff9ed8", "#b8ff8a"][(Math.random() * 4) | 0], 10);
    },

    confetti() {
      for (let i = 0; i < 80; i++) {
        this.parts.push({
          x: Math.random() * innerWidth,
          y: -20 - Math.random() * 80,
          vx: Math.random() * 2 - 1,
          vy: 2 + Math.random() * 3,
          life: 1.4,
          decay: 0.006 + Math.random() * 0.006,
          r: 3 + Math.random() * 4,
          color: ["#ff6b9d", "#ffd93d", "#6dd36d", "#4ec3ff", "#c084fc", "#ffb347"][i % 6],
          star: i % 3 === 0,
        });
      }
    },

    shake(n) {
      this.shakes = Math.max(this.shakes, n || 8);
    },

    floatText(text, x, y, color) {
      this.floats.push({ text, x, y, life: 1, color: color || "#fff6b0" });
    },

    draw() {
      if (!this.ctx) return;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, innerWidth, innerHeight);

      if (this.shakes > 0) {
        const el = document.getElementById("app");
        const dx = (Math.random() - 0.5) * this.shakes * 0.7;
        const dy = (Math.random() - 0.5) * this.shakes * 0.7;
        if (el) el.style.transform = `translate(${dx}px, ${dy}px)`;
        this.shakes--;
        if (this.shakes <= 0 && el) el.style.transform = "";
      }

      for (let i = this.parts.length - 1; i >= 0; i--) {
        const p = this.parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.life -= p.decay;
        if (p.life <= 0) {
          this.parts.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        if (p.star) {
          this.starPath(ctx, p.x, p.y, p.r, p.r * 0.45);
          ctx.fill();
        } else {
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (let i = this.floats.length - 1; i >= 0; i--) {
        const f = this.floats[i];
        f.y -= 0.8;
        f.life -= 0.018;
        if (f.life <= 0) {
          this.floats.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, f.life);
        ctx.fillStyle = f.color;
        ctx.font = "800 28px 'Hiragino Maru Gothic ProN', 'Hiragino Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.strokeStyle = "rgba(40,20,70,0.45)";
        ctx.lineWidth = 6;
        ctx.strokeText(f.text, f.x, f.y);
        ctx.fillText(f.text, f.x, f.y);
      }
      ctx.globalAlpha = 1;
    },

    starPath(ctx, x, y, r, ir) {
      ctx.moveTo(x, y - r);
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        const b = a + Math.PI / 5;
        ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        ctx.lineTo(x + Math.cos(b) * ir, y + Math.sin(b) * ir);
      }
      ctx.closePath();
    },
  };

  global.Fx = Fx;
})(window);
