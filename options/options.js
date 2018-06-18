function onError(e) {
  console.error("***Error: " + e);
};

function disableCheckbox () {
  if(document.querySelector("#showNotifications").checked) {
    document.querySelector("#repetitiveNotifications").disabled = false;
  } else {
    document.querySelector("#repetitiveNotifications").disabled = true;
  }
};

//
// Check Mail time
//
browser.storage.local.get("checkMailTime").then(function(item){
	document.querySelector("#checkMailTime").value = item.checkMailTime || 1;
});

document.querySelector("#checkMailTime").onchange = function(e) {
  browser.storage.local.set({ checkMailTime: this.value });
}

//
// Show Notifications
//
browser.storage.local.get("showNotifications").then(function(item){
	if (item.showNotifications === undefined || item.showNotifications === true) {
		document.querySelector("#showNotifications").checked = true;
  }
});

document.querySelector("#showNotifications").onchange = function(e) {
	if (this.checked) {
		browser.storage.local.set({ showNotifications: true });
	} else {
		browser.storage.local.set({ showNotifications: false });
  }
  disableCheckbox();
};

//
// Repetitive Notifications
//
browser.storage.local.get("repetitiveNotifications").then(function(item){
	if (item.repetitiveNotifications === true) {
		document.querySelector("#repetitiveNotifications").checked = true;
  }
});

document.querySelector("#repetitiveNotifications").onchange = function(e) {
	if (this.checked) {
		browser.storage.local.set({ repetitiveNotifications: true });
	} else {
		browser.storage.local.set({ repetitiveNotifications: false });
	}
};

document.addEventListener("DOMContentLoaded", function () { disableCheckbox(); }, false);

const commandName = '_execute_browser_action';

/**
 * Update the UI: set the value of the shortcut textbox.
 */
async function updateUI() {
  let commands = await browser.commands.getAll();
  for (command of commands) {
    if (command.name === commandName) {
      document.querySelector('#shortcut').value = command.shortcut;
    }
  }
}

/**
 * Update the shortcut based on the value in the textbox.
 */
async function updateShortcut() {
  await browser.commands.update({
    name: commandName,
    shortcut: document.querySelector('#shortcut').value
  });
}

/**
 * Reset the shortcut and update the textbox.
 */
async function resetShortcut() {
  await browser.commands.reset(commandName);
  updateUI();
}

/**
 * Update the UI when the page loads.
 */
document.addEventListener('DOMContentLoaded', updateUI);

/**
 * Handle update and reset button clicks
 */
document.querySelector('#update').addEventListener('click', updateShortcut)
document.querySelector('#reset').addEventListener('click', resetShortcut)