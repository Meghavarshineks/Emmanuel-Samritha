/* =================================================================
   Emmanuel & Samritha — script.js
   Envelope flap reveal: seal tap → crack → flap folds back → card slides up
   ================================================================= */
document.addEventListener("DOMContentLoaded", () => {

    /* ---- DOM ---- */
    const envScreen    = document.getElementById("env-screen");
    const envFlap      = document.getElementById("env-flap");
    const envInnerCard = document.getElementById("env-inner-card");
    const envSealWrap  = document.getElementById("env-seal-wrap");
    const envHint      = document.getElementById("env-hint");
    const mainContent  = document.getElementById("main-content");
    const musicToggle  = document.getElementById("music-toggle");
    const bgAudio      = document.getElementById("bg-audio");
    const templeRise   = document.getElementById("temple-rise");
    const heroReveal   = document.getElementById("hero-reveal");
    const nameLineE    = document.getElementById("name-line-e");
    const nameLineS    = document.getElementById("name-line-s");

    const EMMANUEL = "Emmanuel";
    const SAMRITHA = "Samritha";

    /* ================================================================
       BUILD LETTER SPANS
    ================================================================ */
    function buildLetters(text, container) {
        container.innerHTML = "";
        [...text].forEach(char => {
            const s = document.createElement("span");
            s.className = "name-letter";
            s.textContent = char === " " ? "\u00A0" : char;
            container.appendChild(s);
        });
    }
    buildLetters(EMMANUEL, nameLineE);
    buildLetters(SAMRITHA, nameLineS);

    /* ================================================================
       ENVELOPE REVEAL
       Phase 1: Tap seal → seal cracks + golden burst
       Phase 2: Envelope zooms out and fades
       Phase 3: Main content fades in
    ================================================================ */
    let opened = false;

    // Seal click — the entire seal-wrap area is the tap target
    envSealWrap.addEventListener("click",    () => startReveal());
    envSealWrap.addEventListener("touchend", e  => { e.preventDefault(); startReveal(); }, { passive: false });

    function startReveal() {
        if (opened) return;
        opened = true;

        /* Hide hint */
        envHint && envHint.classList.add("hide");

        /* Step 1: Seal cracks */
        envSealWrap.classList.add("cracking");

        /* Burst from seal position */
        const r = envSealWrap.getBoundingClientRect();
        fireGoldenBurst(r.left + r.width / 2, r.top + r.height / 2);

        /* Step 2: Zoom and fade the envelope image */
        const envImgContainer = document.getElementById("env-img-container");
        setTimeout(() => {
            envImgContainer && envImgContainer.classList.add("zoom-open");
            envScreen.classList.add("fade-out");
        }, 600);

        /* Step 3: Transition to main website */
        setTimeout(() => {
            envScreen.classList.add("gone");
            mainContent.classList.add("revealed");
            musicToggle.style.display = "flex";
            playMusic();
            initPetals();
            triggerHeroReveal();
        }, 1500);
    }

    /* ================================================================
       HERO REVEAL — letter by letter names
    ================================================================ */
    function triggerHeroReveal() {
        heroReveal.classList.add("active");

        const eLetters = nameLineE.querySelectorAll(".name-letter");
        eLetters.forEach((el, i) => {
            setTimeout(() => el.classList.add("show"), 800 + i * 80);
        });

        const eEnd = 800 + EMMANUEL.length * 80 + 200;
        setTimeout(() => nameLineE.classList.add("shimmer"), eEnd);

        const sStart = eEnd + 600;
        const sLetters = nameLineS.querySelectorAll(".name-letter");
        sLetters.forEach((el, i) => {
            setTimeout(() => el.classList.add("show"), sStart + i * 80);
        });

        const sEnd = sStart + SAMRITHA.length * 80 + 200;
        setTimeout(() => nameLineS.classList.add("shimmer"), sEnd);
    }

    /* ================================================================
       GOLDEN BURST PARTICLES
    ================================================================ */
    const burstCvs = document.getElementById("burst-canvas");
    if (burstCvs) {
        burstCvs.width  = window.innerWidth;
        burstCvs.height = window.innerHeight;
    }

    function fireGoldenBurst(cx, cy) {
        if (!burstCvs) return;
        const ctx = burstCvs.getContext("2d");
        const colors = ["#FFD700","#FFF4A0","#BF953F","#FCF6BA","#FFE566","#FFAA33"];
        const particles = [];

        for (let i = 0; i < 80; i++) {
            const angle = (Math.PI * 2 / 80) * i + (Math.random() - 0.5) * 0.4;
            const speed = Math.random() * 10 + 4;
            particles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 5 + 2,
                life: Math.random() * 45 + 30,
                maxLife: 0,
                color: colors[Math.floor(Math.random() * colors.length)],
                star: Math.random() > 0.5
            });
        }
        particles.forEach(p => p.maxLife = p.life);

        const rings = [
            { r: 0, maxR: 220, alpha: 0.9, spd: 14 },
            { r: 0, maxR: 300, alpha: 0.5, spd: 9  }
        ];

        function loop() {
            ctx.clearRect(0, 0, burstCvs.width, burstCvs.height);
            rings.forEach(ring => {
                if (ring.r < ring.maxR) {
                    ctx.beginPath();
                    ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(255,215,0,${ring.alpha * (1 - ring.r / ring.maxR)})`;
                    ctx.lineWidth = 2.5;
                    ctx.stroke();
                    ring.r += ring.spd;
                }
            });
            let alive = false;
            particles.forEach(p => {
                if (p.life <= 0) return;
                alive = true;
                p.x += p.vx; p.y += p.vy;
                p.vy += 0.2; p.vx *= 0.97; p.life--;
                const a = p.life / p.maxLife;
                ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = p.color;
                if (p.star) {
                    drawStar(ctx, p.x, p.y, 4, p.size, p.size * 0.45);
                } else {
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();
            });
            if (alive || rings.some(r => r.r < r.maxR)) requestAnimationFrame(loop);
            else ctx.clearRect(0, 0, burstCvs.width, burstCvs.height);
        }
        requestAnimationFrame(loop);
    }

    function drawStar(ctx, cx, cy, spikes, outer, inner) {
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;
        ctx.beginPath(); ctx.moveTo(cx, cy - outer);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer); rot += step;
            ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner); rot += step;
        }
        ctx.closePath(); ctx.fill();
    }

    /* ================================================================
       TEMPLE PARALLAX
    ================================================================ */
    function onScroll() {
        if (!templeRise) return;
        const p = Math.min(window.scrollY / window.innerHeight, 1);
        templeRise.style.transform = `translateX(-50%) translateY(${p * -45}px) scale(${1 + p * 0.05})`;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ================================================================
       SCRATCH CARD
    ================================================================ */
    const canvas    = document.getElementById("scratch-canvas");
    const cdGrid    = document.getElementById("countdown-grid");
    const cdTagline = document.getElementById("count-tagline");
    let scratchDone = false;

    if (canvas) {
        const ctx = canvas.getContext("2d");
        let drawing = false;

        function initCanvas() {
            const rect = canvas.getBoundingClientRect();
            canvas.width  = rect.width  || 300;
            canvas.height = rect.height || 88;
            const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            g.addColorStop(0,    "#BF953F");
            g.addColorStop(0.25, "#FCF6BA");
            g.addColorStop(0.5,  "#B38728");
            g.addColorStop(0.75, "#FBF5B7");
            g.addColorStop(1,    "#AA771C");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "rgba(92,29,36,0.2)";
            ctx.lineWidth = 2;
            ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
            ctx.fillStyle = "rgba(92,29,36,0.55)";
            ctx.font = `bold ${Math.max(9, Math.floor(canvas.height * 0.15))}px Montserrat, sans-serif`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("✦  SCRATCH TO REVEAL  ✦", canvas.width / 2, canvas.height / 2);
        }

        function getXY(e) {
            const rect = canvas.getBoundingClientRect();
            const src = e.touches ? e.touches[0] : e;
            return { x: src.clientX - rect.left, y: src.clientY - rect.top };
        }

        function scratchAt(x, y) {
            if (scratchDone) return;
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.fill();
            if (Math.random() < 0.3) checkReveal();
        }

        function checkReveal() {
            const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let cleared = 0;
            for (let i = 3; i < d.length; i += 4) if (d[i] === 0) cleared++;
            if (cleared / (canvas.width * canvas.height) > 0.10) {
                scratchDone = true;
                canvas.classList.add("revealed");
                setTimeout(() => {
                    cdGrid && cdGrid.classList.add("show");
                    cdTagline && cdTagline.classList.add("show");
                }, 650);
            }
        }

        canvas.addEventListener("mousedown",  () => { drawing = true; });
        canvas.addEventListener("mousemove",  e  => { if (drawing) { const p = getXY(e); scratchAt(p.x, p.y); }});
        window.addEventListener("mouseup",    () => { drawing = false; });
        canvas.addEventListener("touchstart", e  => { drawing = true; e.preventDefault(); }, { passive: false });
        canvas.addEventListener("touchmove",  e  => { if (drawing) { const p = getXY(e); scratchAt(p.x, p.y); } e.preventDefault(); }, { passive: false });
        canvas.addEventListener("touchend",   () => { drawing = false; });

        setTimeout(initCanvas, 300);
        window.addEventListener("resize", initCanvas);
    }

    /* ================================================================
       COUNTDOWN
    ================================================================ */
    const target = new Date("August 30, 2026 09:00:00").getTime();
    const cdDays = document.getElementById("cd-days");
    const cdHrs  = document.getElementById("cd-hrs");
    const cdMin  = document.getElementById("cd-min");
    const cdSec  = document.getElementById("cd-sec");
    const pad = n => String(Math.max(0, n)).padStart(2, "0");
    setInterval(() => {
        const diff = target - Date.now();
        if (!cdDays) return;
        if (diff <= 0) { [cdDays,cdHrs,cdMin,cdSec].forEach(el => el && (el.textContent="00")); return; }
        cdDays.textContent = pad(Math.floor(diff / 86400000));
        cdHrs.textContent  = pad(Math.floor((diff % 86400000) / 3600000));
        cdMin.textContent  = pad(Math.floor((diff % 3600000)  / 60000));
        cdSec.textContent  = pad(Math.floor((diff % 60000)    / 1000));
    }, 1000);

    /* ================================================================
       CALENDAR BUTTONS
    ================================================================ */
    document.querySelectorAll(".calendar-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            e.preventDefault();
            const title  = btn.dataset.eventTitle;
            const date   = btn.dataset.eventDate.replace(/-/g, "");
            const time   = btn.dataset.eventTime.replace(":", "") + "00";
            const venue  = btn.dataset.eventVenue;
            const endHr  = String(parseInt(btn.dataset.eventTime.slice(0,2)) + 3).padStart(2,"0");
            const endT   = endHr + btn.dataset.eventTime.slice(3).replace(":","") + "00";
            window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${date}T${time}/${date}T${endT}&location=${encodeURIComponent(venue)}&sf=true&output=xml`, "_blank");
        });
    });

    /* ================================================================
       SCROLL-IN OBSERVER
    ================================================================ */
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
    document.querySelectorAll(".scroll-in").forEach(el => obs.observe(el));

    /* ================================================================
       MUSIC
    ================================================================ */
    if (bgAudio) bgAudio.volume = 0.45;
    function playMusic() {
        if (!bgAudio) return;
        bgAudio.play().then(() => musicToggle && musicToggle.classList.add("playing")).catch(() => {});
    }
    musicToggle && musicToggle.addEventListener("click", () => {
        bgAudio.paused ? playMusic() : (() => { bgAudio.pause(); musicToggle.classList.remove("playing"); })();
    });

    /* ================================================================
       PETAL PARTICLES
    ================================================================ */
    function initPetals() {
        const cvs = document.getElementById("particles-canvas");
        if (!cvs) return;
        const ctx = cvs.getContext("2d");
        let W = cvs.width = window.innerWidth;
        let H = cvs.height = window.innerHeight;
        window.addEventListener("resize", () => { W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; }, { passive: true });

        const cols = ["rgba(229,168,148,0.6)","rgba(198,129,109,0.5)","rgba(253,246,243,0.55)","rgba(240,180,160,0.5)"];

        class Petal {
            constructor(init) {
                this.x = Math.random()*W; this.y = init ? Math.random()*H : -20;
                this.sz = Math.random()*7+4; this.vy = Math.random()*1.1+0.6;
                this.vx = Math.random()*0.5-0.25; this.rot = Math.random()*360;
                this.rs = Math.random()*1.3-0.65; this.osc = Math.random()*0.023+0.007;
                this.oa = Math.random()*Math.PI*2;
                this.col = cols[Math.floor(Math.random()*cols.length)];
            }
            update() {
                this.y+=this.vy; this.oa+=this.osc;
                this.x+=this.vx+Math.sin(this.oa)*0.3; this.rot+=this.rs;
                if(this.y>H+20||this.x<-30||this.x>W+30) Object.assign(this, new Petal(false));
            }
            draw() {
                ctx.save(); ctx.translate(this.x,this.y); ctx.rotate(this.rot*Math.PI/180);
                ctx.fillStyle=this.col; ctx.beginPath();
                ctx.moveTo(0,0);
                ctx.bezierCurveTo(-this.sz,-this.sz/2,-this.sz,this.sz/2,0,this.sz);
                ctx.bezierCurveTo(this.sz,this.sz/2,this.sz,-this.sz/2,0,0);
                ctx.fill(); ctx.restore();
            }
        }
        class Dust {
            constructor(init) {
                this.x=Math.random()*W; this.y=init?Math.random()*H:-10;
                this.r=Math.random()*1.3+0.3; this.vy=Math.random()*0.5+0.25;
                this.vx=Math.random()*0.25-0.12; this.op=Math.random()*0.4+0.15;
            }
            update() {
                this.y+=this.vy; this.x+=this.vx;
                if(this.y>H+10) Object.assign(this, new Dust(false));
            }
            draw() {
                ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
                ctx.fillStyle=`rgba(212,175,55,${this.op})`; ctx.fill();
            }
        }

        const items = [
            ...Array.from({length:28}, () => new Petal(true)),
            ...Array.from({length:18}, () => new Dust(true))
        ];

        (function loop() {
            ctx.clearRect(0,0,W,H);
            items.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(loop);
        })();
    }

});
