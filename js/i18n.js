// Változók a nyelvi adatok tárolására
let translations = {};
let currentLang = 'hu'; // Alapértelmezett nyelv

// HTML elemek, amiket frissíteni kell
const selectors = {
    html: document.querySelector('html'),
    langButtons: document.querySelectorAll('.lang-switcher button'),
    elements: document.querySelectorAll('[data-i18n]')
};

/**
 * Betölti a nyelvi adatokat (JSON)
 * @param {string} lang - A nyelv kódja (pl. 'hu' vagy 'en')
 */
async function fetchLanguageData(lang) {
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load language file: ${lang}.json`);
        }
        translations = await response.json();
        applyTranslations();
    } catch (error) {
        console.error(error);
        // Hiba esetén megpróbáljuk a magyar nyelvet betölteni
        if (lang !== 'hu') {
            fetchLanguageData('hu');
        }
    }
}

/**
 * Végigmegy az oldalon és kicseréli a szövegeket
 */
function applyTranslations() {
    selectors.elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const attr = el.getAttribute('data-i18n-attr'); // Pl. 'alt' vagy 'content'

        // A JSON kulcs navigálása (pl. "hero.title")
        const text = key.split('.').reduce((obj, k) => (obj && obj[k] !== 'undefined') ? obj[k] : key, translations);

        if (text === key) {
            console.warn(`Translation key not found: ${key}`);
        }

        if (attr) {
            // Ha speciális attribútumot (pl. meta description) kell cserélni
            el.setAttribute(attr, text);
        } else {
            // Egyébként a belső HTML-t cseréljük
            // Ez biztonságos, mert a JSON-ból jön, nem felhasználói bevitelből
            el.innerHTML = text;
        }
    });

    // Frissítjük a HTML 'lang' attribútumát
    selectors.html.setAttribute('lang', currentLang);
    updateActiveButton();
}

/**
 * Frissíti az aktív nyelvváltó gomb stílusát
 */
function updateActiveButton() {
    selectors.langButtons.forEach(button => {
        if (button.getAttribute('data-lang') === currentLang) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

/**
 * Nyelv váltása
 * @param {string} lang - A választott nyelv
 */
function changeLanguage(lang) {
    if (lang === currentLang) return; // Ne töltsük be újra, ha már ez az aktív
    
    currentLang = lang;
    localStorage.setItem('preferredLang', lang); // Elmentjük a választást
    fetchLanguageData(lang);
}

/**
 * Észleli a böngésző vagy a mentett nyelvet
 */
function detectLanguage() {
    // 1. Van-e mentett választás?
    const savedLang = localStorage.getItem('preferredLang');
    if (savedLang) {
        currentLang = savedLang;
        return;
    }

    // 2. Böngésző nyelvének ellenőrzése
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang && browserLang.startsWith('en')) {
        currentLang = 'en';
    } else {
        currentLang = 'hu'; // Alapértelmezett a magyar
    }
}

// === INICIALIZÁLÁS ===
// Várjuk, amíg a DOM betöltődik
document.addEventListener('DOMContentLoaded', () => {
    detectLanguage();
    fetchLanguageData(currentLang);
});