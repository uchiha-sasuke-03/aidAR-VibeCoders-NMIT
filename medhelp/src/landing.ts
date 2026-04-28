import { animate, createTimeline, stagger, spring, createDrawable, createMotionPath, morphTo, onScroll, createScope, random } from 'animejs';

// ── EDITORIAL BACKGROUND ─────────────────────
function initEditorialBackground() {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = [
    'position:fixed', 'inset:0', 'pointer-events:none',
    'z-index:0', 'overflow:hidden', 'opacity:0.035'
  ].join(';');
  document.body.appendChild(wrapper);

  // Subtle drifting horizontal rule lines — like a premium editorial grid
  const lineCount = 18;
  const lines: HTMLDivElement[] = [];
  for (let i = 0; i < lineCount; i++) {
    const line = document.createElement('div');
    const startY = (i / lineCount) * 120 - 10;
    line.style.cssText = [
      'position:absolute', 'left:-10%', 'right:-10%',
      `top:${startY}vh`, 'height:1px',
      'background:currentColor'
    ].join(';');
    wrapper.appendChild(line);
    lines.push(line);

    animate(line, {
      translateY: [`0px`, `${(Math.random() - 0.5) * 60}px`],
      opacity: [0.4, 1],
      duration: 12000 + Math.random() * 8000,
      ease: 'inOut(2)',
      loop: true,
      direction: 'alternate',
      delay: Math.random() * 4000
    });
  }

  // Parallax effect on mousemove for lines
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 15;
    const y = (e.clientY / window.innerHeight - 0.5) * 15;
    lines.forEach((line, i) => {
      line.style.transform = `translate(${x * (i%3+1)}px, ${y * (i%3+1)}px)`;
    });
  });

  // Slow vertical drift of two large typographic watermarks
  const marks = ['M', 'H'];
  marks.forEach((char, idx) => {
    const el = document.createElement('div');
    el.textContent = char;
    el.style.cssText = [
      'position:absolute',
      `${idx === 0 ? 'left:-8vw' : 'right:-8vw'}`,
      'top:10vh',
      'font-family:Playfair Display,Georgia,serif',
      'font-size:60vw',
      'font-weight:700',
      'line-height:1',
      'color:currentColor',
      'opacity:0.035',
      'user-select:none',
      'pointer-events:none'
    ].join(';');
    wrapper.appendChild(el);

    animate(el, {
      translateY: ['0px', `${idx === 0 ? 40 : -40}px`],
      duration: 20000,
      ease: 'inOut(2)',
      loop: true,
      direction: 'alternate'
    });
  });

  // Floating editorial crosses — red, bright, in their own visible layer
  const crossWrapper = document.createElement('div');
  crossWrapper.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden;';
  document.body.appendChild(crossWrapper);

  const crossCount = 24;
  for (let i = 0; i < crossCount; i++) {
    const cross = document.createElement('div');
    cross.textContent = '+';
    const size = 0.9 + Math.random() * 1.4;
    cross.style.cssText = [
      'position:absolute',
      `left:${Math.random() * 100}vw`,
      `top:${Math.random() * 100}vh`,
      'font-family:var(--mono)',
      `font-size:${size}rem`,
      'font-weight:400',
      'color:var(--accent)',
      `opacity:${0.25 + Math.random() * 0.4}`
    ].join(';');
    crossWrapper.appendChild(cross);

    animate(cross, {
      translateY: [`0px`, `${(Math.random() - 0.5) * 120}px`],
      translateX: [`0px`, `${(Math.random() - 0.5) * 40}px`],
      rotateZ: [0, 90 + Math.random() * 90],
      opacity: [0.25 + Math.random() * 0.4, 0.1 + Math.random() * 0.25],
      duration: 12000 + Math.random() * 12000,
      ease: 'linear',
      loop: true,
      direction: 'alternate'
    });
  }
}

// ── WAVEFORM CANVAS & BPM RANDOMIZER ─────────────────────────
function initWaveform() {
  const canvas = document.getElementById('waveform-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const bpmLabel = document.getElementById('live-bpm');
  let currentBPM = 72;
  
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  
  let time = 0;
  function draw() {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    ctx!.beginPath();
    ctx!.strokeStyle = getComputedStyle(document.body).getPropertyValue('--accent');
    ctx!.lineWidth = 2;
    
    // Waveform speed and bump spacing determined by BPM
    const speed = currentBPM / 30; // approx
    const spacing = Math.max(40, 200 - currentBPM); // lower bpm = wider spacing
    
    for (let x = 0; x < canvas.width; x++) {
      let y = canvas.height / 2;
      if ((x - time) % spacing > -10 && (x - time) % spacing < 10) {
        y -= Math.sin(((x - time) % spacing) * Math.PI / 10) * 15;
      }
      if (x === 0) ctx!.moveTo(x, y);
      else ctx!.lineTo(x, y);
    }
    ctx!.stroke();
    time += speed;
    requestAnimationFrame(draw);
  }
  draw();

  // Randomize BPM
  setInterval(() => {
    currentBPM = Math.floor(60 + Math.random() * 40); // 60 to 100
    if (bpmLabel) bpmLabel.textContent = `${currentBPM} BPM`;
  }, 3000);
}

// ── METRICS COUNTERS & RANDOMIZERS ────────────────────────
function initCounters() {
  // Animate standard metrics once
  const nums = document.querySelectorAll('.metric-num');
  nums.forEach((el) => {
    const target = parseInt(el.getAttribute('data-target') || '0', 10);
    animate(el, {
      innerHTML: [0, target],
      round: 1,
      duration: 2000,
      ease: 'outExpo'
    });
  });
  
  // Specifically for the Platform Stats Card
  const liveMs = document.getElementById('live-ms');
  const liveAcc = document.getElementById('live-acc');
  const liveAgents = document.getElementById('live-agents');
  
  if (liveAgents) liveAgents.textContent = '5'; // Constant
  if (liveMs) liveMs.textContent = '35'; // Fixed 35 seconds

  if (liveAcc) {
    setInterval(() => {
      const acc = (96.00 + Math.random() * 2.00).toFixed(2); // 96.00 to 98.00
      liveAcc.textContent = acc;
    }, 2000);
  }
}
// ── SHOWCASE ANIMATIONS (Tasks 1-9) ────────────────────────
function initShowcaseAnimations() {
  // 1. Square rotation
  const square = document.querySelector('.square');
  if (square) {
    animate('.square', { rotate: 90, loop: true, ease: 'inOutExpo' });
  }

  // 2. Shapes composition blend
  const shapes = document.querySelectorAll('.shape');
  if (shapes.length) {
    animate('.shape', {
      x: random(-100, 100),
      y: random(-100, 100),
      rotate: random(-180, 180),
      duration: random(500, 1000),
      composition: 'blend',
      loop: true,
      direction: 'alternate'
    });
  }

  // 3. Draw Path on scroll
  const scrollPath = document.querySelector('.scroll-path');
  if (scrollPath) {
    animate(createDrawable('.scroll-path'), {
      draw: ['0 0', '0 1', '1 1'],
      delay: stagger(40),
      ease: 'inOut(3)',
      autoplay: onScroll({ sync: true }),
    });
  }

  // 4. Grid of dots from center
  const dotGrid = document.querySelector('.dot-grid');
  if (dotGrid) {
    // Generate 169 dots (13x13)
    for (let i = 0; i < 169; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.style.width = '100%';
      dot.style.height = '10px';
      dot.style.background = 'var(--text-muted)';
      dot.style.borderRadius = '50%';
      dotGrid.appendChild(dot);
    }
    const options = { grid: [13, 13], from: 'center' as const };
    createTimeline({ loop: true })
      .add('.dot', {
        scale: stagger([1.1, 0.75], options),
        ease: 'inOutQuad',
        direction: 'alternate'
      }, stagger(200, options));
  }

  // 5. Car & Circuit Path Morphing
  const circuit = document.querySelector('.circuit');
  if (circuit) {
    animate('.car', {
      ...createMotionPath('.circuit'),
      loop: true,
      duration: 3000,
      ease: 'linear'
    });

    animate(createDrawable('.circuit'), {
      draw: '0 1',
      loop: true,
      duration: 3000
    });

    animate('.circuit-a', {
      d: morphTo('.circuit-b'),
      loop: true,
      direction: 'alternate',
      duration: 2000
    });
  }

  // 7. Tick / Ticker Timeline
  const tickerWrap = document.querySelector('.ticker');
  if (tickerWrap) {
    for (let i = 0; i < 12; i++) {
      const tick = document.createElement('div');
      tick.className = 'tick';
      tick.style.cssText = `position:absolute; width:2px; height:6px; background:var(--accent); left:49px; top:5px; transform-origin: 1px 45px; transform: rotate(${i * 30}deg);`;
      tickerWrap.appendChild(tick);
    }
    createTimeline({ loop: true })
      .add('.tick', {
        y: '-=6',
        duration: 50,
      }, stagger(10))
      .add('.ticker', {
        rotate: 360,
        duration: 1920,
      }, '<');
  }

  // 8. Scope Media Query (Portrait / Landscape)
  const mqCircle = document.querySelector('.mq-circle');
  if (mqCircle) {
    createScope({
      mediaQueries: {
        portrait: '(orientation: portrait)',
      }
    })
    .add(({ matches }: any) => {
      const isPortrait = matches.portrait;
      createTimeline({ loop: true }).add('.mq-circle', {
        y: isPortrait ? 0 : [-50, 50, -50],
        x: isPortrait ? [-50, 50, -50] : 0,
      }, stagger(100));
    });
  }

  // 9. Pulse rings — expanding and fading
  const pulseRings = document.querySelectorAll('.pulse-ring');
  if (pulseRings.length) {
    animate('.pulse-ring', {
      scale: [0.5, 2.5],
      opacity: [0.4, 0],
      duration: 3000,
      delay: stagger(800),
      loop: true,
      ease: 'outCubic'
    });
  }

  // 10. Data lines — growing and fading
  const dataLines = document.querySelectorAll('.data-line');
  if (dataLines.length) {
    animate('.data-line', {
      scaleX: [0, 1],
      opacity: [0, 0.5, 0],
      duration: 2500,
      delay: stagger(600, { start: 500 }),
      loop: true,
      ease: 'inOutQuad'
    });
  }

  // 11. Orbiting dot
  const orbitDot = document.querySelector('.orbit-dot');
  if (orbitDot) {
    animate('.orbit-dot', {
      rotate: [0, 360],
      duration: 8000,
      loop: true,
      ease: 'linear',
      transformOrigin: ['-80px 0px', '-80px 0px']
    });
  }
}



export function initLandingPage() {
  initEditorialBackground();
  initWaveform();
  initCounters();
  initShowcaseAnimations();

  const skipLoginBtn = document.getElementById('skip-login');
  const btnEnterApp = document.getElementById('btn-enter-app');
  const btnExploreFeatures = document.getElementById('btn-explore-features');
  
  if (btnEnterApp) btnEnterApp.addEventListener('click', openAuth);
  if (skipLoginBtn) skipLoginBtn.addEventListener('click', openAuth);

  // Explore Features — smooth scroll with reveal animation
  if (btnExploreFeatures) {
    btnExploreFeatures.addEventListener('click', () => {
      const target = document.getElementById('features-section-anchor');
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  const btnLogin = document.getElementById('btn-login');
  const btnOpenAuth = document.getElementById('btn-open-auth');

  const authOverlay = document.getElementById('auth-overlay');
  const btnCloseAuth = document.getElementById('btn-close-auth');
  const btnToggleAuth = document.getElementById('btn-toggle-auth');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const authToggleText = document.getElementById('auth-toggle-text');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const signupField = document.querySelector('.signup-field') as HTMLElement;
  const authForm = document.getElementById('auth-form') as HTMLFormElement;

  const landingPage = document.getElementById('landing-page');
  const appPage = document.getElementById('app-page');

  // ── THEME TOGGLE ──────────────────────────────────────────
  const themeToggles = document.querySelectorAll('.theme-switch');
  const themeLabels = document.querySelectorAll('.theme-label');

  let isDark = true; // Default to dark mode
  
  // Initialize labels for dark mode
  themeLabels.forEach(label => label.textContent = 'DARK_SYS');
  
  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      isDark = !isDark;
      if (isDark) {
        document.body.setAttribute('data-theme', 'dark');
        themeLabels.forEach(label => label.textContent = 'DARK_SYS');
      } else {
        // Technically user wants dark mode default, but we'll leave the toggle working
        document.body.removeAttribute('data-theme');
        themeLabels.forEach(label => label.textContent = 'LITE_SYS');
      }
    });
  });

  // ── LOGO SCROLL ──────────────────────────────────────────
  const landingLogo = document.querySelector('.landing-logo');
  if (landingLogo) {
    landingLogo.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (!landingPage || !appPage) return;

  // ── Hero Text Splitting ─────────────────────────────────
  // Split characters for animation, but SKIP content inside .hero-stripe-text
  // so the background-clip gradient stays intact
  document.querySelectorAll('.hero-text').forEach(el => {
    const html = el.innerHTML;
    let newHtml = '';
    let isTag = false;
    let tag = '';
    let insideStripe = false;

    for (let i = 0; i < html.length; i++) {
      if (html[i] === '<') isTag = true;
      if (isTag) {
        tag += html[i];
        if (html[i] === '>') {
          isTag = false;
          // Detect opening/closing of hero-stripe-text
          if (tag.includes('hero-stripe-text')) {
            if (tag.startsWith('</')) {
              insideStripe = false;
            } else {
              insideStripe = true;
            }
          }
          newHtml += tag;
          tag = '';
        }
      } else if (insideStripe) {
        // Don't split characters inside .hero-stripe-text
        newHtml += html[i];
      } else {
        if (html[i] === ' ' || html[i] === '\n') {
          newHtml += html[i];
        } else {
          newHtml += `<span class="char" style="display:inline-block; opacity: 0; transform: translateY(50px) rotateX(-90deg);">${html[i]}</span>`;
        }
      }
    }
    el.innerHTML = newHtml;
  });

  // Hide .hero-stripe-text initially for entrance animation
  const stripeText = document.querySelector('.hero-stripe-text') as HTMLElement;
  if (stripeText) {
    stripeText.style.opacity = '0';
    stripeText.style.transform = 'translateY(30px)';
    stripeText.style.display = 'inline-block';
  }

  // Hide other elements initially to prevent FOUC
  document.querySelectorAll('.hero-image, .hero-ctas').forEach((el: any) => {
    el.style.opacity = '0';
  });

  // ── Hero kinetic entrance ───────────────────────────────────────
  const heroTl = createTimeline();
  // First: animate "Redefining" as a single unit
  heroTl.add('.hero-stripe-text', {
    opacity: [0, 1],
    translateY: [30, 0],
    duration: 800,
    ease: spring({ bounce: 0.4, duration: 800 })
  }, 800)
  // Then: animate "Clinical AI" chars
  .add('.hero-text .char', {
    opacity: [0, 1],
    translateY: [50, 0],
    rotateX: [-90, 0],
    transformOrigin: ['50% 100%', '50% 100%'],
    delay: stagger(100, { from: 'center' }),
    ease: spring({ bounce: 0.5, duration: 800 })
  }, 1200)
  .add('.hero-image', {
    opacity: [0, 1],
    scale: [0.85, 1],
    rotateY: [15, 0],
    ease: spring({ bounce: 0.5, duration: 800 })
  }, '-=800')
  .add('.hero-ctas', {
    opacity: [0, 1],
    translateY: [20, 0],
    ease: spring({ bounce: 0.4, duration: 800 })
  }, '-=600');

  // ── AUTH OVERLAY LOGIC ────────────────────────────────────
  let isSignUp = false;

  function openAuth() {
    if (!authOverlay) return;
    authOverlay.classList.add('is-open');
    
    // VengenceUI style stagger entrance
    animate('.auth-panel', {
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 600,
      ease: 'outExpo'
    });
    
    const elementsToStagger = authOverlay.querySelectorAll('h2, .auth-sub, .auth-btn-social, .auth-divider, .auth-input-wrap, .auth-submit, .auth-toggle');
    animate(elementsToStagger, {
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 600,
      delay: stagger(60, { start: 100 }),
      ease: 'outExpo'
    });
  }

  function closeAuth() {
    if (!authOverlay) return;
    animate('.auth-panel', {
      translateY: [0, 40],
      opacity: [1, 0],
      duration: 400,
      ease: 'inExpo',
      complete: () => {
        authOverlay.classList.remove('is-open');
      }
    });
  }

  function toggleAuthMode() {
    isSignUp = !isSignUp;
    
    // Animate form height change and fade texts
    const form = document.querySelector('.auth-panel') as HTMLElement;
    if (!form) return;
    
    animate([authTitle, authSubtitle, authToggleText, btnToggleAuth, authSubmitBtn], {
      opacity: [1, 0],
      duration: 200,
      ease: 'inOutQuad',
      complete: () => {
        if (isSignUp) {
          authTitle!.textContent = 'Create Account';
          authSubtitle!.textContent = 'Join the clinical intelligence platform';
          authToggleText!.textContent = 'Already have an account?';
          btnToggleAuth!.textContent = 'Sign In';
          authSubmitBtn!.textContent = 'Create Account →';
          signupField.style.display = 'flex';
        } else {
          authTitle!.textContent = 'Sign In';
          authSubtitle!.textContent = 'Access your clinical workspace';
          authToggleText!.textContent = 'Don\'t have an account?';
          btnToggleAuth!.textContent = 'Create one';
          authSubmitBtn!.textContent = 'Sign In →';
          signupField.style.display = 'none';
        }
        
        animate([authTitle, authSubtitle, authToggleText, btnToggleAuth, authSubmitBtn, signupField], {
          opacity: [0, 1],
          duration: 300,
          ease: 'outQuad'
        });
      }
    });
  }

  if (btnLogin) btnLogin.addEventListener('click', openAuth);
  if (btnOpenAuth) btnOpenAuth.addEventListener('click', openAuth);
  if (btnCloseAuth) btnCloseAuth.addEventListener('click', closeAuth);
  if (btnToggleAuth) btnToggleAuth.addEventListener('click', toggleAuthMode);
  
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log(`[AUTH] Attempting ${isSignUp ? 'Sign Up' : 'Sign In'}...`);
      // Stub: in real app, wire up your auth API here
      // For now, just enter the app
      closeAuth();
      setTimeout(enterApp, 400);
    });
  }
  
  document.querySelectorAll('.auth-btn-social').forEach(btn => {
    btn.addEventListener('click', () => {
      console.log(`[AUTH] Attempting Social OAuth...`);
      closeAuth();
      setTimeout(enterApp, 400);
    });
  });

  // ── VengenceUI-style Smooth Scroll Animations ─────────────────
  // Using onEnter trigger-based reveals for reliability

  // 1. Scroll progress bar at top
  const scrollProgress = document.createElement('div');
  scrollProgress.style.cssText = 'position:fixed;top:0;left:0;height:2px;background:var(--accent);z-index:9999;width:100%;transform-origin:left;';
  document.body.appendChild(scrollProgress);
  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
  });

  // 2. Hero parallax — manual scroll listener for smooth parallax
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = document.querySelector('.hero')?.clientHeight || 800;
    if (scrollY < heroHeight) {
      const progress = scrollY / heroHeight;
      const heroLeft = document.querySelector('.hero-left') as HTMLElement;
      const heroRight = document.querySelector('.hero-right') as HTMLElement;
      if (heroLeft) {
        heroLeft.style.transform = `translateY(${-progress * 100}px)`;
        heroLeft.style.opacity = `${1 - progress * 0.6}`;
      }
      if (heroRight) {
        heroRight.style.transform = `translateY(${-progress * 60}px) scale(${1 - progress * 0.05})`;
        heroRight.style.opacity = `${1 - progress * 0.5}`;
      }
    }
  });

  // 3. Bidirectional scroll reveal — state-tracked, no race conditions
  function scrollReveal(selector: string, props: Record<string, any>, staggerDelay?: number) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;

    // Separate animatable props from config
    const enterProps: Record<string, any> = {};
    const leaveProps: Record<string, any> = {};
    for (const key of Object.keys(props)) {
      if (key === 'duration' || key === 'ease' || key === 'delay') continue;
      const val = props[key];
      if (Array.isArray(val) && val.length === 2) {
        enterProps[key] = val;
        leaveProps[key] = [val[1], val[0]];
      }
    }

    const duration = props.duration || 900;
    let isVisible = false;

    // Observe only the first element — one trigger per group
    const sentinel = els[0];
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      if (entry.isIntersecting && !isVisible) {
        isVisible = true;
        animate(selector, {
          ...enterProps,
          duration,
          ease: 'outCubic',
          delay: staggerDelay ? stagger(staggerDelay) : 0,
          composition: 'replace'
        });
      } else if (!entry.isIntersecting && isVisible) {
        // Only reverse if the element went BELOW the viewport (user scrolled up)
        const rect = entry.boundingClientRect;
        if (rect.top > 0) {
          isVisible = false;
          animate(selector, {
            ...leaveProps,
            duration: 500,
            ease: 'inCubic',
            delay: staggerDelay ? stagger(staggerDelay * 0.4) : 0,
            composition: 'replace'
          });
        }
      }
    }, { threshold: 0.1 });
    observer.observe(sentinel);
  }

  // Single-element bidirectional reveal (for unique items like section headers)
  function scrollRevealEl(el: Element, inProps: Record<string, any>, outProps: Record<string, any>) {
    let isVisible = false;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      if (entry.isIntersecting && !isVisible) {
        isVisible = true;
        animate(entry.target, { ...inProps, composition: 'replace' });
      } else if (!entry.isIntersecting && isVisible && entry.boundingClientRect.top > 0) {
        isVisible = false;
        animate(entry.target, { ...outProps, composition: 'replace' });
      }
    }, { threshold: 0.1 });
    observer.observe(el);
  }

  // 4. Apply bidirectional reveals
  scrollReveal('.intro-band-inner', { translateY: [60, 0], opacity: [0, 1] });
  scrollReveal('.metric-block', { scale: [0.85, 1], opacity: [0, 1] }, 100);

  // Section headers — each individually tracked
  document.querySelectorAll('.section-header').forEach(header => {
    scrollRevealEl(header,
      { translateY: [50, 0], opacity: [0, 1], duration: 900, ease: 'outCubic' },
      { translateY: [0, 50], opacity: [1, 0], duration: 500, ease: 'inCubic' }
    );
  });

  // Feature tiles
  scrollReveal('.feature-tile', { translateY: [70, 0], opacity: [0, 1], scale: [0.93, 1] }, 90);

  // Pipeline steps & arrows
  scrollReveal('.pipeline-step', { translateX: [-30, 0], translateY: [25, 0], opacity: [0, 1], scale: [0.92, 1] }, 130);
  scrollReveal('.pipeline-arrow', { opacity: [0, 1], scale: [0.5, 1], duration: 600 }, 130);

  // Tool/Tech cards
  scrollReveal('.feat-card', { translateY: [50, 0], opacity: [0, 1], scale: [0.92, 1] }, 70);

  // CTA band
  scrollReveal('.cta-band', { scale: [0.92, 1], opacity: [0, 1] });

  // ── Page transition: Landing → App ────────────────────────
  function enterApp() {
    const tl = createTimeline();
    tl.add('.hero-left', { duration: 1200, x: -600, opacity: 0, ease: 'inOutExpo' }, 0)
      .add('.hero-right', { duration: 1200, x: 600, opacity: 0, ease: 'inOutExpo' }, 0)
      .add(landingPage!, { duration: 300, opacity: 0 }, 1000)
      .add(appPage!, {
        begin: () => {
          landingPage!.style.display = 'none';
          appPage!.style.display = 'block';
          appPage!.style.opacity = '0';
          window.dispatchEvent(new Event('resize'));
        },
        duration: 1000,
        opacity: 1,
        ease: 'outQuad'
      }, 1100);
  }

  // ── Page transition: App → Landing ────────────────────────
  const topNavLogo = document.querySelector('#top-nav .logo-text');
  if (topNavLogo) {
    topNavLogo.addEventListener('click', () => {
      // Return to landing page
      const tl = createTimeline();
      tl.add(appPage!, { duration: 500, opacity: 0, ease: 'inOutQuad' }, 0)
        .add('.hero-left', {
          begin: () => {
            appPage!.style.display = 'none';
            landingPage!.style.display = 'block';
            landingPage!.style.opacity = '1';
          },
          x: [-300, 0], opacity: [0, 1], duration: 1200, ease: 'outExpo' 
        }, 600)
        .add('.hero-right', { x: [300, 0], opacity: [0, 1], duration: 1200, ease: 'outExpo' }, 600);
    });
  }

  // Note: skipLoginBtn and btnEnterApp handled above.
}
