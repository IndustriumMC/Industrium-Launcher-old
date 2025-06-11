/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 */

const { ipcRenderer, shell } = require('electron');
const pkg = require('../package.json');
const os = require('os');
import { config, database } from './utils.js';
import { runTolgee, t } from './tolgee.js';
const nodeFetch = require("node-fetch");

// Une seule initialisation
document.addEventListener('DOMContentLoaded', async () => {
    await runTolgee();
    new Splash();
});


class Splash {
    constructor() {
        this.splash = document.querySelector(".splash");
        this.splashMessage = document.querySelector(".splash-message");
        this.splashAuthor = document.querySelector(".splash-author");
        this.message = document.querySelector(".message");
        this.progress = document.querySelector(".progress");
        
        // Configuration du thème
        this.initTheme();
        
        // Commencer l'animation directement (pas besoin d'attendre DOMContentLoaded car on est déjà dans ce contexte)
        this.startAnimation();
    }

    async initTheme() {
        let databaseLauncher = new database();
        let configClient = await databaseLauncher.readData('configClient');
        let theme = configClient?.launcher_config?.theme || "auto";
        let isDarkTheme = await ipcRenderer.invoke('is-dark-theme', theme).then(res => res);
        document.body.className = isDarkTheme ? 'dark global' : 'light global';
        if (process.platform == 'win32') ipcRenderer.send('update-window-progress-load');
    }

    async startAnimation() {
        // Utiliser les clés de traduction pour les messages splash
        let splashes = [
            { "message": t("startanimation1-text"), "author": t("startanimation1-author") },
            { "message": t("startanimation2-text"), "author": t("startanimation2-author") },
            { "message": t("startanimation3-text"), "author": t("startanimation3-author") }
        ];
        
        let splash = splashes[Math.floor(Math.random() * splashes.length)];
        this.splashMessage.textContent = splash.message;
        this.splashAuthor.children[0].textContent = "@" + splash.author;
        await sleep(100);
        document.querySelector("#splash").style.display = "block";
        await sleep(500);
        this.splash.classList.add("opacity");
        await sleep(500);
        this.splash.classList.add("translate");
        this.splashMessage.classList.add("opacity");
        this.splashAuthor.classList.add("opacity");
        this.message.classList.add("opacity");
        await sleep(1000);
        this.checkUpdate();
    }

    async checkUpdate() {
        // Utiliser t() pour toutes les chaînes de texte
        this.setStatus(t("checkupdate-setstatus"));

        ipcRenderer.invoke('update-app').then().catch(err => {
            return this.shutdown(t("checkupdate-updateapp") + `<br>${err.message}`);
        });

        ipcRenderer.on('updateAvailable', () => {
            this.setStatus(t("checkupdate-updateavailable"));
            if (os.platform() == 'win32') {
                this.toggleProgress();
                ipcRenderer.send('start-update');
            }
            else return this.dowloadUpdate();
        });

        ipcRenderer.on('error', (event, err) => {
            if (err) return this.shutdown(`${err.message}`);
        });

        ipcRenderer.on('download-progress', (event, progress) => {
            ipcRenderer.send('update-window-progress', { progress: progress.transferred, size: progress.total })
            this.setProgress(progress.transferred, progress.total);
        });

        ipcRenderer.on('update-not-available', () => {
            console.error(t("checkupdate-updatenotavailable"));
            this.maintenanceCheck();
        });
    }

    async dowloadUpdate() {
        this.setStatus(t("checkupdate-updateavailable") + `<br><div class="download-update">${t("checkupdate-downloadupdate")}</div>`);
        document.querySelector(".download-update").addEventListener("click", () => {
            shell.openExternal(latest.browser_download_url);
            return this.shutdown(t("checkupdate-downloadupdate"));
        });
    }

    async maintenanceCheck() {
        config.GetConfig().then(res => {
            if (res.maintenance) return this.shutdown(res.maintenance_message);
            this.startLauncher();
        }).catch(e => {
            console.error(e);
            return this.shutdown(t("checkupdate-nointernet"));
        });
    }

    startLauncher() {
        this.setStatus(t("startlauncher"));
        ipcRenderer.send('main-window-open');
        ipcRenderer.send('update-window-close');
    }

    shutdown(text) {
        this.setStatus(`${text}<br>${t("shutdown")}`);
        let i = 4;
        setInterval(() => {
            // Utiliser t() avec paramètre pour le compte à rebours
            this.setStatus(`${text}<br>${t("shutdown-in", [i--])}`);
            if (i < 0) ipcRenderer.send('update-window-close');
        }, 1000);
    }

    setStatus(text) {
        this.message.innerHTML = text;
    }

    toggleProgress() {
        if (this.progress.classList.toggle("show")) this.setProgress(0, 1);
    }

    setProgress(value, max) {
        this.progress.value = value;
        this.progress.max = max;
    }
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.keyCode == 73 || e.keyCode == 123) {
        ipcRenderer.send("update-window-dev-tools");
    }
});