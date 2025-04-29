/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 */

import { changePanel, accountSelect, database, Slider, config, setStatus, popup, appdata, setBackground } from '../utils.js'
const { ipcRenderer } = require('electron');
const os = require('os');

class Settings {
    static id = "settings";
    async init(config) {
        this.config = config;
        this.db = new database();
        this.navBTN()
        this.accounts()
        this.ram()
        this.javaPath()
        this.resolution()
        this.launcher()
    }

    navBTN() {
        document.querySelector('.nav-box').addEventListener('click', e => {
            if (e.target.classList.contains('nav-settings-btn')) {
                let id = e.target.id

                let activeSettingsBTN = document.querySelector('.active-settings-BTN')
                let activeContainerSettings = document.querySelector('.active-container-settings')

                if (id == 'save') {
                    if (activeSettingsBTN) activeSettingsBTN.classList.toggle('active-settings-BTN');
                    document.querySelector('#account').classList.add('active-settings-BTN');

                    if (activeContainerSettings) activeContainerSettings.classList.toggle('active-container-settings');
                    document.querySelector(`#account-tab`).classList.add('active-container-settings');
                    return changePanel('home')
                }

                if (activeSettingsBTN) activeSettingsBTN.classList.toggle('active-settings-BTN');
                e.target.classList.add('active-settings-BTN');

                if (activeContainerSettings) activeContainerSettings.classList.toggle('active-container-settings');
                document.querySelector(`#${id}-tab`).classList.add('active-container-settings');
            }
        })
    }

    accounts() {
        document.querySelector('.accounts-list').addEventListener('click', async e => {
            // Check if the click is on the delete account button
            const deleteBtn = e.target.closest('.delete-profile');
            if (deleteBtn) {
                let accountElement = deleteBtn.closest('.account');
                if (!accountElement) return;
                let accountId = accountElement.id;

                // Use built-in popup system for confirmation
                let confirmPopup = new popup();
                confirmPopup.openPopup({
                    title: t('confirm-title'),
                    content: `
                        <div class="confirm-content">
                            <p>${t('confirm-delete-account')}</p>
                            <div class="popup-buttons">
                                <button id="popup-confirm-btn" style="
                                    background: var(--element-color);
                                    color: white;
                                    border: none;
                                    padding: 0.5rem 1rem;
                                    margin: 0 0.5rem;
                                    border-radius: 5px;
                                    cursor: pointer;
                                ">${t('yes')}</button>
                                <button id="popup-cancel-btn" style="
                                    background: #777;
                                    color: white;
                                    border: none;
                                    padding: 0.5rem 1rem;
                                    margin: 0 0.5rem;
                                    border-radius: 5px;
                                    cursor: pointer;
                                ">${t('no')}</button>
                            </div>
                        </div>
                    `,
                    color: 'var(--color)'
                });
                
                let userConfirmed = await new Promise(resolve => {
                    document.getElementById("popup-confirm-btn").addEventListener("click", () => {
                        confirmPopup.closePopup();
                        resolve(true);
                    });
                    document.getElementById("popup-cancel-btn").addEventListener("click", () => {
                        confirmPopup.closePopup();
                        resolve(false);
                    });
                });
                if (!userConfirmed) return;
                
                try {
                    // First check how many accounts exist before deletion
                    let accountsBefore = await this.db.readAllData('accounts');
                    
                    // Delete the account from database and UI
                    await this.db.deleteData('accounts', accountId);
                    accountElement.remove();
                    
                    // Check if there are any accounts left after deletion
                    let configClient = await this.db.readData('configClient');
                    let accountsAfter = await this.db.readAllData('accounts');
                    
                    // If it was the selected account
                    if (configClient.account_selected === accountId) {
                        if (accountsAfter.length > 0) {
                            // Still have accounts, select first one
                            configClient.account_selected = accountsAfter[0].ID;
                            await this.db.updateData('configClient', configClient);
                            await accountSelect(accountsAfter[0]);
                            
                            // Show notification
                            let notificationPopup = new popup();
                            notificationPopup.openPopup({
                                title: t('account-deleted'),
                                content: t('another-account-selected'),
                                color: 'var(--color)'
                            });
                            setTimeout(() => notificationPopup.closePopup(), 3000);
                        } else {
                            // No accounts left
                            configClient.account_selected = null;
                            await this.db.updateData('configClient', configClient);
                            
                            // If it was the last account being deleted, handle specially
                            if (accountsBefore.length === 1) {
                                let closePopup = new popup();
                                closePopup.openPopup({
                                    title: t('no-accounts'),
                                    content: t('no-accounts-message'),
                                    color: 'var(--color)'
                                });
                                
                                // Actually close the window after a delay
                                window.setTimeout(() => {
                                    // Make sure we close the popup before closing the window
                                    closePopup.closePopup();
                                    ipcRenderer.send('main-window-close');
                                }, 3000);
                            }
                        }
                    } else {
                        // Removed account wasn't selected
                        let notificationPopup = new popup();
                        notificationPopup.openPopup({
                            title: t('account-deleted'),
                            content: t('account-deleted-success'),
                            color: 'var(--color)'
                        });
                        setTimeout(() => notificationPopup.closePopup(), 2000);
                    }
                } catch (err) {
                    console.error(err);
                }
                return;
            }
            
            // Handle regular account selection (unchanged)
            let accountElement = e.target.closest('.account');
            if (!accountElement) return;
            let id = accountElement.id;
            if (id === 'add') {
                document.querySelector('.cancel-home').style.display = 'inline';
                return changePanel('login');
            }
                
            let popupAccount = new popup();
            try {
                popupAccount.openPopup({
                    title: t('connection'),
                    content: t('please-wait'),
                    color: 'var(--color)'
                });
                let account = await this.db.readData('accounts', id);
                let configClient = await this.setInstance(account);
                await accountSelect(account);
                configClient.account_selected = account.ID;
                await this.db.updateData('configClient', configClient);
            } catch (err) {
                console.error(err);
            } finally {
                popupAccount.closePopup();
            }
        });
    }

    async setInstance(auth) {
        let configClient = await this.db.readData('configClient')
        let instanceSelect = configClient.instance_selct
        let instancesList = await config.getInstanceList()

        for (let instance of instancesList) {
            if (instance.whitelistActive) {
                let whitelist = instance.whitelist.find(whitelist => whitelist == auth.name)
                if (whitelist !== auth.name) {
                    if (instance.name == instanceSelect) {
                        let newInstanceSelect = instancesList.find(i => i.whitelistActive == false)
                        configClient.instance_selct = newInstanceSelect.name
                        await setStatus(newInstanceSelect.status)
                    }
                }
            }
        }
        return configClient
    }

    async ram() {
        let config = await this.db.readData('configClient');
        let totalMem = Math.trunc(os.totalmem() / 1073741824 * 10) / 10;
        let freeMem = Math.trunc(os.freemem() / 1073741824 * 10) / 10;

        document.getElementById("total-ram").textContent = `${totalMem} Go`;
        document.getElementById("free-ram").textContent = `${freeMem} Go`;

        let sliderDiv = document.querySelector(".memory-slider");
        sliderDiv.setAttribute("max", Math.trunc((80 * totalMem) / 100));

        let ram = config?.java_config?.java_memory ? {
            ramMin: config.java_config.java_memory.min,
            ramMax: config.java_config.java_memory.max
        } : { ramMin: "1", ramMax: "2" };

        if (totalMem < ram.ramMin) {
            config.java_config.java_memory = { min: 1, max: 2 };
            this.db.updateData('configClient', config);
            ram = { ramMin: "1", ramMax: "2" }
        };

        let slider = new Slider(".memory-slider", parseFloat(ram.ramMin), parseFloat(ram.ramMax));

        let minSpan = document.querySelector(".slider-touch-left span");
        let maxSpan = document.querySelector(".slider-touch-right span");

        minSpan.setAttribute("value", `${ram.ramMin} Go`);
        maxSpan.setAttribute("value", `${ram.ramMax} Go`);

        slider.on("change", async (min, max) => {
            let config = await this.db.readData('configClient');
            minSpan.setAttribute("value", `${min} Go`);
            maxSpan.setAttribute("value", `${max} Go`);
            config.java_config.java_memory = { min: min, max: max };
            this.db.updateData('configClient', config);
        });
    }

    async javaPath() {
        let javaPathText = document.querySelector(".java-path-txt")
        javaPathText.textContent = `${await appdata()}/${process.platform == 'darwin' ? this.config.dataDirectory : `.${this.config.dataDirectory}`}/runtime`;

        let configClient = await this.db.readData('configClient')
        let javaPath = configClient?.java_config?.java_path || t('use-launcher-java');
        let javaPathInputTxt = document.querySelector(".java-path-input-text");
        let javaPathInputFile = document.querySelector(".java-path-input-file");
        javaPathInputTxt.value = javaPath;

        document.querySelector(".java-path-set").addEventListener("click", async () => {
            javaPathInputFile.value = '';
            javaPathInputFile.click();
            await new Promise((resolve) => {
                let interval;
                interval = setInterval(() => {
                    if (javaPathInputFile.value != '') resolve(clearInterval(interval));
                }, 100);
            });

            if (javaPathInputFile.value.replace(".exe", '').endsWith("java") || javaPathInputFile.value.replace(".exe", '').endsWith("javaw")) {
                let configClient = await this.db.readData('configClient')
                let file = javaPathInputFile.files[0].path;
                javaPathInputTxt.value = file;
                configClient.java_config.java_path = file
                await this.db.updateData('configClient', configClient);
            } else alert("Le nom du fichier doit être java ou javaw");
        });

        document.querySelector(".java-path-reset").addEventListener("click", async () => {
            let configClient = await this.db.readData('configClient')
            javaPathInputTxt.value = t('use-launcher-java');
            configClient.java_config.java_path = null
            await this.db.updateData('configClient', configClient);
        });
    }

    async resolution() {
        let configClient = await this.db.readData('configClient')
        let resolution = configClient?.game_config?.screen_size || { width: 1920, height: 1080 };

        let width = document.querySelector(".width-size");
        let height = document.querySelector(".height-size");
        let resolutionReset = document.querySelector(".size-reset");

        width.value = resolution.width;
        height.value = resolution.height;

        width.addEventListener("change", async () => {
            let configClient = await this.db.readData('configClient')
            configClient.game_config.screen_size.width = width.value;
            await this.db.updateData('configClient', configClient);
        })

        height.addEventListener("change", async () => {
            let configClient = await this.db.readData('configClient')
            configClient.game_config.screen_size.height = height.value;
            await this.db.updateData('configClient', configClient);
        })

        resolutionReset.addEventListener("click", async () => {
            let configClient = await this.db.readData('configClient')
            configClient.game_config.screen_size = { width: '854', height: '480' };
            width.value = '854';
            height.value = '480';
            await this.db.updateData('configClient', configClient);
        })
    }

    async launcher() {
        let configClient = await this.db.readData('configClient');

        let maxDownloadFiles = configClient?.launcher_config?.download_multi || 5;
        let maxDownloadFilesInput = document.querySelector(".max-files");
        let maxDownloadFilesReset = document.querySelector(".max-files-reset");
        maxDownloadFilesInput.value = maxDownloadFiles;

        maxDownloadFilesInput.addEventListener("change", async () => {
            let configClient = await this.db.readData('configClient')
            configClient.launcher_config.download_multi = maxDownloadFilesInput.value;
            await this.db.updateData('configClient', configClient);
        })

        maxDownloadFilesReset.addEventListener("click", async () => {
            let configClient = await this.db.readData('configClient')
            maxDownloadFilesInput.value = 5
            configClient.launcher_config.download_multi = 5;
            await this.db.updateData('configClient', configClient);
        })

        let themeBox = document.querySelector(".theme-box");
        let theme = configClient?.launcher_config?.theme || "auto";

        if (theme == "auto") {
            document.querySelector('.theme-btn-auto').classList.add('active-theme');
        } else if (theme == "dark") {
            document.querySelector('.theme-btn-sombre').classList.add('active-theme');
        } else if (theme == "light") {
            document.querySelector('.theme-btn-clair').classList.add('active-theme');
        }

        themeBox.addEventListener("click", async e => {
            if (e.target.classList.contains('theme-btn')) {
                let activeTheme = document.querySelector('.active-theme');
                if (e.target.classList.contains('active-theme')) return
                activeTheme?.classList.remove('active-theme');

                if (e.target.classList.contains('theme-btn-auto')) {
                    setBackground();
                    theme = "auto";
                    e.target.classList.add('active-theme');
                } else if (e.target.classList.contains('theme-btn-sombre')) {
                    setBackground(true);
                    theme = "dark";
                    e.target.classList.add('active-theme');
                } else if (e.target.classList.contains('theme-btn-clair')) {
                    setBackground(false);
                    theme = "light";
                    e.target.classList.add('active-theme');
                }

                let configClient = await this.db.readData('configClient')
                configClient.launcher_config.theme = theme;
                await this.db.updateData('configClient', configClient);
            }
        })

        let closeBox = document.querySelector(".close-box");
        let closeLauncher = configClient?.launcher_config?.closeLauncher || "close-launcher";

        if (closeLauncher == "close-launcher") {
            document.querySelector('.close-launcher').classList.add('active-close');
        } else if (closeLauncher == "close-all") {
            document.querySelector('.close-all').classList.add('active-close');
        } else if (closeLauncher == "close-none") {
            document.querySelector('.close-none').classList.add('active-close');
        }

        closeBox.addEventListener("click", async e => {
            if (e.target.classList.contains('close-btn')) {
                let activeClose = document.querySelector('.active-close');
                if (e.target.classList.contains('active-close')) return
                activeClose?.classList.toggle('active-close');

                let configClient = await this.db.readData('configClient')

                if (e.target.classList.contains('close-launcher')) {
                    e.target.classList.toggle('active-close');
                    configClient.launcher_config.closeLauncher = "close-launcher";
                    await this.db.updateData('configClient', configClient);
                } else if (e.target.classList.contains('close-all')) {
                    e.target.classList.toggle('active-close');
                    configClient.launcher_config.closeLauncher = "close-all";
                    await this.db.updateData('configClient', configClient);
                } else if (e.target.classList.contains('close-none')) {
                    e.target.classList.toggle('active-close');
                    configClient.launcher_config.closeLauncher = "close-none";
                    await this.db.updateData('configClient', configClient);
                }
            }
        })
    }
}
export default Settings;