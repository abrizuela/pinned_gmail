let currentTabId;
let gmailTabId;
let previousTab;
let previousUnreadMails = 0;

function onError(e) {
  console.log("***Error: " + e);
};

function setButtonIcon(imageURL) {
  try {
    browser.browserAction.setIcon({path: imageURL});
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
  if(gmailTabs.length > 0) {
    //console.log("there is a gmail tab");
    gmailTabId = gmailTabs[0].id;
    if(gmailTabId === currentTabId) {
      //console.log("I'm in the gmail tab");
      browser.tabs.update(previousTab, {active: true,});
    } else {
      //console.log("I'm NOT in the gmail tab");
      previousTab = currentTabId;
      browser.tabs.update(gmailTabId, {active: true,});
    }
    setButtonIcon(gmailTabs[0].favIconTitle);
  } else {
    //console.log("there is NO gmail tab");
    previousTab = currentTabId;
    createPinnedTab();
  }
};

function handleClick(tab) {
  //console.log("*********Button clicked*********");
  currentTabId = tab.id;
  var querying = browser.tabs.query({url: "*://mail.google.com/*"});
  querying.then(handleSearch, onError);
};

function setCheckMailTimeOut(checkMailTime) {
  setTimeout(
    function() {
      //console.log("corrio el timeout");
      var autoQuerying = browser.tabs.query({url: "*://mail.google.com/*"});
      autoQuerying.then(checkMail, onError);
    },
    checkMailTime* //minutes
    60*  //seconds
    1000 //miliseconds
  );
};

function showNotificationPopup(unreadMails){
  content = "Unread email(s): " + unreadMails;
  browser.notifications.create({
    "type": "basic",
    "iconUrl": browser.extension.getURL("icons/gmail-48.png"),
    "title": "Pinned Gmail",
    "message": content
  });
  browser.notifications.onClicked.addListener(handleClick);
}

function notificationHandler (unreadMails, showNotifications, repetitiveNotifications) {
  //var soundNotifications = false; //configurable
  if(showNotifications){
    if(repetitiveNotifications){
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
      if (previousUnreadMails < unreadMails){
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
  if(gmailTabs.length > 0) {
    //console.log("there is a gmail tab");
    var faviconTitle = gmailTabs[0].title;
    //console.log("favIconTitle: " + faviconTitle)
    if (!faviconTitle.includes(') - ')) {
      previousUnreadMails = 0;
      //console.log("there is 0 unread emails");
    } else {
      var unreadMails = faviconTitle.split('(')[1].split(')')[0];
      browser.storage.local.get().then(function(item){
        var showNotifications = true;
        if(item.showNotifications !== undefined) {
          showNotifications = item.showNotifications;
        }
        var repetitiveNotifications = false;
        if(item.repetitiveNotifications !== undefined) {
          repetitiveNotifications = item.repetitiveNotifications;
        }
        notificationHandler (unreadMails, showNotifications, repetitiveNotifications);
      });
      //console.log("there is " + unreadMails + " unread emails");
    };
    
    setButtonIcon(gmailTabs[0].favIconTitle)
  } else {
    //console.log("there is NO gmail tab");
  }
  browser.storage.local.get("checkMailTime").then(function(item){
    var checkMailTime = item.checkMailTime || 1;
    //console.log("checkMailTime: " + checkMailTime);
    setCheckMailTimeOut(checkMailTime);
  });
};

function update(details) {
  if (details.reason === "install" || details.reason === "update") {
    var opening = browser.runtime.openOptionsPage();
    opening.then(onOpened, onError);
  }
};

browser.browserAction.onClicked.addListener(handleClick);
browser.runtime.onInstalled.addListener(update);

browser.storage.local.get("checkMailTime").then(function(item){
  var checkMailTime = item.checkMailTime || 1;
  setCheckMailTimeOut(checkMailTime);
});