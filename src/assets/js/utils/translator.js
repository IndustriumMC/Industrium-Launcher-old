/**
 * @author Votre nom
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 * Système de traduction pour FlazeSMP Launcher
 */

const fs = require('fs');
const path = require('path');

class Translator {
    constructor() {
        this.translations = {};
        this.defaultLanguage = 'en';
        this.currentLanguage = 'en';
        this.translationsPath = path.join(__dirname, '..', 'translations');
    }

    /**
     * Initialise le traducteur avec une langue spécifique ou détecte la langue de l'utilisateur
     * @param {string} lang - Code de langue (ex: 'en', 'fr')
     */
    async init(lang = null) {
        // Si aucune langue n'est spécifiée, essayer de la récupérer depuis la config
        if (!lang) {
            try {
                const { database } = await import('../utils.js');
                const db = new database();
                const configClient = await db.readData('configClient');
                
                if (configClient?.launcher_config?.language) {
                    lang = configClient.launcher_config.language;
                } else {
                    // Utiliser la langue du navigateur/système comme fallback
                    const systemLanguage = navigator.language || navigator.userLanguage;
                    lang = systemLanguage.split('-')[0]; // Récupérer le code de langue de base
                    
                    // Vérifier si un fichier de traduction existe pour cette langue
                    const langPath = path.join(this.translationsPath, `${lang}.json`);
                    if (!fs.existsSync(langPath)) {
                        lang = this.defaultLanguage;
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la détection de la langue :', error);
                lang = this.defaultLanguage;
            }
        }

        await this.loadLanguage(lang);
        return this;
    }

    /**
     * Charge le fichier de traduction pour la langue spécifiée
     * @param {string} lang - Code de langue (ex: 'en', 'fr')
     */
    async loadLanguage(lang) {
        try {
            const filePath = path.join(this.translationsPath, `${lang}.json`);
            
            if (!fs.existsSync(filePath)) {
                console.warn(`Fichier de traduction pour ${lang} introuvable, utilisation de ${this.defaultLanguage}`);
                lang = this.defaultLanguage;
                const defaultPath = path.join(this.translationsPath, `${this.defaultLanguage}.json`);
                this.translations = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
            } else {
                this.translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            }
            
            this.currentLanguage = lang;
            
            // Traduire le DOM après le changement de langue
            if (document.body) {
                this.translateDOM();
            }
            
            return true;
        } catch (error) {
            console.error(`Erreur lors du chargement de la langue ${lang}:`, error);
            return false;
        }
    }

    /**
     * Obtient la traduction pour une clé donnée
     * @param {string} key - Clé de traduction
     * @param {Object|Array} params - Paramètres optionnels pour les substitutions
     * @returns {string} - Texte traduit
     */
    translate(key, params = null) {
        if (!this.translations || !key) return key;
        
        let text = this.translations[key];
        if (!text) {
            console.warn(`Clé de traduction "${key}" introuvable dans ${this.currentLanguage}.json`);
            return key;
        }
        
        // Gestion des paramètres
        if (params) {
            // Gestion des paramètres sous forme de tableau (placeholders %1, %2)
            if (Array.isArray(params)) {
                params.forEach((value, index) => {
                    const placeholder = new RegExp(`%${index + 1}`, 'g');
                    text = text.replace(placeholder, value);
                });
            }
            // Gestion des paramètres sous forme d'objet (placeholders nommés)
            else if (typeof params === 'object') {
                Object.keys(params).forEach(param => {
                    // Remplacer les {{param}}
                    const templateRegex = new RegExp(`{{${param}}}`, 'g');
                    text = text.replace(templateRegex, params[param]);
                    
                    // Remplacer les %param
                    const placeholderRegex = new RegExp(`%${param}`, 'g');
                    text = text.replace(placeholderRegex, params[param]);
                });
            }
        }
        
        return text;
    }

    /**
     * Change la langue actuelle de l'application
     * @param {string} lang - Code de langue (ex: 'en', 'fr')
     */
    async setLanguage(lang) {
        const success = await this.loadLanguage(lang);
        
        if (success) {
            try {
                // Enregistrer la préférence de langue
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
                
                // Déclencher un événement pour informer l'application du changement de langue
                document.dispatchEvent(new CustomEvent('language-changed', { 
                    detail: { language: lang } 
                }));
            } catch (error) {
                console.error('Erreur lors de l\'enregistrement de la préférence de langue:', error);
            }
        }
        
        return success;
    }

    /**
     * Traduit tous les éléments du DOM avec des attributs data-i18n
     */
    translateDOM() {
        // Traduction de texte standard
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.translate(key);
        });
        
        // Traduction des placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.setAttribute('placeholder', this.translate(key));
        });
        
        // Traduction avancée avec paramètres
        document.querySelectorAll('[data-i18n-params]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (!key) return;
            
            try {
                const paramsStr = el.getAttribute('data-i18n-params');
                const params = JSON.parse(paramsStr);
                el.innerHTML = this.translate(key, params);
            } catch (error) {
                console.error(`Erreur lors de la traduction d'un élément avec paramètres:`, el, error);
            }
        });
    }
}

// Instance singleton pour tout le projet
const translator = new Translator();

/**
 * Fonction raccourcie pour obtenir une traduction
 * @param {string} key - Clé de traduction
 * @param {Object|Array} params - Paramètres pour les substitutions
 * @returns {string} - Texte traduit
 */
export function t(key, params = null) {
    return translator.translate(key, params);
}

/**
 * Initialise le système de traduction
 * @param {string} lang - Code de langue optionnel
 * @returns {Translator} - Instance du traducteur
 */
export async function initTranslator(lang = null) {
    await translator.init(lang);
    
    // Configurer la traduction du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => translator.translateDOM());
    } else {
        translator.translateDOM();
    }
    
    // Observer pour le contenu dynamique
    const observer = new MutationObserver(() => {
        translator.translateDOM();
    });
    
    // Commencer l'observation une fois le DOM prêt
    if (document.body) {
        observer.observe(document.body, { 
            childList: true, 
            subtree: true,
            attributes: false,
            characterData: false
        });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { 
                childList: true, 
                subtree: true,
                attributes: false,
                characterData: false
            });
        });
    }
    
    // Rendre t() disponible globalement
    window.t = t;
    
    return translator;
}

/**
 * Change la langue de l'application
 * @param {string} lang - Code de langue (ex: 'en', 'fr')
 */
export async function setLanguage(lang) {
    return await translator.setLanguage(lang);
}

// Exporter le traducteur pour un usage avancé
export default translator;