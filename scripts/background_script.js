"use strict";


/**
 * The namespace that will contain all the methods and properties
 * @namespace TLD_background
 */
var TLD_background = TLD_background || {};
//console.log(TLD_background);    // for debugging


let defaultAddonState = { enabled : true };    // default add-on state
browser.browserAction.setBadgeBackgroundColor({"color": "green"});    // set the background of the badge text


/**
 * A function that changes the add-on's title
 * @function updateAddonTitle
 * @param {boolean} state - The title of the add-on icon will be changed based
 * on the value of this parameter
 */
function updateAddonTitle(state) {
  //console.log(state);    // for debugging
  state ?
    browser.browserAction.setTitle({ title: "Twitter Link Deobfuscator - ENABLED"})
    :
    browser.browserAction.setTitle({ title: "Twitter Link Deobfuscator - DISABLED"});
}


/**
 * A function that changes the add-on's icon
 * @function updateAddonIcon
 * @param {boolean} state - The icon of the add-on will be changed based
 * on the value of this parameter
 */
function updateAddonIcon(state) {
  //console.log(state);    // for debugging
  state ?
    browser.browserAction.setIcon({path: {
      "32": "icons/TLD_icon_enabled-32.png",
      "48": "icons/TLD_icon_enabled-48.png",
      "64": "icons/TLD_icon_enabled-64.png",
      "96": "icons/TLD_icon_enabled-96.png",
      "128": "icons/TLD_icon_enabled-128.png"
    }})
    :
    browser.browserAction.setIcon({path: {
      "32": "icons/TLD_icon_disabled-32.png",
      "48": "icons/TLD_icon_disabled-48.png",
      "64": "icons/TLD_icon_disabled-64.png",
      "96": "icons/TLD_icon_disabled-96.png",
      "128": "icons/TLD_icon_disabled-128.png"
    }});
}


/**
 * A function that enables and disables the add-on
 * @function toggleStatus
 */
function toggleStatus() {
  browser.storage.local.get()
    .then((storedSettings) => {
      if (storedSettings.enabled === true) {
        //console.log("Old value: " + storedSettings.enabled);    // for debugging
        browser.storage.local.set({ enabled : false });
        //console.log("The addon has been disabled.");    // for debugging
      } else {
        //console.log("Old value: " + storedSettings.enabled);    // for debugging
        browser.storage.local.set({ enabled : true });
        //console.log("The addon has been enabled.");    // for debugging
      }
      browser.storage.local.get()
        .then((storedSettings) => {
          //console.log("New value: " + storedSettings.enabled);    // for debugging
          updateAddonTitle (storedSettings.enabled);
          updateAddonIcon (storedSettings.enabled);
        })
        .catch(() => {
          console.error("Error retrieving stored settings");
        });
    })
    .catch(() => {
      console.error("Error retrieving stored settings");
    });
}


/**
 * A function that communicates with the content script
 * @function handleMessage
 * @param {object} request - The message received from the content script
 * @param {object} sender - An object passed to the function by the onMessage
 * listener providing details about the sender of the message
 * @param {function} sendResponse - A function passed to the function by the
 * onMessage listener providing a way to send a response to the sender
 */
//function handleMessage(request, sender, sendResponse) {    // for debugging
function handleMessage(request, sender) {
  //console.log(request);    // for debugging
  //console.log(sender);    // for debugging
  //console.log(sendResponse);    // for debugging
  //console.log(`Iframe location href: ${sender.url}`);    // for debugging

  if (request.setBadge) {    // if the message was sent to increase the badge number...
    /*var gettingBadgeText = browser.browserAction.getBadgeText({tabId: sender.tab.id});    // get the badge text
    gettingBadgeText.then(badgeText => { console.log(`Old badge text: ${badgeText}`); });    // log the badge text*/    //for debugging
    browser.browserAction.setBadgeText({text: request.setBadge, tabId: sender.tab.id});    // update the badge text
    //console.log(`The badge text has been updated to ${request.setBadge}.`);    // for debugging
    //sendResponse({response: `The badge text has been updated to ${request.setBadge}.`});    // only useful if handleResponse() is called from notifyBackgroundScript()
  } else {    // otherwise, the message must have been sent from the old layout
    browser.tabs.sendMessage(    /* send a message to the sender's tab. It will reach all the listeners from the content script;
                                    from the parent window will be passed on to findTwitterCardOriginalDestination()
                                    and from ALL the iframes will be passed on to restoreTwitterCardOriginalDestination().
                                    Certain precautions need to be taken to ensure that it will be used by the right function
                                    from the right window hence the use of the "iframeLocationHref" and "to" properties
                                    and the checks inside the two functions from the content script. */
      sender.tab.id, request
    ).catch(onMessageError);

    //sendResponse({response: "The message was received."});    // only useful if handleResponse() is called from notifyBackgroundScript()
  }
}


/**
 * A function that handles any messaging errors
 * @function onMessageError
 * @param {object} error - An object as defined by the browser
 */
function onMessageError(error) {
  //console.error(error);    // for debugging
  console.error(`Error: ${error.message}`);
}



browser.storage.local.get()    // get the current settings, then...
  .then((storedSettings) => {
    if (! storedSettings.enabled) {    // if there are no stored settings...
      browser.storage.local.set(defaultAddonState);    // initialize the storage with the default values
      //console.log ("The default value was stored.");    // for debugging
    }
  })
  .catch(() => {
    console.error("Error retrieving stored settings");
  });


// Log the stored value
/*browser.storage.local.get()
  .then((storedSettings) => {
    console.log("The initial value is: " + storedSettings.enabled);
  })
  .catch(() => {
    console.error("Error retrieving stored settings");
  });*/    // for debugging


/*browser.storage.onChanged.addListener((newSettings) => {    // log the new value everytime it changes
  browser.tabs.query({}).then(console.log("The value was changed to " + newSettings.enabled.newValue));
});*/    // for debugging
browser.browserAction.onClicked.addListener(toggleStatus);

browser.runtime.onMessage.addListener(handleMessage);    // listen for messages from the background script
