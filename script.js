// 1. Theme Toggle
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

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

if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    htmlElement.classList.add('dark');
} else {
    htmlElement.classList.remove('dark');
}

themeToggleBtn.addEventListener('click', () => {
    htmlElement.classList.toggle('dark');
    localStorage.theme = htmlElement.classList.contains('dark') ? 'dark' : 'light';
});

// 2. Intersection Observer Globale (Inclusi i nuovi effetti creativi)
const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

// Osserva tutti gli elementi animati
document.querySelectorAll('.fade-up, .fade-blur-in, .fly-in-3d, .pop-in, .slide-up-bounce, .footer-reveal').forEach(el => {
    observer.observe(el);
});

// 3. Logica Scanner: Estetica Apple, Overlay Soffice e Contatore Robusto
const fullScannerContainer = document.getElementById('full-scanner-container');
const frontUI = document.getElementById('front-ui');
const successOverlay = document.getElementById('success-overlay');
const scannerLaser = document.getElementById('scanner-laser');
const barcodeWrapper = document.getElementById('dynamic-barcode-wrapper');
const barcodeLinesContainer = document.getElementById('dynamic-barcode-lines');

let isScannerVisible = false;
let sequenceId = 0; // ID per stoppare brutalmente i vecchi loop quando si scrolla via

// Generatore di codice a barre super pulito ed estetico
function generateAestheticBarcode() {
    if(!barcodeLinesContainer) return;
    barcodeLinesContainer.innerHTML = '';

    // Pattern visivamente armonioso
    const pattern = [2, 1, 2, 3, 1, 4, 2, 2, 2, 1, 2, 4, 2, 1, 3, 2, 1, 2];

    pattern.forEach((w) => {
        const line = document.createElement('div');
        // Tutte le linee hanno la stessa altezza
        line.className = 'bg-[#1a1c18] dark:bg-gray-800 rounded-[1px] h-full';
        line.style.width = (w * 2) + 'px';

        barcodeLinesContainer.appendChild(line);
    });
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runFullScannerSequence() {
    const currentSeq = ++sequenceId; // Nuovo ID per questo loop
    let isFirstScan = true; // Locale al loop corrente, garantisce il comportamento desiderato

    while (isScannerVisible && currentSeq === sequenceId) {
        // Reset Silenzioso all'inizio di ogni giro
        successOverlay.classList.remove('show-success-overlay');
        frontUI.classList.remove('dim-front-ui');
        scannerLaser.style.transition = 'none';
        scannerLaser.style.top = '5%';
        scannerLaser.style.opacity = '0';

        // Attesa differenziata: 800ms la primissima volta del ciclo, 2000ms i giri successivi
        let waitTime = isFirstScan ? 500 : 1500;
        await sleep(waitTime);

        // Controllo di sicurezza: l'utente ha scrollato via mentre dormivamo?
        if (!isScannerVisible || currentSeq !== sequenceId) break;

        isFirstScan = false;

        generateAestheticBarcode();
        barcodeWrapper.classList.add('barcode-visible');

        // Tempo di lettura codice fermo
        await sleep(800);
        if (!isScannerVisible || currentSeq !== sequenceId) break;

        // Scansione laser più morbida (0.7s)
        scannerLaser.style.transition = 'top 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.1s';
        scannerLaser.style.opacity = '1';
        scannerLaser.style.top = '95%';

        await sleep(700);
        if (!isScannerVisible || currentSeq !== sequenceId) break;

        // BOOM morbido. That's it.
        scannerLaser.style.opacity = '0';
        frontUI.classList.add('dim-front-ui');
        successOverlay.classList.add('show-success-overlay');

        // Rimuovi il barcode da dietro in modo asincrono
        setTimeout(() => {
            if (currentSeq === sequenceId) barcodeWrapper.classList.remove('barcode-visible');
        }, 300);

        // Mostra il risultato per 4 secondi
        await sleep(3500);
        if (!isScannerVisible || currentSeq !== sequenceId) break;

        // Ritorno alla fotocamera
        successOverlay.classList.remove('show-success-overlay');
        frontUI.classList.remove('dim-front-ui');
    }
}

// Observer settato a 0.8 per garantire immediatezza non appena si vede un po' di card
const scannerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            isScannerVisible = true;
            runFullScannerSequence();
        } else {
            isScannerVisible = false;
            sequenceId++; // Uccide istantaneamente il vecchio ciclo in background

            // Reset CSS immediato
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

// 4. Advanced Interactivity for Card: Hover, Single Tap Wave vs 5-Fast-Tap Easter Egg
const aboutCard = document.getElementById('about-card');
const wavingIcon = document.getElementById('waving-icon');

let tapCount = 0;
let tapTimer = null;
let isFlipped = false;
let isWaving = false;
let isAnimatingFlip = false; // Lock to prevent accidental re-flips

// Safe function to trigger the wave animation fully
function triggerWave() {
    if (isWaving || isFlipped) return;
    isWaving = true;
    wavingIcon.classList.add('animate-hand-once');

    setTimeout(() => {
        wavingIcon.classList.remove('animate-hand-once');
        isWaving = false;
    }, 1200); // Wait for the full animation to complete
}

// Desktop Hover logic: guarantees the animation plays fully even if mouse leaves
if (aboutCard) {
    aboutCard.addEventListener('mouseenter', triggerWave);

    // Tap/Click logic
    aboutCard.addEventListener('click', () => {
        // Se sta facendo il 3D flip, ignora tutti i click per evitare bug/chiusure accidentali
        if (isAnimatingFlip) return;

        // Se è già girata, un singolo click la fa tornare normale
        if (isFlipped) {
            isAnimatingFlip = true;
            aboutCard.classList.remove('rotate-y-180');
            isFlipped = false;
            tapCount = 0;

            // Rilascia il blocco quando l'animazione CSS è finita
            setTimeout(() => { isAnimatingFlip = false; }, 800);
            return;
        }

        tapCount++;
        clearTimeout(tapTimer);

        // Se l'utente raggiunge i 5 tap veloci
        if (tapCount >= 5) {
            isAnimatingFlip = true;

            // Interrompe l'animazione della mano (se era in corso)
            wavingIcon.classList.remove('animate-hand-once');
            isWaving = false;

            // Gira la card
            aboutCard.classList.add('rotate-y-180');
            isFlipped = true;
            tapCount = 0;

            // Rilascia il blocco flip
            setTimeout(() => { isAnimatingFlip = false; }, 800);
            return;
        }

        // Finestra temporale per capire se l'utente ha finito di cliccare (tap lento)
        tapTimer = setTimeout(() => {
            if (tapCount > 0 && tapCount < 5) {
                triggerWave(); // L'utente ha fatto da 1 a 4 tap e si è fermato -> saluta
            }
            tapCount = 0; // Reset
        }, 300);
    });
}

// 5. Custom Language Dropdown Logic
const langBtn = document.getElementById('lang-menu-btn');
const langDropdown = document.getElementById('lang-dropdown');
const langChevron = document.getElementById('lang-menu-chevron');

if (langBtn && langDropdown) {
    // Apri/Chiudi al click sul bottone
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = langBtn.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            closeLangMenu();
        } else {
            openLangMenu();
        }
    });

    // Chiudi cliccando fuori dal menu
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