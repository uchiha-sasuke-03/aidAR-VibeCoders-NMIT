// ============================================
// MedHelp AI — Main Entry Point
// ============================================
import './style.css';
import { initScene, getScene, startRenderLoop } from './viewer/scene';
import { createProceduralModel, type BodyParts } from './viewer/model';
import { CPRAnimation, BleedingAnimation, ElectricShockAnimation } from './viewer/animations';
import { initChatbotUI } from './chatbot/chatbot-ui';
import { initNarrator } from './narrator/narrator';
import { initLandingPage } from './landing';

// ---- App Init ----
document.addEventListener('DOMContentLoaded', async () => {
  // 0. Initialize Landing Page Interactions
  initLandingPage();

  // 1. Initialize 3D Scene
  const container = document.getElementById('three-canvas-container');
  if (container) {
    initScene(container);
    const scene = getScene();

    // 2. Create Procedural Model
    const bodyParts: BodyParts = await createProceduralModel();
    scene.add(bodyParts.root);

    // 3. Initialize Animations
    const cprAnim = new CPRAnimation(bodyParts);
    const bleedingAnim = new BleedingAnimation(bodyParts);
    const shockAnim = new ElectricShockAnimation(bodyParts);

    // 4. Animation Control Buttons
    const btnCpr = document.getElementById('btn-cpr')!;
    const btnBleeding = document.getElementById('btn-bleeding')!;
    const btnShock = document.getElementById('btn-electric-shock')!;
    const btnReset = document.getElementById('btn-reset')!;
    const viewerModeLabel = document.getElementById('viewer-mode-label')!;

    btnCpr.addEventListener('click', () => {
      bleedingAnim.stop();
      shockAnim.stop();
      btnBleeding.classList.remove('active');
      btnShock.classList.remove('active');

      if (cprAnim.isActive()) {
        cprAnim.stop();
        btnCpr.classList.remove('active');
        viewerModeLabel.textContent = 'Interactive Mode';
      } else {
        cprAnim.start();
        btnCpr.classList.add('active');
        viewerModeLabel.textContent = 'CPR Demonstration';
      }
    });

    btnBleeding.addEventListener('click', () => {
      cprAnim.stop();
      shockAnim.stop();
      btnCpr.classList.remove('active');
      btnShock.classList.remove('active');

      if (bleedingAnim.isActive()) {
        bleedingAnim.stop();
        btnBleeding.classList.remove('active');
        viewerModeLabel.textContent = 'Interactive Mode';
      } else {
        bleedingAnim.start();
        btnBleeding.classList.add('active');
        viewerModeLabel.textContent = 'Bleeding Management';
      }
    });

    btnShock.addEventListener('click', () => {
      cprAnim.stop();
      bleedingAnim.stop();
      btnCpr.classList.remove('active');
      btnBleeding.classList.remove('active');

      if (shockAnim.isActive()) {
        shockAnim.stop();
        btnShock.classList.remove('active');
        viewerModeLabel.textContent = 'Interactive Mode';
      } else {
        shockAnim.start();
        btnShock.classList.add('active');
        viewerModeLabel.textContent = 'Electric Shock Management';
      }
    });

    btnReset.addEventListener('click', () => {
      cprAnim.stop();
      bleedingAnim.stop();
      shockAnim.stop();
      btnCpr.classList.remove('active');
      btnBleeding.classList.remove('active');
      btnShock.classList.remove('active');
      viewerModeLabel.textContent = 'Interactive Mode';
    });

    // 5. Start Render Loop
    startRenderLoop((delta) => {
      cprAnim.update(delta);
      bleedingAnim.update(delta);
      shockAnim.update(delta);
      if (bodyParts.cprMixer) {
        bodyParts.cprMixer.update(delta);
      }
      if (bodyParts.bleedingMixer) {
        bodyParts.bleedingMixer.update(delta);
      }
      if (bodyParts.electricShockMixer) {
        bodyParts.electricShockMixer.update(delta);
      }
    });
  }

  // 6. Initialize Chatbot
  initChatbotUI();

  // 7. Initialize Narrator
  initNarrator();

  // 8. Panel Tab Switching (narrator only now)
  const panelTabs = document.querySelectorAll<HTMLElement>('.panel-tab');
  panelTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      panelTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // 9. Nav Tab Switching
  const featureOverlays = document.querySelectorAll<HTMLElement>('.feature-overlay');
  const navTabs = document.querySelectorAll<HTMLElement>('.nav-tab');
  const sideColumn = document.getElementById('side-column');
  const viewerPanel = document.getElementById('viewer-panel');

  function hideAllOverlays() {
    featureOverlays.forEach(overlay => overlay.classList.remove('active'));
  }

  /** Lazy-load an iframe: set src from data-src only the first time */
  function activateIframe(overlayId: string) {
    const iframe = document.querySelector<HTMLIFrameElement>(`#${overlayId} .embed-iframe`);
    if (iframe && !iframe.src && iframe.dataset.src) {
      iframe.src = iframe.dataset.src;
    }
  }

  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      navTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      
      hideAllOverlays();

      if (target && target !== 'viewer') {
        const overlayId = `${target}-overlay`;
        const overlay = document.getElementById(overlayId);
        if (overlay) {
          overlay.classList.add('active');
          // Lazy-load iframes for twin/meditwin tabs
          activateIframe(overlayId);
        }
      }

      // Hide side column for iframe views; show it for normal views
      const isIframeView = target === 'twin' || target === 'meditwin' || target === 'brain' || target === 'skin';
      if (sideColumn) sideColumn.style.display = isIframeView ? 'none' : '';
      if (viewerPanel) viewerPanel.style.display = isIframeView ? 'none' : '';
    });
  });

  // Close buttons inside overlays
  const closeBtns = document.querySelectorAll<HTMLElement>('.overlay-close');
  closeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      hideAllOverlays();
      navTabs.forEach((t) => t.classList.remove('active'));
      const viewerTab = document.querySelector<HTMLElement>('.nav-tab[data-tab="viewer"]');
      if (viewerTab) viewerTab.classList.add('active');
      // Restore side column and viewer
      if (sideColumn) sideColumn.style.display = '';
      if (viewerPanel) viewerPanel.style.display = '';
    });
  });

  // 10. Mobile Panel Toggle
  const mobileToggle = document.getElementById('mobile-panel-toggle');
  const sidePanel = document.getElementById('side-panel');

  if (mobileToggle && sidePanel) {
    mobileToggle.addEventListener('click', () => {
      const vis = sidePanel.style.display;
      sidePanel.style.display = vis === 'none' ? 'flex' : 'none';
    });
  }
});

