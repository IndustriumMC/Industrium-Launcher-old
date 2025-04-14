/**
 * @author BENZOOgataga
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 * Translation system for FlazeSMP Launcher
 */

const fs = require('fs');
const path = require('path');

class Translator {
    constructor() {
        this.translations = {};
        this.defaultLanguage = 'en';
        this.currentLanguage = 'en';
        // Path to translations folder - CORRECTED PATH
        this.translationsPath = path.join(__dirname, 'assets', 'translations');
        console.log("Translations path:", this.translationsPath);
        this.availableLanguages = [];
    }

    /**
     * Initialize the translator with specified language or detect user language
     * @param {string} lang - Language code (e.g. 'en', 'fr')
     */
    async init(lang = null) {
        try {
            await this.loadAvailableLanguages();
            
            if (!lang) {
                try {
                    const { database } = await import('../utils.js');
                    const db = new database();
                    const configClient = await db.readData('configClient');
                    
                    if (configClient?.launcher_config?.language) {
                        lang = configClient.launcher_config.language;
                    } else {
                        lang = this.defaultLanguage;
                    }
                } catch (error) {
                    console.error('Error during language selection:', error);
                    lang = this.defaultLanguage;
                }
            }
    
            await this.loadLanguage(lang);
            this.initLanguageSelector();
            return this;
        } catch (error) {
            console.error("Error while initialiazing launcher translation system:", error);
            await this.loadLanguage(this.defaultLanguage);
            return this;
        }
    }

    /**
     * Load list of available languages from translation files
     */
    async loadAvailableLanguages() {
        try {
            // Check if directory exists
            if (!fs.existsSync(this.translationsPath)) {
                console.error(`Translations directory not found: ${this.translationsPath}`);
                // Try alternative paths
                const altPaths = [
                    path.join(__dirname, '..', '..', 'translations'),
                    path.join(__dirname, '..', '..', '..', 'assets', 'translations')
                ];
                
                for (const altPath of altPaths) {
                    if (fs.existsSync(altPath)) {
                        console.log(`Found translations at alternative path: ${altPath}`);
                        this.translationsPath = altPath;
                        break;
                    }
                }
            }
            
            if (!fs.existsSync(this.translationsPath)) {
                throw new Error(`Could not find translations directory`);
            }
            
            const files = fs.readdirSync(this.translationsPath);
            this.availableLanguages = files
                .filter(file => file.endsWith('.json'))
                .map(file => {
                    const langCode = path.basename(file, '.json');
                    let langName = this.getLanguageName(langCode);
                    return { code: langCode, name: langName };
                });
            console.log("Available languages:", this.availableLanguages.map(l => l.code).join(", "));
        } catch (error) {
            console.error('Error loading available languages:', error);
            this.availableLanguages = [{ code: 'en', name: 'English' }];
        }
    }

    /**
     * Get language name from code
     * @param {string} langCode - Language code (e.g. 'en', 'fr')
     * @returns {string} - Language name
     */
    getLanguageName(langCode) {
        const languageNames = {
            'en': 'English',
            'fr': 'Français',
            'de': 'Deutsch',
            'es': 'Español',
            'it': 'Italiano',
            'pt': 'Português',
            'ru': 'Русский',
            'ja': '日本語',
            'ko': '한국어',
            'zh': '中文',
        };
        
        return languageNames[langCode] || langCode.toUpperCase();
    }

    /**
     * Initialize language selector in the interface
     */
    initLanguageSelector() {
        // Ensure DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._setupLanguageSelector());
        } else {
            this._setupLanguageSelector();
        }
    }

    /**
     * Set up language selector in the interface
     */
    _setupLanguageSelector() {
        const languageBtn = document.querySelector('.language-btn');
        const languageDropdown = document.querySelector('.language-dropdown');
        
        if (!languageBtn || !languageDropdown) {
            console.warn("Language selector elements not found in DOM");
            return;
        }
        
        // Update current language display
        const currentLangElement = document.querySelector('.current-language');
        if (currentLangElement) {
            currentLangElement.textContent = this.currentLanguage.toUpperCase();
        }
        
        // Clear existing dropdown
        languageDropdown.innerHTML = '';
        
        // Add available languages
        this.availableLanguages.forEach(lang => {
            const option = document.createElement('div');
            option.className = 'language-option';
            option.dataset.lang = lang.code;
            
            // Add flag (if available)
            const flag = document.createElement('img');
            flag.className = 'language-flag';
            flag.src = `assets/images/flags/${lang.code}.png`;
            flag.onerror = () => { flag.style.display = 'none'; };
            option.appendChild(flag);
            
            // Add language name
            const name = document.createElement('span');
            name.className = 'language-name';
            name.textContent = lang.name;
            option.appendChild(name);
            
            // Highlight active language
            if (lang.code === this.currentLanguage) {
                option.classList.add('active');
            }
            
            // Event handler to change language
            option.addEventListener('click', () => {
                console.log(`Changing language to: ${lang.code}`);
                this.setLanguage(lang.code).then(() => {
                    // Close dropdown after selection
                    languageDropdown.classList.remove('active');
                    // Update display
                    if (currentLangElement) {
                        currentLangElement.textContent = lang.code.toUpperCase();
                    }
                });
            });
            
            languageDropdown.appendChild(option);
        });
        
        // Event handler to open/close dropdown
        languageBtn.addEventListener('click', () => {
            languageDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking elsewhere
        document.addEventListener('click', (event) => {
            if (!languageBtn.contains(event.target) && !languageDropdown.contains(event.target)) {
                languageDropdown.classList.remove('active');
            }
        });
    }

    /**
     * Load translation file for the specified language
     * @param {string} lang - Language code (e.g. 'en', 'fr')
     */
    async loadLanguage(lang) {
        try {
            const filePath = path.join(this.translationsPath, `${lang}.json`);
            console.log(`Loading translation file: ${filePath}`);
            
            if (!fs.existsSync(filePath)) {
                console.warn(`Translation file for ${lang} not found, using ${this.defaultLanguage}`);
                lang = this.defaultLanguage;
                const defaultPath = path.join(this.translationsPath, `${this.defaultLanguage}.json`);
                
                if (!fs.existsSync(defaultPath)) {
                    throw new Error(`Default translation file not found: ${defaultPath}`);
                }
                
                // CORRECTED: Better JSON parsing with comment removal
                this.translations = this._safeLoadJsonFile(defaultPath);
            } else {
                // CORRECTED: Better JSON parsing with comment removal
                this.translations = this._safeLoadJsonFile(filePath);
            }
            
            console.log(`Language ${lang} loaded with ${Object.keys(this.translations).length} keys`);
            
            this.currentLanguage = lang;
            
            // Translate DOM after language change
            if (document.body) {
                this.translateDOM();
                
                // Update language selector display
                const currentLangElement = document.querySelector('.current-language');
                if (currentLangElement) {
                    currentLangElement.textContent = lang.toUpperCase();
                }
            }
            
            return true;
        } catch (error) {
            console.error(`Error loading language ${lang}:`, error);
            this.translations = this._getEmergencyTranslations();
            return false;
        }
    }

    /**
     * Safely load and parse a JSON file with comments
     * @param {string} filePath - Path to JSON file
     * @returns {Object} - Parsed JSON object
     */
    _safeLoadJsonFile(filePath) {
        try {
            // Read file content
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Remove the comment at the first line
            content = content.replace(/^\s*\/\/.*$/m, '');
            
            // Fix control characters in JSON - THIS IS THE KEY FIX
            content = this._fixControlCharactersInJson(content);
            
            // Handle JSON parsing with several fallback methods
            try {
                return JSON.parse(content);
            } catch (jsonError) {
                console.error("JSON parsing error:", jsonError);
                console.log("Error at approximately:", content.substring(Math.max(0, jsonError.position - 20), Math.min(content.length, jsonError.position + 20)));
                
                // Try with a multiline string hack
                try {
                    // Create a new Function that returns the JSON object
                    // This can handle some problematic JSON that JSON.parse can't
                    const jsonFunc = new Function(`return ${content}`);
                    return jsonFunc();
                } catch (funcError) {
                    console.error("Function parsing error:", funcError);
                }
                
                console.warn("Using emergency translations as fallback");
                return this._getEmergencyTranslations();
            }
        } catch (error) {
            console.error(`Error loading file ${filePath}:`, error);
            return this._getEmergencyTranslations();
        }
    }

    _fixControlCharactersInJson(jsonString) {
        // Process the text string by string to properly escape control characters
        let inString = false;
        let result = '';
        let stringStart = -1;
        
        for (let i = 0; i < jsonString.length; i++) {
            const char = jsonString[i];
            const prevChar = i > 0 ? jsonString[i - 1] : '';
            
            // Handle string boundaries
            if (char === '"' && prevChar !== '\\') {
                if (!inString) {
                    stringStart = i;
                    inString = true;
                    result += char;
                } else {
                    inString = false;
                    result += char;
                }
            } 
            // Handle control characters inside strings
            else if (inString && (char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) {
                // Replace actual control characters with their escaped versions
                switch (char) {
                    case '\n': result += '\\n'; break;
                    case '\r': result += '\\r'; break;
                    case '\t': result += '\\t'; break;
                    case '\b': result += '\\b'; break;
                    case '\f': result += '\\f'; break;
                    default:
                        // Use Unicode escape for other control characters
                        result += `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
                }
            } 
            // Copy everything else as is
            else {
                result += char;
            }
        }
        
        return result;
    }
    
    /**
     * Provide emergency translations in case loading fails
     * @returns {Object} - Emergency translations
     */
    _getEmergencyTranslations() {
        return {
            // Essential translations for the interface
            "play-btn": "Play",
            "launcher-popup-btn": "OK",
            "account-tab": "Player accounts",
            "add-text-profile": "Add an account",
            "login-title": "Login",
            "connect connect-home": "Connect",
            "cancel cancel-home": "Cancel",
            "login-text nickname": "Please enter your username",
            "login-placeholder-username": "Username",
            "settings-title": "Settings",
            "startlauncher": "Starting launcher...",
            "checkupdate-setstatus": "Checking for updates..."
        };
    }

    /**
     * Get translation for given key
     * @param {string} key - Translation key
     * @param {Object|Array} params - Optional parameters for substitutions
     * @returns {string} - Translated text
     */
    translate(key, params = null) {
        if (!this.translations || !key) {
            return key;
        }
        
        // Try different key variants
        const keyVariants = [
            key,                // Original key
            key.trim(),         // Without spaces at beginning and end
            key.replace(/\s+/g, ' ') // Normalize multiple spaces
        ];
        
        let text = null;
        
        // Try each variant
        for (const variant of keyVariants) {
            if (this.translations[variant] !== undefined) {
                text = this.translations[variant];
                break;
            }
        }
        
        // If no translation found
        if (text === null) {
            // Look for a key that contains our search key
            const possibleKeys = Object.keys(this.translations).filter(
                k => k.includes(key) || key.includes(k)
            );
            
            if (possibleKeys.length > 0) {
                // Use closest match
                text = this.translations[possibleKeys[0]];
            } else {
                return key; // As last resort, return the key itself
            }
        }
        
        // Handle parameters
        if (params) {
            // Array parameters (placeholders %1, %2)
            if (Array.isArray(params)) {
                params.forEach((value, index) => {
                    const placeholder = new RegExp(`%${index + 1}`, 'g');
                    text = text.replace(placeholder, value);
                });
            }
            // Object parameters (named placeholders)
            else if (typeof params === 'object') {
                Object.keys(params).forEach(param => {
                    // Replace {{param}}
                    const templateRegex = new RegExp(`{{${param}}}`, 'g');
                    text = text.replace(templateRegex, params[param]);
                    
                    // Replace %param
                    const placeholderRegex = new RegExp(`%${param}`, 'g');
                    text = text.replace(placeholderRegex, params[param]);
                });
            }
        }
        
        return text;
    }

    /**
     * Change current language of the application
     * @param {string} lang - Language code (e.g. 'en', 'fr')
     */
    async setLanguage(lang) {
        const success = await this.loadLanguage(lang);
        
        if (success) {
            this.translateDOM();
            
            try {
                const { database } = await import('../utils.js');
                const db = new database();
                const configClient = await db.readData('configClient');
                
                if (configClient) {
                    if (!configClient.launcher_config) {
                        configClient.launcher_config = {};
                    }
                    configClient.launcher_config.language = lang;
                    await db.updateData('configClient', configClient);
                }
                
                document.dispatchEvent(new CustomEvent('language-changed', { 
                    detail: { language: lang } 
                }));
            } catch (error) {
                console.error('Error while saving language preference:', error);
            }
        }
        
        return success;
    }

    /**
     * Translate all DOM elements with data-i18n attributes
     */
    translateDOM() {
        console.log(`Translating DOM (${Object.keys(this.translations).length} keys available)`);
        
        try {
            // FIXED: Forced update to ensure UI elements refresh
            // Standard text translation
            let count = 0;
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                const translation = this.translate(key);
                
                // Only update if translation exists and differs from current text
                if (translation !== key) {
                    el.textContent = translation;
                    count++;
                }
            });
            console.log(`Translated ${count} elements with data-i18n`);
            
            // Placeholder translation
            count = 0;
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                const translation = this.translate(key);
                
                if (translation !== key) {
                    el.setAttribute('placeholder', translation);
                    count++;
                }
            });
            console.log(`Translated ${count} elements with data-i18n-placeholder`);
            
            // Translation with parameters
            count = 0;
            document.querySelectorAll('[data-i18n-params]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (!key) return;
                
                try {
                    const paramsStr = el.getAttribute('data-i18n-params');
                    const params = JSON.parse(paramsStr);
                    const translation = this.translate(key, params);
                    
                    if (translation !== key) {
                        el.innerHTML = translation;
                        count++;
                    }
                } catch (error) {
                    console.error(`Error translating element with params:`, error);
                }
            });
            console.log(`Translated ${count} elements with data-i18n-params`);
            
            // FIXED: Force refresh on buttons, spans, and other common elements
            // This helps ensure any dynamic elements update properly
            ['button', 'span', 'div.title', 'h1, h2, h3, h4'].forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    if (el.dataset.i18n) {
                        const key = el.dataset.i18n;
                        const translation = this.translate(key);
                        if (translation !== key) {
                            el.textContent = translation;
                        }
                    }
                });
            });

            const statusElement = document.querySelector('.server-status-text');
            if (statusElement) {
                const ping = statusElement.getAttribute('data-ping') || "0";
                const isOnline = statusElement.getAttribute('data-online') === 'true';
                
                if (isOnline) {
                    statusElement.innerHTML = this.translate('status-server-ping', [ping]);
                } else {
                    statusElement.innerHTML = this.translate('status-server-offline', [0]);
                }
            }
        } catch (error) {
            console.error("Error translating DOM:", error);
        }
    }
}

// Singleton instance for the entire project
const translator = new Translator();

/**
 * Shorthand function to get a translation
 * @param {string} key - Translation key
 * @param {Object|Array} params - Parameters for substitutions
 * @returns {string} - Translated text
 */
export function t(key, params = null) {
    return translator.translate(key, params);
}

/**
 * Initialize the translation system
 * @param {string} lang - Optional language code
 * @returns {Translator} - Translator instance
 */
export async function initTranslator(lang = null) {
    try {
        await translator.init(lang);
        
        // Configure DOM translation
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                translator.translateDOM();
            });
        } else {
            translator.translateDOM();
        }
        
        // Observer for dynamic content
        const observer = new MutationObserver((mutations) => {
            // Check if new elements with data-i18n were added
            const hasTranslatableNodes = mutations.some(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.hasAttribute && (
                                node.hasAttribute('data-i18n') || 
                                node.querySelector('[data-i18n]') ||
                                node.hasAttribute('data-i18n-placeholder') ||
                                node.querySelector('[data-i18n-placeholder]'))) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            });
            
            // Only translate if necessary
            if (hasTranslatableNodes) {
                translator.translateDOM();
            }
        });
        
        // Start observation once DOM is ready
        if (document.body) {
            observer.observe(document.body, { 
                childList: true, 
                subtree: true,
                attributes: false
            });
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                observer.observe(document.body, { 
                    childList: true, 
                    subtree: true,
                    attributes: false
                });
            });
        }
        
        // Make t() available globally
        window.t = t;
        
        return translator;
    } catch (error) {
        console.error("Critical error initializing translator:", error);
        return translator; // Return translator anyway to avoid errors
    }
}

/**
 * Change application language
 * @param {string} lang - Language code (e.g. 'en', 'fr')
 */
export async function setLanguage(lang) {
    return await translator.setLanguage(lang);
}

// Export translator for advanced usage
export default translator;