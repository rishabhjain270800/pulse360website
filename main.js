/**
 * PULSE360 Showcase Website - main.js
 */

document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initCustomCursor();
  initMobileMenu();
  initScrollAnimations();
  initParticleSphere();
  initWaitlistForm();
  initGrainEffect();
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
  const canvas = document.getElementById('sphere-canvas');
  if (!canvas || !window.THREE) return;
  
  const container = canvas.parentElement;
  
  const scene = new THREE.Scene();
  
  // Setup Camera
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
  camera.position.z = 400;
  
  // Setup Renderer
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Create Particles
  const particleCount = 600;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  const colorOrange = new THREE.Color('#F97316');
  const radius = 160;
  
  for (let i = 0; i < particleCount; i++) {
    // Random point on sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    
    colorOrange.toArray(colors, i * 3);
    
    // Base size
    sizes[i] = Math.random() * 2 + 1;
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  // Custom shader for opacity based on Z depth
  const vertexShader = `
    attribute float size;
    attribute vec3 color;
    varying vec3 vColor;
    varying float vOpacity;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
      
      // Calculate opacity based on z position (far is transparent)
      vOpacity = smoothstep(-150.0, 150.0, position.z) * 0.7 + 0.3;
    }
  `;
  
  const fragmentShader = `
    varying vec3 vColor;
    varying float vOpacity;
    void main() {
      // Circular particle
      float r = distance(gl_PointCoord, vec2(0.5, 0.5));
      if(r > 0.5) discard;
      
      // Soft edge
      float alpha = (0.5 - r) * 2.0;
      gl_FragColor = vec4(vColor, alpha * vOpacity);
    }
  `;
  
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false
  });
  
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  
  // Animation Loop
  let baseRotationSpeed = 0.001;
  let targetRotationSpeed = baseRotationSpeed;
  
  // Hover effect to speed up
  container.addEventListener('mouseenter', () => targetRotationSpeed = 0.003);
  container.addEventListener('mouseleave', () => targetRotationSpeed = baseRotationSpeed);
  
  // Stop animation if not in view
  let isVisible = true;
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  });
  observer.observe(container);
  
  // Pause on tab hidden
  document.addEventListener("visibilitychange", () => {
    isVisible = document.visibilityState === "visible";
  });
  
  function animate() {
    requestAnimationFrame(animate);
    
    if (!isVisible) return;
    
    // Smooth lerp speed
    particles.rotation.y += (targetRotationSpeed - (particles.rotation.y - particles.userData.lastY || 0)) * 0.05;
    particles.userData.lastY = particles.rotation.y;
    
    // Add simple continuous rotation
    particles.rotation.y += targetRotationSpeed;
    particles.rotation.x += targetRotationSpeed * 0.5;
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Handle Resize
  window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
}

function initWaitlistForm() {
  const form = document.getElementById('waitlist-form');
  const successMsg = document.getElementById('waitlist-success');
  
  if(!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.style.display = 'none';
    successMsg.classList.remove('hidden');
  });
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
