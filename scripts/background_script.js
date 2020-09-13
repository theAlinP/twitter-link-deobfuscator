"use strict";


/**
 * The namespace that will contain all the methods and properties
 * @namespace TLD_background
 */
var TLD_background = TLD_background || {};

/**
 * Properties of the namespace TLD_background
 * @property {object} config - The add-on settings
 * @property {object} config.defaultAddonState - The default state of the add-on
 * @property {boolean} config.defaultAddonState.enabled - This property determines
 * whether the add-on will be enabled or not
 * @property {object} config.badgeBackgroundColor - This property determines the
 * background color of the badge text
 * @memberof TLD_background
 */
TLD_background.config = TLD_background.config || {};
TLD_background.config.defaultAddonState = TLD_background.config.defaultAddonState || {};
TLD_background.config.defaultAddonState.enabled = true;    // default add-on state
TLD_background.config.badgeBackgroundColor = TLD_background.config.badgeBackgroundColor || {color: "green"};
//console.log(TLD_background);    // for debugging


/**
 * A function that changes the add-on's title
 * @method updateAddonTitle
 * @memberof TLD_background
 * @param {boolean} state - The title of the add-on icon will be changed based
 * on the value of this parameter
 */
TLD_background.updateAddonTitle = function(state) {
  //console.log(state);    // for debugging
  state ?
    browser.browserAction.setTitle({ title: browser.i18n.getMessage("enabledStateTitle")})
    :
    browser.browserAction.setTitle({ title: browser.i18n.getMessage("disabledStateTitle")});
};


/**
 * A function that changes the add-on's icon
 * @method updateAddonIcon
 * @memberof TLD_background
 * @param {boolean} state - The icon of the add-on will be changed based
 * on the value of this parameter
 */
TLD_background.updateAddonIcon = function(state) {
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
};


/**
 * A function that enables and disables the add-on
 * @method toggleStatus
 * @memberof TLD_background
 */
TLD_background.toggleStatus = function() {
  browser.storage.local.get()
    .then((storedSettings) => {
      if (storedSettings.enabled === true) {
        //console.log(`Old value: ${storedSettings.enabled}`);    // for debugging
        browser.storage.local.set({ enabled : false });
        //console.log("The add-on has been disabled.");    // for debugging
      } else {
        //console.log(`Old value: ${storedSettings.enabled}`);    // for debugging
        browser.storage.local.set({ enabled : true });
        //console.log("The add-on has been enabled.");    // for debugging
      }
      browser.storage.local.get()
        .then((storedSettings) => {
          //console.log(`New value: ${storedSettings.enabled}`);    // for debugging
          TLD_background.updateAddonTitle (storedSettings.enabled);
          TLD_background.updateAddonIcon (storedSettings.enabled);
        })
        .catch(() => {
          console.error("Error retrieving stored settings");
        });
    })
    .catch(() => {
      console.error("Error retrieving stored settings");
    });
};


/**
 * A function that communicates with the content script
 * @method handleMessage
 * @memberof TLD_background
 * @param {object} request - The message received from the content script
 * @param {object} sender - An object passed to the function by the onMessage
 * listener providing details about the sender of the message
 * @param {function} sendResponse - A function passed to the function by the
 * onMessage listener providing a way to send a response to the sender
 */
//TLD_background.handleMessage = function(request, sender, sendResponse) {    // for debugging
TLD_background.handleMessage = function(request, sender) {
  //console.log(request);    // for debugging
  //console.log(sender);    // for debugging
  //console.log(sendResponse);    // for debugging
  //console.log(`Iframe location href: ${sender.url}`);    // for debugging

  if (request.setBadge) {    // if the message was sent to increase the badge number...
    //console.log(sender.tab.id);    // for debugging
    /*let gettingBadgeText = browser.browserAction.getBadgeText({tabId: sender.tab.id});    // get the badge text
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
    ).catch(TLD_background.onMessageError);

    //sendResponse({response: "The message was received."});    // only useful if handleResponse() is called from notifyBackgroundScript()
  }
};


/**
 * A function that handles any messaging errors
 * @method onMessageError
 * @memberof TLD_background
 * @param {object} error - An object as defined by the browser
 */
TLD_background.onMessageError = function(error) {
  //console.error(error);    // for debugging
  console.error(`Error: ${error.message}`);
};


/**
 * A function that intercepts and modifies the network requests
 * @method interceptNetworkRequests
 * @memberof TLD_background
 * @param {object} requestDetails - An object passed over by the event listener
 */
TLD_background.interceptNetworkRequests = function(requestDetails) {
  //console.log(`Loading: " ${requestDetails.url}`);    // for debugging
  browser.storage.local.get().then((storedSettings) => {
    if (storedSettings.enabled === true) {
      browser.tabs.query({discarded: false, url: "*://*.twitter.com/*"}).then((tabs) => {
        //console.log(tabs);    // for debugging
        tabs.forEach(tab => {
          //console.log(tab);    // for debugging
          if (tab.id !== requestDetails.tabId) {
            return;
          }
          let requestURL = new URL(requestDetails.url);
          //console.log(requestURL);    // for debugging
          let requestArray = requestURL.pathname.split("/");
          //console.log(requestArray);    // for debugging
          if (requestArray[requestArray.length - 2] === "conversation" ||
              requestArray[requestArray.length - 1] === "inbox_initial_state.json") {
            //console.log(requestDetails);    // for debugging
            let filter = browser.webRequest.filterResponseData(requestDetails.requestId);
            let decoder = new TextDecoder("utf-8");
            let encoder = new TextEncoder();
            let data = [];
            filter.ondata = event => {
              data.push(event.data);
            };
            filter.onstop = () => {
              let stringResponse = "";
              if (data.length == 1) {
                stringResponse = decoder.decode(data[0]);
              } else {
                for (let i = 0; i < data.length; i++){
                  let stream = (i == data.length - 1) ? false : true;
                  stringResponse += decoder.decode(data[i], {stream});
                }
              }
              //console.log(stringResponse);    // for debugging
              if (TLD_background.hasJsonStructure(stringResponse)) {
                //console.log(stringResponse);    // for debugging
                let jsonResponse = JSON.parse(stringResponse);
                //console.log(jsonResponse);    // for debugging
                if (jsonResponse.conversation_timeline) {
                  //console.log(jsonResponse.conversation_timeline.entries);    // for debugging
                  let conv_entries = jsonResponse.conversation_timeline.entries;
                  for (let entry of conv_entries) {
                    //console.log(entry);    // for debugging
                    //console.log(entry.message.message_data.text);    // for debugging
                    if (Object.prototype.hasOwnProperty.call(entry.message.message_data, "entities") &&
                      Object.prototype.hasOwnProperty.call(entry.message.message_data.entities, "urls")) {
                      //console.log(entry);    // for debugging
                      //console.log(entry.message.message_data.text);    // for debugging
                      let urls = entry.message.message_data.entities.urls;
                      /*for (let url of urls) {
                        //entry.message.message_data.text = entry.message.message_data.text.replace(url.url, url.expanded_url);
                        //console.log(entry.message.message_data.text);    // for debugging
                        url.url = url.expanded_url;
                        //console.log(url.url);    // for debugging
                        TLD_background.messageContentScript(requestDetails.tabId);    // send a message to the content script from the tab the network request was made
                      }    // uncloak the links from messages*/
                      if (Object.prototype.hasOwnProperty.call(entry.message.message_data, "attachment") &&
                          Object.prototype.hasOwnProperty.call(entry.message.message_data.attachment, "card")) {
                        let lastURL = urls[urls.length - 1];
                        //console.log(lastURL);    // for debugging
                        entry.message.message_data.attachment.card.url = lastURL.expanded_url;
                        entry.message.message_data.attachment.card.binding_values.card_url.string_value = lastURL.expanded_url;
                        TLD_background.messageContentScript(requestDetails.tabId);    // send a message to the content script from the tab the network request was made
                        //console.log(entry);    // for debugging
                      }    // uncloak the Twitter Cards from messages
                    }
                    //console.log(entry);    // for debugging
                  }
                } else if (jsonResponse.inbox_initial_state && jsonResponse.inbox_initial_state.entries) {
                  //console.log(jsonResponse.inbox_initial_state.entries);    // for debugging
                  let event_entries = jsonResponse.inbox_initial_state.entries;
                  for (let entry of event_entries) {
                    //console.log(entry);    // for debugging
                    //console.log(entry.message.message_data.text);    // for debugging
                    if (entry.message &&
                        Object.prototype.hasOwnProperty.call(entry.message.message_data, "entities") &&
                        Object.prototype.hasOwnProperty.call(entry.message.message_data.entities, "urls")) {
                      //console.log(entry);    // for debugging
                      //console.log(entry.message.message_data.text);    // for debugging
                      let urls = entry.message.message_data.entities.urls;
                      /*for (let url of urls) {
                        //entry.message.message_data.text = entry.message.message_data.text.replace(url.url, url.expanded_url);
                        //console.log(entry.message.message_data.text);    // for debugging
                        url.url = url.expanded_url;
                        //console.log(url.url);    // for debugging
                        TLD_background.messageContentScript(requestDetails.tabId);    // send a message to the content script from the tab the network request was made
                      }    // uncloak the links from messages*/
                      if (Object.prototype.hasOwnProperty.call(entry.message.message_data, "attachment") &&
                          Object.prototype.hasOwnProperty.call(entry.message.message_data.attachment, "card")) {
                        let lastURL = urls[urls.length - 1];
                        //console.log(lastURL);    // for debugging
                        entry.message.message_data.attachment.card.url = lastURL.expanded_url;
                        entry.message.message_data.attachment.card.binding_values.card_url.string_value = lastURL.expanded_url;
                        TLD_background.messageContentScript(requestDetails.tabId);    // send a message to the content script from the tab the network request was made
                        //console.log(entry);    // for debugging
                      }    // uncloak the Twitter Cards from messages
                    }
                    //console.log(entry);    // for debugging
                  }
                }
                //console.log(stringResponse);    // for debugging
                stringResponse = JSON.stringify(jsonResponse);    // the slashes from URLs and the emojis are no longer \ and Unicode-escaped
                //console.log(stringResponse);    // for debugging
              }
              //console.log(stringResponse);    // for debugging
              filter.write(encoder.encode(stringResponse));
              filter.close();
            };
          }
        });
      }, console.error);
    }
  });
};


/**
 * A function that checks if a string is a well-formed JSON structure
 * @method hasJsonStructure
 * @memberof TLD_background
 * @param {string} str - The string that should be checked if is valid JSON
 */
TLD_background.hasJsonStructure = function(str) {
  if (typeof str !== "string") return false;
  try {
    const result = JSON.parse(str);
    const type = Object.prototype.toString.call(result);
    return type === "[object Object]" 
      || type === "[object Array]";
  } catch (err) {
    return false;
  }
};


/**
 * A function that messages the content script when a link is cleaned
 * @method messageContentScript
 * @memberof TLD_background
 * @param {number} tabID - The ID of the tab that should have its badge updated
 */
TLD_background.messageContentScript = function(tabID) {
  //console.log(tabID);    // for debugging
  browser.tabs.sendMessage(
    tabID,
    {}
  ).catch(TLD_background.onMessageError);
};



/**
 * Initialize the add-on
 */
// Set the background color of the badge text
browser.browserAction.setBadgeBackgroundColor(TLD_background.config.badgeBackgroundColor);

// Set the initial add-on state
browser.storage.local.set(TLD_background.config.defaultAddonState)    // initialize the storage with the default value
  /*.then(() => {    // ...then log the stored value
    console.log("The default value was stored.");    // for debugging
    browser.storage.local.get()
      .then((storedSettings) => {
        console.log(`The initial value is: ${storedSettings.enabled}`);    // for debugging
      })
      .catch(() => {
        console.error("Error retrieving stored settings");
      });
  })    // for debugging
  */.catch(() => {
    console.error("Error storing the default value.");
  });


/**
 * Add some event listeners
 */
/*browser.storage.onChanged.addListener((newSettings) => {    // log the new value every time it changes
  browser.tabs.query({}).then(console.log(`The value was changed to ${newSettings.enabled.newValue}`));
});*/    // for debugging
browser.browserAction.onClicked.addListener(TLD_background.toggleStatus);    // toggle the add-on status when the icon is clicked

browser.runtime.onMessage.addListener(TLD_background.handleMessage);    // listen for messages from the background script

browser.webRequest.onBeforeRequest.addListener(
  TLD_background.interceptNetworkRequests,
  {urls: ["*://*.twitter.com/*"]},
  ["blocking"]
);    // intercept the network responses from twitter.com
