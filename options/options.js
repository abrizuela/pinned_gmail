const commandName = '_execute_browser_action';
const shortcutElem = document.querySelector('#shortcut');
const resetElem = document.querySelector('#reset')
const updatedMessage = document.querySelector("#updatedMessage");
const errorMessage = document.querySelector("#errorMessage");
const showNotifications = document.querySelector("#showNotifications");
const repetitiveNotifications = document.querySelector("#repetitiveNotifications");
const checkMailTime = document.querySelector("#checkMailTime");

/**
 * Update the UI: set the value of the shortcut textbox.
 */
async function updateUI() {
    let commands = await browser.commands.getAll();
    for (let command of commands) {
        if (command.name === commandName) {
            shortcutElem.value = command.shortcut;
        }
    }
    disableCheckbox();
}

/**
 * Show (and hide) a message
 */
async function showMessage(elem) {
    elem.classList.replace("hidden", "shown");
    setTimeout(function () { elem.classList.replace("shown", "hidden"); }, 5000);
}

/**
 * Show and hide a message when the changes are saved
 */
async function msgUpdated() {
    showMessage(updatedMessage);
}

/**
 * Show an error message when the shortcut entered is invalid
 */
async function msgError() {
    showMessage(errorMessage);
}

/**
 * Update the shortcut based on the value in the textbox.
 */
async function updateShortcut() {
    if (endCaptureShortcut()) {
        await browser.commands.update({
            name: commandName,
            shortcut: shortcutElem.value
        });
        msgUpdated();
    } else {
        msgError();
    }
    updateUI();
    shortcutElem.blur();
}

/**
 * Reset the shortcut and update the textbox.
 */
async function resetShortcut() {
    await browser.commands.reset(commandName);
    updateUI();
    msgUpdated();
}

function disableCheckbox() {
    repetitiveNotifications.disabled = !showNotifications.checked;
};

/**
 * Check Mail time
 */
browser.storage.sync.get("checkMailTime").then(function (item) {
    checkMailTime.value = item.checkMailTime ??= 1;
});

checkMailTime.onchange = function (e) {
    browser.storage.sync.set({ checkMailTime: this.value });
    msgUpdated();
}

/**
 * Show Notifications
 */
browser.storage.sync.get("showNotifications").then(function (item) {
    showNotifications.checked = item.showNotifications ??= true;
});

showNotifications.onchange = function (e) {
    browser.storage.sync.set({ showNotifications: this.checked });
    disableCheckbox();
    msgUpdated();
};

/**
 * Repetitive Notifications
 */
browser.storage.sync.get("repetitiveNotifications").then(function (item) {
    repetitiveNotifications.checked = item.repetitiveNotifications;
});

repetitiveNotifications.onchange = function (e) {
    browser.storage.sync.set({ repetitiveNotifications: this.checked });
    msgUpdated();
};

/**
 * Update the UI when the page loads.
 */
document.addEventListener('DOMContentLoaded', updateUI);

/**
 * Handle update and reset button clicks
 */
shortcutElem.addEventListener('focus', startCapturing);
shortcutElem.addEventListener('keydown', captureKey);
shortcutElem.addEventListener('keyup', updateShortcut);
resetElem.addEventListener('click', resetShortcut)