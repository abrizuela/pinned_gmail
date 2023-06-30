let currentTabId;
let currentWinId;
let gmailTabId;
let gmailWinId;
let previousTab;
let previousWin;
let previousUnreadMails = 0;

function onError(e) {
    console.log("***Error: " + e);
};

function setButtonIcon(imageURL) {
    try {
        browser.browserAction.setIcon({ path: imageURL });
    } catch (e) {
        onError(e);
    }
};

function createPinnedTab() {
    browser.tabs.create(
        {
            url: "https://mail.google.com",
            pinned: true,
            active: true
        }
    )
};

function handleSearch(gmailTabs) {
    //console.log("currentTabId: " + currentTabId);
    if (gmailTabs.length > 0) {
        //console.log("there is a gmail tab");
        gmailTabId = gmailTabs[0].id;
        gmailWinId = gmailTabs[0].windowId;
        if (gmailTabId === currentTabId) {
            //console.log("I'm in the gmail tab");
            browser.windows.update(previousWin, { focused: true, });
            browser.tabs.update(previousTab, { active: true, });
        } else {
            //console.log("I'm NOT in the gmail tab");
            previousTab = currentTabId;
            previousWin = currentWinId;
            browser.windows.update(gmailWinId, { focused: true, });
            browser.tabs.update(gmailTabId, { active: true, });
        }
        setButtonIcon(gmailTabs[0].favIconUrl);
    } else {
        //console.log("there is NO gmail tab");
        previousTab = currentTabId;
        previousWin = currentWinId;
        createPinnedTab();
    }
};

async function handleClick(tab) {
    //console.log("*********Button clicked*********");

    if (tab.id === undefined) {
        let activeTab = await browser.tabs.query({ currentWindow: true, active: true });
        tab = activeTab[0];
    };

    currentTabId = tab.id;
    currentWinId = tab.windowId;

    var querying = browser.tabs.query({ url: "*://mail.google.com/*" });
    querying.then(handleSearch, onError);
};

function setCheckMailTimeOut(checkMailTime) {
    setTimeout(
        function () {
            //console.log("corrio el timeout");
            var autoQuerying = browser.tabs.query({ url: "*://mail.google.com/*" });
            autoQuerying.then(checkMail, onError);
        },
        checkMailTime * //minutes
        60 *  //seconds
        1000 //miliseconds
    );
};

function showNotificationPopup(unreadMails) {
    content = "Unread email(s): " + unreadMails;
    browser.notifications.create({
        "type": "basic",
        "iconUrl": browser.runtime.getURL("icons/gmail-48.png"),
        "title": "Pinned Gmail",
        "message": content
    });
    browser.notifications.onClicked.addListener(handleClick);
}

function notificationHandler(unreadMails, showNotifications, repetitiveNotifications) {
    //var soundNotifications = false; //configurable
    if (showNotifications) {
        if (repetitiveNotifications) {
            showNotificationPopup(unreadMails);
            /*
            no sound notifications so far
            if(soundNotifications){
              console.log("play sound");
            };
            */
        } else {
            //console.log("previousUnreadMails: " + previousUnreadMails);
            //console.log("unreadMails: " + unreadMails);
            if (previousUnreadMails < unreadMails) {
                showNotificationPopup(unreadMails);
                /*
                no sound notifications so far
                if(soundNotifications){
                  console.log("play sound");
                };
                */
            };
        };
    };
    previousUnreadMails = unreadMails;
};

function checkMail(gmailTabs) {
    //console.log("*********checking mail*********");
    if (gmailTabs.length > 0) {
        //console.log("there is a gmail tab");
        var faviconTitle = gmailTabs[0].title;
        //console.log("favIconTitle: " + faviconTitle)
        if (!faviconTitle.includes(') - ')) {
            previousUnreadMails = 0;
            //console.log("there is 0 unread emails");
        } else {
            var unreadMails = faviconTitle.split('(')[1].split(')')[0];
            browser.storage.sync.get().then(function (item) {
                let showNotifications = item.showNotifications !== undefined ? item.showNotifications : true;
                let repetitiveNotifications = item.repetitiveNotifications !== undefined ? item.repetitiveNotifications : false;
                notificationHandler(unreadMails, showNotifications, repetitiveNotifications);
            });
            //console.log("there is " + unreadMails + " unread emails");
        };

        setButtonIcon(gmailTabs[0].favIconUrl)
    } else {
        //console.log("there is NO gmail tab");
    }
    browser.storage.sync.get("checkMailTime").then(function (item) {
        var checkMailTime = item.checkMailTime || 1;
        //console.log("checkMailTime: " + checkMailTime);
        setCheckMailTimeOut(checkMailTime);
    });
};

function update(details) {
    if (details.reason === "install" || details.reason === "update") {
        browser.runtime.openOptionsPage();
    }
};

browser.browserAction.onClicked.addListener(handleClick);
browser.runtime.onInstalled.addListener(update);

browser.storage.sync.get("checkMailTime").then(function (item) {
    var checkMailTime = item.checkMailTime || 1;
    setCheckMailTimeOut(checkMailTime);
});