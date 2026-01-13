// Footer year
document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Highlight active nav link
  const path = (location.pathname || "/").toLowerCase();
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if ((path === "/" && (href === "/" || href.includes("index"))) || (href && path.includes(href.replace(".html","")))) {
      a.style.color = "var(--text)";
      a.style.borderColor = "rgba(255,255,255,0.14)";
      a.style.background = "rgba(255,255,255,0.06)";
    }
  });
});


// ===== HERO IMAGE ROTATOR (Home only) =====
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero-media");
  const title = document.getElementById("heroTitle");
  const sub = document.getElementById("heroSub");
  const badge = document.getElementById("heroBadge");

  // Only run on pages that have hero slider elements
  if (!hero || !title || !sub || !badge) return;

  // Respect reduced motion
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const slides = [
    {
      img: "/assets/img/hero-home.jpg",
      badge: "ASIANLOOP",
      title: "Asia’s next-generation calibration facility",
      sub: "High-pressure gas & liquid calibration services aligned to global standards."
    },
    {
      img: "/assets/img/facility-gas-calibration.jpg",
      badge: "GAS CALIBRATION",
      title: "High-pressure gas calibration capability",
      sub: "Designed for custody-transfer confidence — stable, repeatable, audit-ready."
    },
    {
      img: "/assets/img/liquid-calibration-skid.jpg",
      badge: "LIQUID CALIBRATION",
      title: "High-precision liquid calibration skids",
      sub: "Modern metrology systems supporting accuracy, compliance and efficiency."
    },
    {
      img: "/assets/img/hero-credentials.jpg",
      badge: "CREDENTIALS",
      title: "Quality system built around global standards",
      sub: "Compliance and traceability mindset supporting ISO/IEC 17025 expectations."
    }
  ];

  let i = 0;

  // Set initial background
  hero.style.backgroundImage = `url('${slides[0].img}')`;

  function applySlide(nextIndex) {
    const next = slides[nextIndex];

    // Preload next image
    const im = new Image();
    im.src = next.img;

    // Use CSS var for the fade layer
    hero.style.setProperty("--hero-next", `url('${next.img}')`);
    hero.classList.add("is-fading");

    // After fade completes, swap base background + update text
    window.setTimeout(() => {
      hero.style.backgroundImage = `url('${next.img}')`;
      hero.classList.remove("is-fading");

      badge.textContent = next.badge;
      title.textContent = next.title;
      sub.textContent = next.sub;
    }, 900);
  }

  // Rotate every 6 seconds
  window.setInterval(() => {
    i = (i + 1) % slides.length;
    applySlide(i);
  }, 6000);
});


/* ===== Maintenance Image Slider (with captions) ===== */
(function () {
  const slider = document.querySelector('.maintenance-slider');
  const textEl = document.getElementById('maintenanceText');
  if (!slider || !textEl) return;

  const slides = [
    {
      img: '/assets/img/placeholder-maintenance.jpg',
      text: 'Precision maintenance by OEM-trained specialists'
    },
    {
      img: '/assets/img/placeholder-maintenance2.jpg',
      text: 'Extending asset life through certified upgrades'
    },
    {
      img: '/assets/img/placeholder-maintenance3.jpg',
      text: 'Minimising downtime with on-site technical expertise'
    }
  ];

  let current = 0;
slider.style.backgroundImage = `url(${slides[current].img})`;
  textEl.textContent = slides[current].text;

  setInterval(() => {
    const next = (current + 1) % slides.length;

    /* fade text out */
    textEl.classList.add('is-fading');

    /* prepare next image */
    slider.style.setProperty('--maint-next', `url(${slides[next].img})`);
    slider.classList.add('is-fading');

    setTimeout(() => {
      slider.style.backgroundImage = `url(${slides[next].img})`;
      textEl.textContent = slides[next].text;

      slider.classList.remove('is-fading');
      textEl.classList.remove('is-fading');

      current = next;
    }, 900);

  }, 4000);
})();

/* ===== MoU Logo Slider (AsianLoop x EuroLoop) ===== */
(function () {
  const slider = document.querySelector('.mou-logo-slider');
  const textEl = document.getElementById('mouText');
  if (!slider || !textEl) return;

const slides = [
  {
    img: '/assets/img/placeholder-mou.jpg',
    text: 'Formal MoU and technical agreement underpinning the collaboration'
  },
  {
    img: '/assets/img/logo.png',
    text: 'AsianLoop – advancing precision measurement capability in the region'
  },
  {
    img: '/assets/img/eurolooplogo.png',
    text: 'EuroLoop – global benchmark expertise supporting local calibration excellence'
  }
];


  let current = 0;
  slider.style.backgroundImage = `url(${slides[current].img})`;
  textEl.textContent = slides[current].text;

  setInterval(() => {
    const next = (current + 1) % slides.length;

    textEl.classList.add('is-fading');
    slider.style.setProperty('--mou-next', `url(${slides[next].img})`);
    slider.classList.add('is-fading');

    setTimeout(() => {
      slider.style.backgroundImage = `url(${slides[next].img})`;
      textEl.textContent = slides[next].text;

      slider.classList.remove('is-fading');
      textEl.classList.remove('is-fading');
      current = next;
    }, 900);

  }, 4000);
})();
