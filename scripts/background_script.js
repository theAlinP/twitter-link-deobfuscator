"use strict";


let defaultAddonState = { enabled : true };    // default add-on state


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
 * @param {string} request.iframeLocationHref - The location of the iframe from
 * which the content script reached out to this script
 * @param {object} sender - An object passed to the function by the onMessage
 * listener providing details about the sender of the message
 * @param {function} sendResponse - A function passed to the function by the
 * onMessage listener providing a way to send a response to the sender
 */
//function handleMessage(request, sender, sendResponse) {    // for debugging
function handleMessage(request) {
  //console.log(request);    // for debugging
  //console.log(sender);    // for debugging
  //console.log(sendResponse);    // for debugging
  //console.log(`Iframe location href: ${request.iframeLocationHref}`);    // for debugging

  browser.tabs.query({currentWindow: true, active: true}).then( (tabs) => {    // get the active tab in the current window
    for (let tab of tabs) {    // loop through the array, which actually contains only one tab
      //console.log(tabs);    // for debugging
      browser.tabs.sendMessage(    /* send a message to the tab. It will reach all the listeners from the content script;
                                      from the parent window will be passed on to getIframeHrefFromBackgroundScript()
                                      and from ALL the iframes will be passed on to getOriginalDestinationFromBackgroundScript().
                                      Certain precautions need to be taken to ensure that it will be used by the right function
                                      from the right window hence the use of the "iframeLocationHref" and "to" methods
                                      and the checks inside the two functions from the content script. */
        tab.id,
        {to: "getIframeHrefFromBackgroundScript()",
          iframeLocationHref: request.iframeLocationHref}
      ).then(response => {
        //console.log(response);    // for debugging
        //console.log(sender);    // for debugging
        //console.log("Message from the content script:");    // for debugging
        //console.log(response.response);    // for debugging
        //console.log(`Original destination: ${response.originalDestination}`);    // for debugging
        browser.tabs.query({currentWindow: true, active: true}).then( (tabs) => {
          for (let tab of tabs) {
            browser.tabs.sendMessage(
              tab.id,
              {to: "getOriginalDestinationFromBackgroundScript()",
                iframeLocationHref: request.iframeLocationHref,
                originalDestination: response.originalDestination}
            /*).then(response => {
              console.log(response);
              console.log(sender);
            }*//*<=for debugging*/).catch(onMessageError);
          }
        }).catch(onMessageError);
      }).catch(onMessageError);
    }
  }).catch(() => {
    console.error("Error retrieving stored settings");
  });

  //sendResponse({response: "The iframe location href was received."});    // for debugging
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
