// Copyright (c) 2026 Emanuele Ciotola. All Rights Reserved.
// PROJECT: G-Scanner — See LICENSE file in root for terms.
// ==========================================
// 1. THEME TOGGLE (Solo logica del click)
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        htmlElement.classList.toggle('dark');
        // Salva la scelta dell'utente per le altre pagine
        localStorage.theme = htmlElement.classList.contains('dark') ? 'dark' : 'light';
    });
}

// ==========================================
// 2. SCROLL FLUIDO DEI LINK
// ==========================================
function smoothScrollToTarget(targetId) {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const targetId = link.getAttribute('href')?.slice(1);
    if (!targetId) return;

    link.addEventListener('click', (event) => {
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;

        event.preventDefault();
        smoothScrollToTarget(targetId);

        if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    });
});

// ==========================================
// 3. INTERSECTION OBSERVER GLOBALE (Animazioni)
// ==========================================
const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-up, .fade-blur-in, .fly-in-3d, .pop-in, .slide-up-bounce, .footer-reveal').forEach(el => {
    observer.observe(el);
});

// ==========================================
// 4. LOGICA SCANNER HERO (Animazione Laser)
// ==========================================
const fullScannerContainer = document.getElementById('full-scanner-container');
const frontUI = document.getElementById('front-ui');
const successOverlay = document.getElementById('success-overlay');
const scannerLaser = document.getElementById('scanner-laser');
const barcodeWrapper = document.getElementById('dynamic-barcode-wrapper');
const barcodeLinesContainer = document.getElementById('dynamic-barcode-lines');

let isScannerVisible = false;
let sequenceId = 0; 

function generateAestheticBarcode() {
    if(!barcodeLinesContainer) return;
    barcodeLinesContainer.innerHTML = '';
    const pattern = [2, 1, 2, 3, 1, 4, 2, 2, 2, 1, 2, 4, 2, 1, 3, 2, 1, 2];

    pattern.forEach((w) => {
        const line = document.createElement('div');
        line.className = 'bg-[#1a1c18] dark:bg-gray-800 rounded-[1px] h-full';
        line.style.width = (w * 2) + 'px';
        barcodeLinesContainer.appendChild(line);
    });
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runFullScannerSequence() {
    const currentSeq = ++sequenceId; 
    let isFirstScan = true; 

    while (isScannerVisible && currentSeq === sequenceId) {
        successOverlay.classList.remove('show-success-overlay');
        frontUI.classList.remove('dim-front-ui');
        scannerLaser.style.transition = 'none';
        scannerLaser.style.top = '12%';
        scannerLaser.style.opacity = '0';

        let waitTime = isFirstScan ? 500 : 1500;
        await sleep(waitTime);

        if (!isScannerVisible || currentSeq !== sequenceId) break;
        isFirstScan = false;

        generateAestheticBarcode();
        barcodeWrapper.classList.add('barcode-visible');

        await sleep(800);
        if (!isScannerVisible || currentSeq !== sequenceId) break;

        scannerLaser.style.transition = 'top 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.1s';
        scannerLaser.style.opacity = '1';
        scannerLaser.style.top = '86%';

        await sleep(700);
        if (!isScannerVisible || currentSeq !== sequenceId) break;

        scannerLaser.style.opacity = '0';
        frontUI.classList.add('dim-front-ui');
        successOverlay.classList.add('show-success-overlay');

        setTimeout(() => {
            if (currentSeq === sequenceId) barcodeWrapper.classList.remove('barcode-visible');
        }, 300);

        await sleep(3500);
        if (!isScannerVisible || currentSeq !== sequenceId) break;

        successOverlay.classList.remove('show-success-overlay');
        frontUI.classList.remove('dim-front-ui');
    }
}

const scannerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            isScannerVisible = true;
            runFullScannerSequence();
        } else {
            isScannerVisible = false;
            sequenceId++; 
            if(successOverlay) successOverlay.classList.remove('show-success-overlay');
            if(frontUI) frontUI.classList.remove('dim-front-ui');
            if(barcodeWrapper) barcodeWrapper.classList.remove('barcode-visible');
            if(scannerLaser) {
                scannerLaser.style.opacity = '0';
                scannerLaser.style.transition = 'none';
                scannerLaser.style.top = '5%';
            }
        }
    });
}, { threshold: 0.8 });

if (fullScannerContainer) {
    scannerObserver.observe(fullScannerContainer);
    generateAestheticBarcode();
}

// ==========================================
// 5. INTERATTIVITÀ CARD (Flip 3D)
// ==========================================
const aboutCard = document.getElementById('about-card');
const wavingIcon = document.getElementById('waving-icon');

let tapCount = 0;
let tapTimer = null;
let isFlipped = false;
let isWaving = false;
let isAnimatingFlip = false; 

function triggerWave() {
    if (isWaving || isFlipped) return;
    isWaving = true;
    wavingIcon.classList.add('animate-hand-once');
    setTimeout(() => {
        wavingIcon.classList.remove('animate-hand-once');
        isWaving = false;
    }, 1200); 
}

if (aboutCard) {
    aboutCard.addEventListener('mouseenter', triggerWave);

    aboutCard.addEventListener('click', () => {
        if (isAnimatingFlip) return;

        if (isFlipped) {
            isAnimatingFlip = true;
            aboutCard.classList.remove('rotate-y-180');
            isFlipped = false;
            tapCount = 0;
            setTimeout(() => { isAnimatingFlip = false; }, 800);
            return;
        }

        tapCount++;
        clearTimeout(tapTimer);

        if (tapCount >= 5) {
            isAnimatingFlip = true;
            wavingIcon.classList.remove('animate-hand-once');
            isWaving = false;
            aboutCard.classList.add('rotate-y-180');
            isFlipped = true;
            tapCount = 0;
            setTimeout(() => { isAnimatingFlip = false; }, 800);
            return;
        }

        tapTimer = setTimeout(() => {
            if (tapCount > 0 && tapCount < 5) {
                triggerWave(); 
            }
            tapCount = 0; 
        }, 300);
    });
}

// ==========================================
// 6. MENU LINGUA DROPDOWN
// ==========================================
const langBtn = document.getElementById('lang-menu-btn');
const langDropdown = document.getElementById('lang-dropdown');
const langChevron = document.getElementById('lang-menu-chevron');

if (langBtn && langDropdown) {
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = langBtn.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            closeLangMenu();
        } else {
            openLangMenu();
        }
    });

    document.addEventListener('click', (e) => {
        if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
            closeLangMenu();
        }
    });

    function openLangMenu() {
        langBtn.setAttribute('aria-expanded', 'true');
        langDropdown.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
        langDropdown.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
        langChevron.classList.add('-rotate-180');
    }

    function closeLangMenu() {
        langBtn.setAttribute('aria-expanded', 'false');
        langDropdown.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
        langDropdown.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
        langChevron.classList.remove('-rotate-180');
    }
}