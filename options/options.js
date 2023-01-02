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
    for (command of commands) {
        if (command.name === commandName) {
            shortcutElem.value = command.shortcut;
        }
    }
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

/**
 * Update the UI when the page loads.
 */
document.addEventListener('DOMContentLoaded', updateUI);

function disableCheckbox() {
    if (showNotifications.checked) {
        repetitiveNotifications.disabled = false;
    } else {
        repetitiveNotifications.disabled = true;
    }
};

/**
 * Check Mail time
 */
browser.storage.local.get("checkMailTime").then(function (item) {
    checkMailTime.value = item.checkMailTime || 1;
});

checkMailTime.onchange = function (e) {
    browser.storage.local.set({ checkMailTime: this.value });
    msgUpdated();
}

/**
 * Show Notifications
 */
browser.storage.local.get("showNotifications").then(function (item) {
    if (item.showNotifications === undefined || item.showNotifications === true) {
        showNotifications.checked = true;
    }
});

showNotifications.onchange = function (e) {
    if (this.checked) {
        browser.storage.local.set({ showNotifications: true });
    } else {
        browser.storage.local.set({ showNotifications: false });
    }
    disableCheckbox();
    msgUpdated();
};

/**
 * Repetitive Notifications
 */
browser.storage.local.get("repetitiveNotifications").then(function (item) {
    if (item.repetitiveNotifications === true) {
        repetitiveNotifications.checked = true;
    }
});

repetitiveNotifications.onchange = function (e) {
    if (this.checked) {
        browser.storage.local.set({ repetitiveNotifications: true });
    } else {
        browser.storage.local.set({ repetitiveNotifications: false });
    }
    msgUpdated();
};

document.addEventListener("DOMContentLoaded", function () { disableCheckbox(); }, false);

/**
 * Handle update and reset button clicks
 */
shortcutElem.addEventListener('focus', startCapturing);
shortcutElem.addEventListener('keydown', captureKey);
shortcutElem.addEventListener('keyup', updateShortcut);
resetElem.addEventListener('click', resetShortcut)