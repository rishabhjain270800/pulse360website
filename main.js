/**
 * PULSE360 Showcase Website - main.js
 */

document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initCustomCursor();
  initMobileMenu();
  
  // Initialize in DOM order to prevent ScrollTrigger overlaps
  // 1. Hero (inside initScrollAnimations)
  // 2. Ecosystem (initParticleSphere)
  // 3. Modules (inside initScrollAnimations)
  // We will let them initialize, then force a refresh and sort.
  initScrollAnimations();
  initParticleSphere();
  
  initContactForm();
  initGrainEffect();

  // Force ScrollTrigger to sort based on DOM order and recalculate all pin spacers
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }
});

function initLenis() {
  if (typeof Lenis === 'undefined') return;
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  // We will ONLY use GSAP ticker for Lenis RAF to avoid double-ticking

  // Integrate Lenis with GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time)=>{
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0, 0);
  }
}

function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  
  // If touch device, hide cursor
  if (window.matchMedia('(pointer: coarse)').matches) {
    dot.style.display = 'none';
    ring.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });
  
  // Smooth follow for the ring
  function render() {
    ringX += (mouseX - ringX) * 0.2;
    ringY += (mouseY - ringY) * 0.2;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
  
  // Hover effects on interactive elements
  const interactives = document.querySelectorAll('a, button, input');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '48px';
      ring.style.height = '48px';
      ring.style.backgroundColor = 'rgba(249, 115, 22, 0.15)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = '32px';
      ring.style.height = '32px';
      ring.style.backgroundColor = 'transparent';
    });
  });
}

function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const panel = document.querySelector('.mobile-menu-panel');
  const links = panel.querySelectorAll('a');
  
  let isOpen = false;
  
  function toggleMenu() {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      panel.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  
  btn.addEventListener('click', toggleMenu);
  links.forEach(link => {
    link.addEventListener('click', () => {
      if(isOpen) toggleMenu();
    });
  });
}

function initScrollAnimations() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Scene 1: Hero Intro (Page Load)
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  
  heroTl.to('.hero-product-mockup', {
    opacity: 1,
    scale: 1,
    rotationX: 0,
    duration: 1.5,
    ease: 'power4.out'
  }, 0.2);

  heroTl.to('.hero-text-anim', {
    opacity: 1,
    y: 0,
    duration: 1,
    stagger: 0.1
  }, 0.5);

  // Scene 2: Product Focus (Pinning Hero)
  ScrollTrigger.create({
    trigger: '#home',
    start: 'top top',
    end: '+=1500',
    pin: true,
    scrub: 1,
    animation: gsap.timeline()
      .to('.hero-product-mockup', {
        scale: 1.2,
        rotationY: 15,
        rotationZ: -5,
        yPercent: -10
      })
      .to('.hero-content, .scroll-indicator', {
        opacity: 0,
        y: -50
      }, 0)
  });

  // 1. Generic Fade Ups
  const fadeElements = document.querySelectorAll('.fade-up');
  fadeElements.forEach(el => {
    gsap.to(el, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Scene 2 & 3: Cinematic Pinned Modules
  const modules = document.querySelectorAll('.module-section');
  modules.forEach((mod, index) => {
    const features = mod.querySelectorAll('.feature-item');
    const card = mod.querySelector('.floating-card');

    if (!features.length || !card) return;

    gsap.set(features, { opacity: 0.2, x: -20 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: mod,
        start: 'center center',
        end: '+=2000',
        pin: true,
        scrub: 1,
      }
    });

    // Feature revealing & product card manipulation
    features.forEach((feature, i) => {
      tl.to(card, {
        scale: 1 + (i * 0.05),
        rotationY: (i % 2 === 0 ? 10 : -10),
        duration: 1,
        ease: 'power2.inOut'
      }, i * 1.5);

      tl.to(feature, {
        opacity: 1,
        x: 0,
        color: '#F97316',
        duration: 0.5,
      }, i * 1.5);
      
      if (i > 0) {
        tl.to(features[i - 1], {
          opacity: 0.5,
          color: 'var(--text-secondary)',
          duration: 0.5
        }, i * 1.5);
      }
    });
    
    // Add small pause at end of pinned section
    tl.to({}, { duration: 1 });
  });

  // Metrics Counter Animation
  const metricNumbers = document.querySelectorAll('.metric-number');
  metricNumbers.forEach(el => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const isDecimal = el.dataset.decimal === 'true';
    
    let obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      onUpdate: () => {
        el.innerText = (isDecimal ? obj.val.toFixed(1) : Math.floor(obj.val)) + suffix;
      }
    });
  });
}

function initParticleSphere() {
  const canvas = document.getElementById("ecosystem-canvas");
  if(!canvas) return;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
  );

  camera.position.z = 250;

  const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha:true,
      antialias:true
  });

  renderer.setSize(
      window.innerWidth,
      window.innerHeight
  );

  renderer.setPixelRatio(
      Math.min(window.devicePixelRatio,2)
  );

  window.addEventListener("resize",()=>{
      camera.aspect= window.innerWidth/ window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const particleCount = 5000;
  const fragmentedPositions = new Float32Array(particleCount*3);
  const unifiedPositions = new Float32Array(particleCount*3);
  const currentPositions = new Float32Array(particleCount*3);

  function spherePoint(radius, offsetX=0, offsetY=0, offsetZ=0) {
      const u=Math.random();
      const v=Math.random();
      const theta= u*Math.PI*2;
      const phi= Math.acos(2*v-1);
      const r= Math.cbrt(Math.random())*radius;

      return {
          x: offsetX+ r*Math.sin(phi)*Math.cos(theta),
          y: offsetY+ r*Math.sin(phi)*Math.sin(theta),
          z: offsetZ+ r*Math.cos(phi)
      };
  }

  const clusters=[
      {x:-180,y:120,z:0},
      {x:180,y:120,z:0},
      {x:-150,y:-120,z:0},
      {x:150,y:-120,z:0},
      {x:0,y:0,z:100}
  ];

  for(let i=0;i<particleCount;i++){
      const i3=i*3;
      const cluster= clusters[Math.floor(Math.random()*clusters.length)];
      const frag= spherePoint(40, cluster.x, cluster.y, cluster.z);

      fragmentedPositions[i3]=frag.x;
      fragmentedPositions[i3+1]=frag.y;
      fragmentedPositions[i3+2]=frag.z;

      const unified= spherePoint(110, 0, 0, 0);

      unifiedPositions[i3]=unified.x;
      unifiedPositions[i3+1]=unified.y;
      unifiedPositions[i3+2]=unified.z;

      currentPositions[i3]=frag.x;
      currentPositions[i3+1]=frag.y;
      currentPositions[i3+2]=frag.z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(currentPositions, 3));

  const particleCanvas = document.createElement("canvas");
  particleCanvas.width=32;
  particleCanvas.height=32;
  const ctx= particleCanvas.getContext("2d");
  const gradient= ctx.createRadialGradient(16,16,0, 16,16,16);
  gradient.addColorStop(0, "rgba(255,107,0,1)");
  gradient.addColorStop(1, "rgba(255,107,0,0)");
  ctx.fillStyle=gradient;
  ctx.fillRect(0,0,32,32);
  const texture = new THREE.CanvasTexture(particleCanvas);

  const material = new THREE.PointsMaterial({
      size:2.8,
      map:texture,
      transparent:true,
      depthWrite:false,
      color:0xff6b00
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const morphState={ progress:0 };

  ScrollTrigger.create({
      trigger:".ecosystem-section",
      start:"top top",
      end:"+=200%",
      pin:true,
      scrub:1,
      onUpdate:(self)=>{
          morphState.progress= self.progress;
          gsap.to(".ecosystem-title", {
              opacity: self.progress>0.7 ?1 :0,
              duration:0.2
          });
      }
  });

  const clock = new THREE.Clock();

  function animate(){
      requestAnimationFrame(animate);
      const elapsed= clock.getElapsedTime();
      const pos= geometry.attributes.position.array;
      const p= morphState.progress;

      for(let i=0;i<particleCount;i++){
          const i3=i*3;
          const noise= Math.sin(elapsed*2+i)*1.5;

          pos[i3]= fragmentedPositions[i3] + (unifiedPositions[i3] - fragmentedPositions[i3])*p + noise;
          pos[i3+1]= fragmentedPositions[i3+1] + (unifiedPositions[i3+1] - fragmentedPositions[i3+1])*p + noise;
          pos[i3+2]= fragmentedPositions[i3+2] + (unifiedPositions[i3+2] - fragmentedPositions[i3+2])*p;
      }
      geometry.attributes.position.needsUpdate=true;
      particles.rotation.y= elapsed*0.1;
      particles.rotation.x= elapsed*0.05;
      const scale= 1+(p*0.2);
      particles.scale.set(scale, scale, scale);
      renderer.render(scene, camera);
  }
  animate();
}

function initContactForm() {
  // Multi-Select Logic
  const multiSelect = document.getElementById('product-select');
  const selectDropdown = document.querySelector('.select-dropdown');
  const selectedPills = document.getElementById('selected-pills');
  const checkboxes = document.querySelectorAll('.dropdown-item input[type="checkbox"]');
  
  if(multiSelect) {
    multiSelect.addEventListener('click', (e) => {
      if(e.target.closest('.pill-remove') || e.target.type === 'checkbox') return;
      multiSelect.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if(!multiSelect.contains(e.target)) {
        multiSelect.classList.remove('active');
      }
    });

    checkboxes.forEach(cb => {
      cb.addEventListener('change', updatePills);
    });

    function updatePills() {
      selectedPills.innerHTML = '';
      let selectedCount = 0;
      checkboxes.forEach(cb => {
        if(cb.checked) {
          selectedCount++;
          const pill = document.createElement('div');
          pill.className = 'pill';
          pill.innerHTML = `${cb.value} <span class="pill-remove" data-val="${cb.value}">&times;</span>`;
          selectedPills.appendChild(pill);
        }
      });
      
      if(selectedCount === 0) {
        selectedPills.innerHTML = '<span class="placeholder">Choose modules...</span>';
      }

      // Handle pill removal
      document.querySelectorAll('.pill-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const val = e.target.getAttribute('data-val');
          const checkbox = Array.from(checkboxes).find(c => c.value === val);
          if(checkbox) {
            checkbox.checked = false;
            updatePills();
          }
        });
      });
    }
  }

  // Modal Logic
  const bookBtn = document.getElementById('book-demo-btn');
  const modal = document.getElementById('demo-modal');
  const closeBtn = document.getElementById('close-demo');
  const confirmBtn = document.getElementById('confirm-booking-btn');

  if(bookBtn && modal) {
    bookBtn.addEventListener('click', () => {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    });

    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if(e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    // Initialize Flatpickr
    const dp = document.getElementById('datetime-picker');
    if(dp && window.flatpickr) {
      window.flatpickr(dp, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minDate: "today",
      });
    }

    confirmBtn.addEventListener('click', () => {
      if(dp.value) {
        confirmBtn.innerHTML = "Booking Confirmed!";
        confirmBtn.style.background = "#10B981"; // Success green
        setTimeout(() => {
          modal.classList.remove('active');
          document.body.style.overflow = '';
          confirmBtn.innerHTML = "Confirm Booking";
          confirmBtn.style.background = "";
          dp.value = '';
        }, 1500);
      } else {
        alert("Please select a date and time.");
      }
    });
  }

  // Form Submission
  const salesForm = document.getElementById('sales-form');
  const submitBtn = document.querySelector('.submit-btn');
  if(salesForm) {
    salesForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = "Sending...";
      setTimeout(() => {
        submitBtn.innerHTML = "Inquiry Sent!";
        submitBtn.style.background = "#10B981";
        setTimeout(() => {
          salesForm.reset();
          checkboxes.forEach(cb => cb.checked = false);
          if(typeof updatePills === 'function') updatePills();
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = "";
        }, 2000);
      }, 1000);
    });
  }
}

function initGrainEffect() {
  const canvas = document.getElementById('grain-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  let noiseData = [];
  let frame = 0;
  
  // Create a few frames of noise to loop through
  const createNoise = () => {
    const idata = ctx.createImageData(w, h);
    const buffer32 = new Uint32Array(idata.data.buffer);
    const len = buffer32.length;
    for (let i = 0; i < len; i++) {
      if (Math.random() < 0.5) {
        buffer32[i] = 0xff000000; // black
      } else {
        buffer32[i] = 0xffffffff; // white
      }
    }
    noiseData.push(idata);
  };

  // Generate 4 frames of noise for performance rather than per-frame random
  for(let i=0; i<4; i++) createNoise();

  function loop() {
    ctx.putImageData(noiseData[frame], 0, 0);
    frame = (frame + 1) % noiseData.length;
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    noiseData = [];
    for(let i=0; i<4; i++) createNoise();
  });

  loop();
}
