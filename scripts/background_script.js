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
TLD_background.config.pathRegexPatterns = [
  "/inbox_initial_state.json$",    // if the JSON contains the initial batch of Direct Messages
  "/conversation/[0-9]+.json$",    // if the JSON contains replies to tweets
  "/conversation/[0-9]+-[0-9]+.json$",    // if the JSON contains additional Direct Messages
  "/user_updates.json$",    // if the JSON contains additional Direct Messages
  "/home.json$",    // if the JSON contains the initial or additional top tweets requested from the "Home" page
  "/home_latest.json$",    // if the JSON contains the initial or additional latest tweets requested from the "Home" page
  "/profile/[0-9]+.json$",    // if the JSON contains initial or additional tweets requested from a profile page
  "/graphql/.+[^/]/Conversation$",    // if a GraphQL API call is made to request replies to tweets
  "/adaptive.json$",    // if the JSON contains search results
  "/notifications/all.json$",    // if an API call is made to request notifications for the "Notifications" page
  "/notifications/mentions.json$",    // if an API call is made to request mentions for the "Notifications" page
  "/notifications/view/.+[^/].json$",    // if a tweet from the "Notifications" page was opened
  "/timeline/list.json$",    // if an API call is made to request tweets for the "Lists" page
  "/timeline/bookmark.json$",    // if an API call is made to request tweets for the "Bookmarks" page
  "/graphql/[a-zA-Z0-9_.+-]+/UserTweets$"    // if a GraphQL API call is made to request tweets from a profile page
];
TLD_background.pathRegex = new RegExp(TLD_background.config.pathRegexPatterns.join("|"), "i");
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
 * @async
 * @method toggleStatus
 * @memberof TLD_background
 */
TLD_background.toggleStatus = async function() {
  let storedSettings = await browser.storage.local.get();
  browser.storage.local.set({ enabled : !storedSettings.enabled });

  TLD_background.updateAddonTitle(!storedSettings.enabled);
  TLD_background.updateAddonIcon(!storedSettings.enabled);
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

  //console.log(sender.tab.id);    // for debugging
  /*let gettingBadgeText = browser.browserAction.getBadgeText({tabId: sender.tab.id});    // get the badge text
  gettingBadgeText.then(badgeText => { console.log(`Old badge text: ${badgeText}`); });    // log the badge text*/    // for debugging
  browser.browserAction.setBadgeText({text: request.setBadge, tabId: sender.tab.id});    // update the badge text
  //console.log(`The badge text has been updated to ${request.setBadge}.`);    // for debugging
  //sendResponse({response: `The badge text has been updated to ${request.setBadge}.`});    // only useful if handleResponse() is called from notifyBackgroundScript()
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
 * A function that intercepts the network requests
 * @async
 * @method interceptNetworkRequests
 * @memberof TLD_background
 * @param {object} requestDetails - An object passed over to the listener
 * function with detailed information about the request
 * @returns {object} - Returns a webRequest.StreamFilter object - or undefined
 */
TLD_background.interceptNetworkRequests = async function(requestDetails) {
  //console.log(`Loading: " ${requestDetails.url}`);    // for debugging
  let storedSettings = await browser.storage.local.get();
  var filter;
  if (storedSettings.enabled !== true) {
    return;
  }    // don't clean the links if the add-on is not enabled
  let tabs = await browser.tabs.query({discarded: false, url: "*://*.twitter.com/*"});
  //console.log(tabs);    // for debugging
  tabs.forEach(tab => {
    //console.log(tab);    // for debugging
    if (tab.id !== requestDetails.tabId) {
      return;
    }
    //console.log(requestDetails.url);    // for debugging
    let cleanUrl = requestDetails.url.replace(/\/?\?.*/, "");    // remove the last "/" and the query strings from the request URL
    //console.log(cleanUrl);    // for debugging
    if (!TLD_background.pathRegex.test(cleanUrl)) {
      return;
    }
    //console.log(requestDetails);    // for debugging
    filter = browser.webRequest.filterResponseData(requestDetails.requestId);
  });
  return filter;
};


/**
 * A function that modifies the network requests
 * @async
 * @method modifyNetworkRequests
 * @memberof TLD_background
 * @param {object} requestDetails - An object passed over to the listener
 * function with detailed information about the request
 */
TLD_background.modifyNetworkRequests = async function(requestDetails) {
  let filter = await TLD_background.interceptNetworkRequests(requestDetails);

  if (filter === undefined) {
    return;
  }

  let decoder = new TextDecoder("utf-8");
  let encoder = new TextEncoder();
  let data = [];
  filter.ondata = event => {
    data.push(event.data);
  };
  filter.onstop = () => {
    //console.log("The response will be modified");    // for debugging
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

    if (!TLD_background.hasJsonStructure(stringResponse)) {
      return;
    }

    //console.log(stringResponse);    // for debugging
    let jsonResponse = JSON.parse(stringResponse);
    //console.log(requestDetails.url);    // for debugging
    //console.log(jsonResponse);    // for debugging
    let msg_entries = jsonResponse?.inbox_initial_state?.entries ||
      jsonResponse?.conversation_timeline?.entries ||
      jsonResponse?.user_events?.entries;
    if (msg_entries) {    // if the JSON contains messages...
      TLD_background.cleanDirectMessages(msg_entries, requestDetails);
    } else if (jsonResponse?.globalObjects?.tweets) {    // if the JSON contains tweets...
      TLD_background.cleanRegularTweets(jsonResponse, requestDetails);
    } else if (jsonResponse?.data?.conversation_timeline?.instructions[0]) {    // if the JSON contains replies to tweets from a GraphQL API call...
      TLD_background.cleanGraphQLReplies(jsonResponse, requestDetails);
    } else if (jsonResponse?.data?.user?.result?.timeline?.timeline?.instructions[0]) {
      TLD_background.cleanProfileTweets(jsonResponse, requestDetails);
    }
    //console.log(stringResponse);    // for debugging
    stringResponse = JSON.stringify(jsonResponse);    // the slashes from URLs and the emojis are no longer \ and Unicode-escaped
    //console.log(stringResponse);    // for debugging
    //console.log(stringResponse);    // for debugging
    filter.write(encoder.encode(stringResponse));
    filter.close();
    //console.log("The response was modified successfully");    // for debugging
  };

  return;
};


/**
 * A function that checks if a string is a well-formed JSON structure
 * @method hasJsonStructure
 * @memberof TLD_background
 * @param {string} str - The string that should be checked if is valid JSON
 * @returns {boolean} - Returns true or false if the provided string
 * is valid JSON or not
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
 * A function that determines the Twitter Card's URL from the provided tweet
 * @method determineCardURL
 * @memberof TLD_background
 * @param {object} entry - An object containing a tweet
 * @returns {object} - Returns an object that is a property of the "entry"
 * argument which contains the original URL that should be used when
 * uncloaking the Twitter Card
 */
TLD_background.determineCardURL = function(entry) {
  let urls;
  if (entry?.message?.message_data?.entities?.urls) {
    urls = entry.message.message_data.entities.urls;
  } else if (entry?.entities?.urls) {
    urls = entry.entities.urls;
  } else if (entry?.item?.itemContent?.tweet?.legacy?.entities?.urls) {
    urls = entry.item.itemContent.tweet.legacy.entities.urls;
    if (urls.length === 0 &&
      entry.item.itemContent.tweet.legacy?.retweeted_status?.legacy?.entities?.urls) {
      urls = entry.item.itemContent.tweet.legacy.retweeted_status.legacy.entities.urls;
    }
  } else if (entry?.content?.itemContent?.tweet?.legacy?.entities?.urls) {
    urls = entry.content.itemContent.tweet.legacy.entities.urls;
  } else {
    return null;
  }
  //console.log(urls);    // for debugging
  if (urls.length === 0) {
    //console.error("No URLs found");    // for debugging
    return null;
  }
  let lastURL = urls[urls.length - 1];
  //console.log(lastURL);    // for debugging
  return lastURL;
};


/**
 * A function that restores a Twitter Card's original URL
 * @method uncloakTwitterCard
 * @memberof TLD_background
 * @param {object} entry - An object containing a tweet
 * @param {object} card - An object containing a Twitter Card
 * @param {number} tabId - The ID of the tab whose badge text must be updated
 */
TLD_background.uncloakTwitterCard = function(entry, card, tabId) {

  /**
   * Determine the Twitter Card's original URL
   */
  let lastURL = TLD_background.determineCardURL(entry);
  if (!lastURL) {
    return;
  }

  /**
   * Restore the original URL of the Twitter Card
   */
  let binding_values = card.binding_values || card?.legacy?.binding_values;
  if (Object.prototype.toString.call(
    binding_values) === "[object Array]") {
    for (let binding of binding_values) {
      if (binding.key === "card_url") {
        binding.value.string_value = lastURL.expanded_url;
      }
    }
  } else if (Object.prototype.toString.call(
    binding_values) === "[object Object]") {
    binding_values.card_url.string_value = lastURL.expanded_url;
  }

  /**
   * Update the badge text
   */
  TLD_background.messageContentScript(tabId);
};


/**
 * A function that uncloaks the Twitter Cards from Direct Messages
 * @method cleanDirectMessages
 * @memberof TLD_background
 * @param {array} msg_entries - An array containing Direct Messages
 * @param {object} requestDetails - An object passed over by the event listener
 */
TLD_background.cleanDirectMessages = function(msg_entries, requestDetails) {
  for (let entry of msg_entries) {
    //console.log(entry.message.message_data.text);    // for debugging
    if (!entry?.message?.message_data?.attachment?.card) {
      continue;
    }
    TLD_background.uncloakTwitterCard(entry, entry.message.message_data.attachment.card, requestDetails.tabId);
  }
};


/**
 * A function that uncloaks the Twitter Cards from tweets
 * @method cleanRegularTweets
 * @memberof TLD_background
 * @param {object} jsonResponse - A JSON containing tweets
 * @param {object} requestDetails - An object passed over by the event listener
 */
TLD_background.cleanRegularTweets = function(jsonResponse, requestDetails) {
  let tweet_entries = jsonResponse.globalObjects.tweets;
  for (let entry of Object.keys(tweet_entries)) {
    //console.log(tweet_entries[entry].full_text);    // for debugging

    /**
     * Detect if the tweet contains a poll, and if it does,
     * don't uncloak the Card, wich is in fact the poll itself.
     * It can be detected only if the user is not logged in
     */
    if (tweet_entries[entry]?.card?.binding_values?.choice1_count) {
      //console.log("This tweet contains a poll");    // for debugging
      continue;
    }

    if (!tweet_entries[entry]?.card) {
      continue;
    }
    TLD_background.uncloakTwitterCard(tweet_entries[entry], tweet_entries[entry].card, requestDetails.tabId);
  }
};


/**
 * A function that uncloaks the Twitter Cards from replies to tweets
 * from GraphQL API calls
 * @method cleanGraphQLReplies
 * @memberof TLD_background
 * @param {object} jsonResponse - A JSON containing replies to tweets
 * @param {object} requestDetails - An object passed over by the event listener
 */
TLD_background.cleanGraphQLReplies = function(jsonResponse, requestDetails) {
  let tweet_entries;
  if (jsonResponse.data.conversation_timeline.instructions[0]?.moduleItems) {
    tweet_entries = jsonResponse.data.conversation_timeline.instructions[0].moduleItems;
  } else if (jsonResponse.data.conversation_timeline.instructions[0]?.entries[0]?.content.items) {
    tweet_entries = jsonResponse.data.conversation_timeline.instructions[0].entries[0].content.items;
  } else {
    //console.log("No tweet entries were found");    // for debugging
    return;
  }
  for (let entry of tweet_entries) {
    //console.log(entry.item.itemContent.tweet.legacy.full_text);    // for debugging
    if (!entry.item.itemContent.tweet.legacy?.card) {
      continue;
    }
    TLD_background.uncloakTwitterCard(entry, entry.item.itemContent.tweet.legacy.card, requestDetails.tabId);
  }
};


/**
 * A function that uncloaks the Twitter Cards from tweets from profile pages
 * @method cleanProfileTweets
 * @memberof TLD_background
 * @param {object} jsonResponse - A JSON containing tweets
 * @param {object} requestDetails - An object passed over by the event listener
 */
TLD_background.cleanProfileTweets = function(jsonResponse, requestDetails) {
  /**
   * This code block is ran after a response to an API call like
   * "https://twitter.com/i/api/graphql/9u_4RUcGtdogbSPhyuMfmw/UserTweets"
   * containing tweets for profile pages, while logged in to Twitter.
   */

  if (!jsonResponse.data.user.result.timeline.timeline.instructions[0]?.entries) {
    return;
  }

  /**
   * Collect all the tweet entries into one array
   */
  let tweet_entries = jsonResponse.data.user.result.timeline.timeline.instructions[0].entries;
  if (jsonResponse.data.user.result.timeline.timeline?.instructions[1]) {
    tweet_entries.unshift(jsonResponse.data.user.result.timeline.timeline?.instructions[1].entry);
  }    // add the pinned tweet to the array of tweets

  for (let entry of tweet_entries) {

    /**
     * Uncloak the Twitter Cards from regular tweets
     */
    if (entry?.content?.itemContent?.tweet?.legacy?.card ||
      entry?.content?.itemContent?.tweet?.card) {
      let cardObject = entry?.content?.itemContent?.tweet?.legacy?.card ||
      entry?.content?.itemContent?.tweet?.card;
      TLD_background.uncloakTwitterCard(entry, cardObject, requestDetails.tabId);
    }

    /**
     * Uncloak the Twitter Cards from retweets
     */
    if (entry?.content?.itemContent?.tweet?.legacy?.retweeted_status?.legacy?.card ||
      entry?.content?.itemContent?.tweet?.legacy?.retweeted_status?.card) {
      let cardObject = entry?.content?.itemContent?.tweet?.legacy?.retweeted_status?.legacy?.card ||
      entry?.content?.itemContent?.tweet?.legacy?.retweeted_status?.card;
      TLD_background.uncloakTwitterCard(entry, cardObject, requestDetails.tabId);
    }

    /**
     * Uncloak the Twitter Cards from threads
     */
    if (entry?.content?.items) {
      for (let threadEntry of entry.content.items) {
        /*if (threadEntry?.item?.itemContent?.tweet?.legacy?.full_text) {
          console.log(threadEntry.item.itemContent.tweet.legacy.full_text);    // for debugging
        }*/

        /**
         * Uncloak the Twitter Cards from regular tweets
         */
        if (threadEntry?.item?.itemContent?.tweet?.legacy?.card ||
          threadEntry?.item?.itemContent?.tweet?.card) {
          let cardObject = threadEntry?.item?.itemContent?.tweet?.legacy?.card ||
          threadEntry?.item?.itemContent?.tweet?.card;
          TLD_background.uncloakTwitterCard(threadEntry, cardObject, requestDetails.tabId);
        }
      }
    }
  }
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
  TLD_background.modifyNetworkRequests,
  {urls: ["*://*.twitter.com/*"]},
  ["blocking"]
);    // intercept the network responses from twitter.com
