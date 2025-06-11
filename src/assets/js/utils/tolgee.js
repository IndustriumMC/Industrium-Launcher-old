import { Tolgee, FormatSimple, BackendFetch, InContextTools } from '@tolgee/web';
const fs = require('fs');
const path = require('path');

let tg = null;
let fallback = {};
const DEFAULT_LANG = 'en';

function loadFallback(lang) {
    try {
        const file = path.join(__dirname, '..', 'translations', `${lang}.json`);
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch (_) {
        return {};
    }
}

export async function initTranslator(lang = DEFAULT_LANG) {
    fallback = loadFallback(lang);
    tg = Tolgee()
        .use(BackendFetch())
        .use(FormatSimple())
        .use(InContextTools())
        .init({
            apiKey: 'tgpak_gm2f62tmgrwgm3luou2xaodkovyxi2jvgz2tc2rrnn3goyy',
            apiUrl: 'https://translation.benzoogataga.com',
            language: lang,
            fallbackLanguage: DEFAULT_LANG,
            observerType: 'text',
            observerOptions: { inputPrefix: '{{', inputSuffix: '}}' }
        });

    try {
        await tg.run();
    } catch (e) {
        console.error('Tolgee failed to initialize, using local translations', e);
    } finally {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
    }

    document.title = tg.t('tolgee_example_title');
    tg.onLanguageChange.listen(() => {
        document.title = tg.t('tolgee_example_title');
    });

    window.t = t;
    return tg;
}

export async function setLanguage(lang) {
    fallback = loadFallback(lang);
    try {
        await tg.changeLanguage(lang);
    } catch (e) {
        console.error('Failed to change language via Tolgee', e);
    }
}

export function t(key, params) {
    if (tg) {
        try {
            return tg.t(key, params);
        } catch (e) {
            console.error('Tolgee translate error', e);
        }
    }
    let text = fallback[key] || key;
    if (params) {
        if (Array.isArray(params)) {
            params.forEach((val, idx) => {
                const re = new RegExp(`%${idx + 1}`, 'g');
                const re2 = new RegExp(`\\{${idx + 1}\\}`, 'g');
                text = text.replace(re, val).replace(re2, val);
            });
        } else {
            Object.keys(params).forEach(p => {
                const re = new RegExp(`%${p}`, 'g');
                const re2 = new RegExp(`\\{${p}\\}`, 'g');
                text = text.replace(re, params[p]).replace(re2, params[p]);
            });
        }
    }
    return text;
}

export default { initTranslator, setLanguage, t };
