/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 */

const { ipcRenderer } = require('electron')
const { Status } = require('minecraft-java-core')
const fs = require('fs');
const pkg = require('../package.json');

import config from './utils/config.js';
import database from './utils/database.js';
import logger from './utils/logger.js';
import popup from './utils/popup.js';
import { skin2D } from './utils/skin.js';
import slider from './utils/slider.js';
import { t } from './utils/tolgee.js';

async function setBackground(theme) {
    if (typeof theme == 'undefined') {
        let databaseLauncher = new database();
        let configClient = await databaseLauncher.readData('configClient');
        theme = configClient?.launcher_config?.theme || "auto"
        theme = await ipcRenderer.invoke('is-dark-theme', theme).then(res => res)
    }
    let background
    let body = document.body;
    body.className = theme ? 'dark global' : 'light global';
    
    // Ajout de la classe glassmorphic au body
    body.classList.add('glassmorphic');
    
    if (fs.existsSync(`${__dirname}/assets/images/background/easterEgg`) && Math.random() < 0.005) {
        let backgrounds = fs.readdirSync(`${__dirname}/assets/images/background/easterEgg`);
        let Background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        background = `url(./assets/images/background/easterEgg/${Background})`;
    } else if (fs.existsSync(`${__dirname}/assets/images/background/${theme ? 'dark' : 'light'}`)) {
        let backgrounds = fs.readdirSync(`${__dirname}/assets/images/background/${theme ? 'dark' : 'light'}`);
        let Background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        
        // Ajout d'un dégradé plus subtil pour améliorer la visibilité des éléments
        background = `linear-gradient(rgba(${theme ? '20, 20, 20' : '255, 255, 255'}, 0.6), rgba(${theme ? '20, 20, 20' : '255, 255, 255'}, 0.4)), url(./assets/images/background/${theme ? 'dark' : 'light'}/${Background})`;
    }
    body.style.backgroundImage = background ? background : theme ? '#000' : '#fff';
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundAttachment = 'fixed';
}

async function changePanel(id) {
    let panel = document.querySelector(`.${id}`);
    let active = document.querySelector(`.active`)
    if (active) active.classList.toggle("active");
    panel.classList.add("active");
}

async function appdata() {
    return await ipcRenderer.invoke('appData').then(path => path)
}

async function addAccount(data) {
    let skin = false
    if (data?.profile?.skins[0]?.base64) skin = await new skin2D().creatHeadTexture(data.profile.skins[0].base64);
    let div = document.createElement("div");
    div.classList.add("account");
    div.id = data.ID;
    div.innerHTML = `
        <div class="profile-image" ${skin ? 'style="background-image: url(' + skin + ');"' : ''}></div>
        <div class="profile-infos">
            <div class="profile-pseudo">${data.name}</div>
            <div class="profile-uuid">${data.uuid}</div>
        </div>
        <div class="delete-profile" id="${data.ID}">
            <div class="icon-account-delete delete-profile-icon"></div>
        </div>
    `
    return document.querySelector('.accounts-list').appendChild(div);
}

async function accountSelect(data) {
    let account = document.getElementById(`${data.ID}`);
    let activeAccount = document.querySelector('.account-select')

    if (activeAccount) activeAccount.classList.toggle('account-select');
    account.classList.add('account-select');
    if (data?.profile?.skins[0]?.base64) headplayer(data.profile.skins[0].base64);
}

async function headplayer(skinBase64) {
    let skin = await new skin2D().creatHeadTexture(skinBase64);
    document.querySelector(".player-head").style.backgroundImage = `url(${skin})`;
}

let lastServerStatus = null;

// Add a variable to store the interval ID so we can clear it if needed
let statusUpdateInterval = null;

async function setStatus(opt) {
    let nameServerElement = document.querySelector('.server-status-name')
    let statusServerElement = document.querySelector('.server-status-text')
    let playersOnline = document.querySelector('.status-player-count .player-count')

    if (!opt) {
        statusServerElement.classList.add('red')
        statusServerElement.innerHTML = t('status-server-offline', [0]) 
        document.querySelector('.status-player-count').classList.add('red')
        playersOnline.innerHTML = '0'
        return
    }

    // Store options globally so they can be reused by the interval
    const serverOptions = opt;
    
    // Define the function that updates the server status
    async function updateServerStatus() {
        const { ip, port, nameServer } = serverOptions;
        nameServerElement.innerHTML = nameServer;
        let status = new Status(ip, port);
        let statusServer = await status.getStatus().then(res => res).catch(err => err);

        if (!statusServer.error) {
            statusServerElement.classList.remove('red')
            document.querySelector('.status-player-count').classList.remove('red')
            
            // Stocker les données comme attributs
            statusServerElement.setAttribute('data-ping', statusServer.ms);
            statusServerElement.setAttribute('data-online', 'true');
            
            statusServerElement.innerHTML = t('status-server-ping', [statusServer.ms])
            playersOnline.innerHTML = statusServer.playersConnect
        } else {
            statusServerElement.classList.add('red')
            
            statusServerElement.setAttribute('data-ping', '0');
            statusServerElement.setAttribute('data-online', 'false');
            
            statusServerElement.innerHTML = t('status-server-offline', [0])
            document.querySelector('.status-player-count').classList.add('red')
            playersOnline.innerHTML = '0'
        }
    }

    // Perform the first update immediately
    await updateServerStatus();
    
    // Clear any existing interval to avoid multiple intervals running
    if (statusUpdateInterval) {
        clearInterval(statusUpdateInterval);
    }
    
    // Set up automatic updates every 10 seconds (10000 ms)
    statusUpdateInterval = setInterval(updateServerStatus, 10000);
}

// Function to stop the status updates (call this when switching panels or closing the launcher)
function stopStatusUpdates() {
    if (statusUpdateInterval) {
        clearInterval(statusUpdateInterval);
        statusUpdateInterval = null;
    }
}

export {
    appdata as appdata,
    changePanel as changePanel,
    config as config,
    database as database,
    logger as logger,
    popup as popup,
    setBackground as setBackground,
    skin2D as skin2D,
    addAccount as addAccount,
    accountSelect as accountSelect,
    slider as Slider,
    pkg as pkg,
    setStatus as setStatus
}