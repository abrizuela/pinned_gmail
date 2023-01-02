let modifiers = ["Alt", "Ctrl", "Shift", "Command", "MacCtrl"];
let shortcut = document.querySelector("#shortcut");
let isValidShortcut;
let shortcutKeys;

function startCapturing() {
    //console.log("startCapturing");
    shortcutKeys = [];
    shortcut.value = '';
    isValidShortcut = true
}

function captureKey(event) {
    event.stopPropagation();
    event.preventDefault();

    keyStr = event.key == 'Control' ? 'Ctrl' : event.key

    switch (shortcutKeys.length) {
        case 0:
            modifiers.includes(keyStr) ? shortcutKeys.push(keyStr) : isValidShortcut = false;
            break;
        case 1:
            (modifiers.includes(keyStr) && keyStr != shortcutKeys[0]) || (event.keyCode >= 48 && event.keyCode <= 123) ? shortcutKeys.push(keyStr) : isValidShortcut = false;
            break
        case 2:
            modifiers.includes(shortcutKeys[1]) && event.keyCode >= 48 && event.keyCode <= 123 ? shortcutKeys.push(keyStr) : isValidShortcut = false;
            break
        default:
            console.log(`****Invalid shortcut****`);
            isValidShortcut = false;
            break;
    }
    console.log(`startCaptureShortcut: key: ${event.key}, keycode: ${event.keyCode}, array: ${shortcutKeys}, lenght ${shortcutKeys.length}`);
}

function endCaptureShortcut() {
    let shortcutValue;

    if (isValidShortcut && shortcutKeys.length > 1) {
        switch (shortcutKeys.length) {
            case 2:
                shortcutValue = `${shortcutKeys[0]}+${shortcutKeys[1].toUpperCase()}`;
                break;
            case 3:
                shortcutValue = `${shortcutKeys[0]}+${shortcutKeys[1]}+${shortcutKeys[2].toUpperCase()}`;
                break;
            default:
                isValidShortcut = false;
                break
        }
        console.log(`final value: ${shortcutValue}`);
        shortcut.value = shortcutValue;
    } else {
        isValidShortcut = false;
    }
    return isValidShortcut;
} 