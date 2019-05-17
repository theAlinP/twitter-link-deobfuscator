"use strict";


let defaultAddonState = { enabled : true };    // default add-on state


/**
 * Create a function that changes the add-on's title
 */
function updateAddonTitle (state) {
  state ?
    browser.browserAction.setTitle({ title: "Twitter Link Deobfuscator - ENABLED"})
    :
    browser.browserAction.setTitle({ title: "Twitter Link Deobfuscator - DISABLED"});
}


/**
 * Create a function that changes the add-on's icon
 */
function updateAddonIcon (state) {
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
 * Create a function that enables and disables the add-on
 */
function toggleStatus () {

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
 * Create a function that communicates with the content script
 */
//function handleMessage(request, sender, sendResponse) {    // for debugging
function handleMessage(request) {
  //console.log(request);    // for debugging
  //console.log(sender);    // for debugging
  //console.log(`Iframe location href: ${request.iframeLocationHref}`);    // for debugging

  browser.tabs.query({currentWindow: true, active: true}).then( (tabs) => {
    for (let tab of tabs) {
      browser.tabs.sendMessage(
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
 * Create a function that handles any messaging errors
 */
function onMessageError(error) {
  //console.error(`Error: ${error}`);
  console.error(`${error}`);
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
