/* =================================================================
   Emmanuel & Samritha Wedding — JavaScript
   ================================================================= */
document.addEventListener("DOMContentLoaded", () => {

    /* ---- DOM ---- */
    const overlay      = document.getElementById("envelope-overlay");
    const seal         = document.getElementById("wax-seal");
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
       1. LOCK SCROLL
    ================================================================ */
    document.body.classList.add("lock-scroll");

    /* ================================================================
       2. BUILD LETTER SPANS for names
    ================================================================ */
    function buildLetterSpans(text, container) {
        container.innerHTML = "";
        [...text].forEach((char, i) => {
            const span = document.createElement("span");
            span.className = "name-letter";
            span.textContent = char === " " ? "\u00A0" : char;
            span.style.transitionDelay = `${i * 0.07}s`;
            container.appendChild(span);
        });
    }

    buildLetterSpans(EMMANUEL, nameLineE);
    buildLetterSpans(SAMRITHA, nameLineS);

    /* ================================================================
       3. SEAL CLICK → one-time envelope open
    ================================================================ */
    let opened = false;

    seal.addEventListener("click", openEnvelope);
    seal.addEventListener("touchend", (e) => {
        e.preventDefault();
        openEnvelope();
    });

    function openEnvelope() {
        if (opened) return;
        opened = true;

        /* crack seal */
        seal.classList.add("cracking");

        setTimeout(() => {
            /* slide envelope off screen */
            overlay.classList.add("slide-away");

            /* after slide-away transition, remove from layout entirely */
            overlay.addEventListener("transitionend", () => {
                overlay.classList.add("gone");
            }, { once: true });

            /* unlock scrolling */
            document.body.classList.remove("lock-scroll");

            /* show music button */
            musicToggle.style.display = "flex";
            playMusic();

            /* start particles */
            initPetals();

            /* ---- CINEMATIC REVEAL ---- */
            /* 1) show frosted card */
            heroReveal.classList.add("active");

            /* 2) letter-by-letter: Emmanuel */
            const eLetters = nameLineE.querySelectorAll(".name-letter");
            eLetters.forEach((el, i) => {
                setTimeout(() => el.classList.add("show"), 1000 + i * 80);
            });

            /* 3) shimmer after Emmanuel finishes */
            const eDelay = 1000 + EMMANUEL.length * 80 + 200;
            setTimeout(() => nameLineE.classList.add("shimmer"), eDelay);

            /* 4) letter-by-letter: Samritha (starts after "weds" fades in) */
            const sStart = eDelay + 700;
            const sLetters = nameLineS.querySelectorAll(".name-letter");
            sLetters.forEach((el, i) => {
                setTimeout(() => el.classList.add("show"), sStart + i * 80);
            });

            /* 5) shimmer on Samritha */
            const sDelay = sStart + SAMRITHA.length * 80 + 200;
            setTimeout(() => nameLineS.classList.add("shimmer"), sDelay);

        }, 750); // wait for seal crack
    }

    /* ================================================================
       4. TEMPLE PARALLAX RISE ON SCROLL (Video-4 style)
         Temple starts peeking at bottom, rises and zooms as user scrolls
    ================================================================ */
    function onScroll() {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;

        /* Temple rise: progress 0 → 1 over the hero viewport height */
        const progress = Math.min(scrollY / vh, 1);

        /* Moves from -8% at top to +45% as user scrolls past hero */
        const riseBottom = -8 + progress * 53;

        /* Slight scale zoom */
        const scale = 1 + progress * 0.10;

        if (templeRise) {
            templeRise.style.bottom    = `${riseBottom}%`;
            templeRise.style.transform = `translateX(-50%) scale(${scale})`;
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once on load

    /* ================================================================
       5. SCRATCH CARD  (Easy — big brush, 10% threshold)
    ================================================================ */
    const canvas    = document.getElementById("scratch-canvas");
    const cdGrid    = document.getElementById("countdown-grid");
    const cdTagline = document.getElementById("count-tagline");
    let scratchDone = false;

    if (canvas) {
        const ctx = canvas.getContext("2d");
        let drawing = false;
        let totalPixels = 0;

        function initCanvas() {
            const rect   = canvas.getBoundingClientRect();
            canvas.width  = rect.width  || 300;
            canvas.height = rect.height || 88;
            totalPixels   = canvas.width * canvas.height;
            drawGold(ctx, canvas.width, canvas.height);
        }

        function drawGold(ctx, w, h) {
            const g = ctx.createLinearGradient(0, 0, w, h);
            g.addColorStop(0,    "#BF953F");
            g.addColorStop(0.25, "#FCF6BA");
            g.addColorStop(0.5,  "#B38728");
            g.addColorStop(0.75, "#FBF5B7");
            g.addColorStop(1,    "#AA771C");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = "rgba(92,29,36,0.2)";
            ctx.lineWidth = 2;
            ctx.strokeRect(5, 5, w - 10, h - 10);

            ctx.fillStyle = "rgba(92,29,36,0.55)";
            const fs = Math.max(9, Math.floor(h * 0.15));
            ctx.font = `bold ${fs}px Montserrat, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("✦  SCRATCH TO REVEAL  ✦", w / 2, h / 2);
        }

        function getXY(e) {
            const rect = canvas.getBoundingClientRect();
            const src  = e.touches ? e.touches[0] : e;
            return { x: src.clientX - rect.left, y: src.clientY - rect.top };
        }

        function scratchAt(x, y) {
            if (scratchDone) return;
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.arc(x, y, 28, 0, Math.PI * 2); // big brush = easy 2-swipe reveal
            ctx.fill();
            if (Math.random() < 0.3) checkReveal();
        }

        function checkReveal() {
            const data    = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let cleared = 0;
            for (let i = 3; i < data.length; i += 4) {
                if (data[i] === 0) cleared++;
            }
            if (cleared / totalPixels > 0.10) revealDate();
        }

        function revealDate() {
            scratchDone = true;
            canvas.classList.add("revealed");
            setTimeout(() => {
                if (cdGrid)    cdGrid.classList.add("show");
                if (cdTagline) cdTagline.classList.add("show");
            }, 650);
        }

        canvas.addEventListener("mousedown",  ()  => { drawing = true; });
        canvas.addEventListener("mousemove",  (e) => { if (drawing) { const p = getXY(e); scratchAt(p.x, p.y); } });
        window.addEventListener("mouseup",    ()  => { drawing = false; });
        canvas.addEventListener("touchstart", (e) => { drawing = true; e.preventDefault(); }, { passive: false });
        canvas.addEventListener("touchmove",  (e) => { if (drawing) { const p = getXY(e); scratchAt(p.x, p.y); } e.preventDefault(); }, { passive: false });
        canvas.addEventListener("touchend",   ()  => { drawing = false; });

        // Delay init so browser has rendered layout
        setTimeout(initCanvas, 300);
        window.addEventListener("resize", initCanvas);
    }

    /* ================================================================
       6. LIVE COUNTDOWN
    ================================================================ */
    const targetDate = new Date("August 30, 2026 09:00:00").getTime();
    const cdDays = document.getElementById("cd-days");
    const cdHrs  = document.getElementById("cd-hrs");
    const cdMin  = document.getElementById("cd-min");
    const cdSec  = document.getElementById("cd-sec");

    function pad(n) { return String(Math.max(0, n)).padStart(2, "0"); }

    setInterval(() => {
        const diff = targetDate - Date.now();
        if (!cdDays) return;
        if (diff <= 0) {
            [cdDays, cdHrs, cdMin, cdSec].forEach(el => el && (el.textContent = "00"));
            return;
        }
        cdDays.textContent = pad(Math.floor(diff / 86400000));
        cdHrs.textContent  = pad(Math.floor((diff % 86400000) / 3600000));
        cdMin.textContent  = pad(Math.floor((diff % 3600000)  / 60000));
        cdSec.textContent  = pad(Math.floor((diff % 60000)    / 1000));
    }, 1000);

    /* ================================================================
       7. CALENDAR BUTTONS
    ================================================================ */
    document.querySelectorAll(".calendar-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            e.preventDefault();
            const title   = btn.dataset.eventTitle;
            const date    = btn.dataset.eventDate.replace(/-/g, "");
            const time    = btn.dataset.eventTime.replace(":", "") + "00";
            const venue   = btn.dataset.eventVenue;
            const endHr   = String(parseInt(btn.dataset.eventTime.slice(0, 2)) + 3).padStart(2, "0");
            const endTime = endHr + btn.dataset.eventTime.slice(3).replace(":", "") + "00";
            window.open(
                `https://calendar.google.com/calendar/render?action=TEMPLATE` +
                `&text=${encodeURIComponent(title)}` +
                `&dates=${date}T${time}/${date}T${endTime}` +
                `&location=${encodeURIComponent(venue)}` +
                `&sf=true&output=xml`,
                "_blank"
            );
        });
    });

    /* ================================================================
       8. SCROLL-IN OBSERVER
    ================================================================ */
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });

    document.querySelectorAll(".scroll-in").forEach(el => observer.observe(el));

    /* ================================================================
       9. MUSIC
    ================================================================ */
    if (bgAudio) bgAudio.volume = 0.45;

    function playMusic() {
        if (!bgAudio) return;
        bgAudio.play()
            .then(() => musicToggle && musicToggle.classList.add("playing"))
            .catch(() => {});
    }

    musicToggle && musicToggle.addEventListener("click", () => {
        bgAudio.paused ? playMusic() : (() => { bgAudio.pause(); musicToggle.classList.remove("playing"); })();
    });

    /* ================================================================
       10. ROSE PETAL PARTICLES
    ================================================================ */
    function initPetals() {
        const cvs = document.getElementById("particles-canvas");
        if (!cvs) return;
        const ctx = cvs.getContext("2d");
        let W = cvs.width = window.innerWidth;
        let H = cvs.height = window.innerHeight;
        window.addEventListener("resize", () => { W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; }, { passive: true });

        const petalColors = [
            "rgba(229,168,148,0.6)", "rgba(198,129,109,0.5)",
            "rgba(253,246,243,0.55)", "rgba(240,180,160,0.5)"
        ];

        class Petal {
            constructor(init) {
                this.x   = Math.random() * W;
                this.y   = init ? Math.random() * H : -20;
                this.sz  = Math.random() * 7 + 4;
                this.vy  = Math.random() * 1.1 + 0.6;
                this.vx  = Math.random() * 0.5 - 0.25;
                this.rot = Math.random() * 360;
                this.rs  = Math.random() * 1.3 - 0.65;
                this.osc = Math.random() * 0.023 + 0.007;
                this.oa  = Math.random() * Math.PI * 2;
                this.col = petalColors[Math.floor(Math.random() * petalColors.length)];
            }
            update() {
                this.y += this.vy; this.oa += this.osc;
                this.x += this.vx + Math.sin(this.oa) * 0.3;
                this.rot += this.rs;
                if (this.y > H + 20 || this.x < -30 || this.x > W + 30) {
                    Object.assign(this, new Petal(false));
                }
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rot * Math.PI / 180);
                ctx.fillStyle = this.col;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-this.sz, -this.sz/2, -this.sz, this.sz/2, 0, this.sz);
                ctx.bezierCurveTo( this.sz,  this.sz/2,  this.sz,-this.sz/2, 0, 0);
                ctx.fill();
                ctx.restore();
            }
        }

        class Dust {
            constructor(init) {
                this.x  = Math.random() * W;
                this.y  = init ? Math.random() * H : -10;
                this.r  = Math.random() * 1.3 + 0.3;
                this.vy = Math.random() * 0.5 + 0.25;
                this.vx = Math.random() * 0.25 - 0.12;
                this.op = Math.random() * 0.4 + 0.15;
            }
            update() {
                this.y += this.vy; this.x += this.vx;
                if (this.y > H + 10) Object.assign(this, new Dust(false));
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(212,175,55,${this.op})`;
                ctx.fill();
            }
        }

        const items = [
            ...Array.from({ length: 28 }, () => new Petal(true)),
            ...Array.from({ length: 18 }, () => new Dust(true))
        ];

        (function loop() {
            ctx.clearRect(0, 0, W, H);
            items.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(loop);
        })();
    }

});
