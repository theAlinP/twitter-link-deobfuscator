"use strict";


/**
 * The namespace that will contain all the methods and properties
 * @namespace TLD
 */
var TLD = TLD || {};
//console.log(TLD);    // for debugging


/**
 * A function that communicates with the background script {@link boolean}
 * @method notifyBackgroundScript
 * @memberof TLD
 * @param {object} message - The message to be sent to the background script
 */
TLD.notifyBackgroundScript = function(message) {
  let sending = browser.runtime.sendMessage(message);
  sending.then(TLD.handleResponse, TLD.handleError);    // a response is received from the background script only if sendResponse is used
};


/**
 * A function that handles the responses coming from the background script
 * @method handleResponse
 * @memberof TLD
 * @param {object} message - The response received from the background script
 * after sending it a message from TLD.notifyBackgroundScript()
 * @param {string} message.response - The contents of the response
 */
/*TLD.handleResponse = function(message) {
  console.log("Response from the background script:");    // for debugging
  console.log(message);    // for debugging
};*/    // for debugging
TLD.handleResponse = function() {};


/**
 * A function that handles any messaging errors
 * @method handleError
 * @memberof TLD
 * @param {object} error - An object as defined by the browser
 */
TLD.handleError = function(error) {
  //console.error(error);    // for debugging
  console.error(`Error: ${error.message}`);
};


/**
 * A function that reveals the original values of the "href" attributes on pages built with React
 * @async
 * @method revealReactLinks
 * @memberof TLD
 * @param {HTMLDivElement} container - The element containing the tweets or
 * replies. It should be the type of element returned by getElementById() or
 * querySelector() or similar methods
 */
TLD.revealReactLinks = async function(container) {
  //console.log(container);    // for debugging
  let storedSettings = await browser.storage.local.get();    // check if the add-on is enabled
  //console.log(`The add-on state is: ${storedSettings.enabled}`);    // for debugging
  if (storedSettings.enabled === true) {    // clean the links only if the add-on is enabled
    let links = TLD.selectLinks(container);
    //console.log(links);    // for debugging
    TLD.uncloakLinks(links);
  }
};


/**
 * A function that cleans the links from the user description and the
 * "Website" link, on pages built with React, if there are any
 * @async
 * @method cleanReactWebsiteLink
 * @memberof TLD
 */
TLD.cleanReactWebsiteLink = async function() {
  let storedSettings = await browser.storage.local.get();    // check if the add-on is enabled
  //console.log(`The add-on state is: ${storedSettings.enabled}`);    // for debugging
  if (storedSettings.enabled !== true) {
    return;
  }    // don't clean the links if the add-on is not enabled
  let userDescription = document.querySelector("div[data-testid=\"UserDescription\"]");
  //console.log(userDescription);    // for debugging
  let userDescriptionLinks = TLD.selectLinks(userDescription);
  //console.log(userDescriptionLinks);    // for debugging
  TLD.uncloakLinks(userDescriptionLinks);
  let userProfileHeader = document.querySelector("div[data-testid=\"UserProfileHeader_Items\"]");
  //console.log(userProfileHeader);    // for debugging
  let userProfileHeaderLinks = TLD.selectLinks(userProfileHeader);
  //console.log(userProfileHeaderLinks);    // for debugging
  TLD.uncloakLinks(userProfileHeaderLinks);
};


/**
 * A function that listens for added tweets or replies on pages built with React
 * then cleans the links inside them
 * @method listenForReactTweetsAndReplies
 * @memberof TLD
 * @param {HTMLDivElement} container - The element containing the tweets or
 * replies. It should be the type of element returned by getElementById() or
 * querySelector() or similar methods
 */
TLD.listenForReactTweetsAndReplies = function(container) {
  //console.log(container);    // for debugging

  TLD.revealReactLinks(container);

  /**
   * Call TLD.revealReactLinks() every time new tweets or replies are added
   */
  TLD.tweetsAndRepliesContainerObserver = new MutationObserver(() => {
    //console.log("TLD.tweetsAndRepliesContainerObserver");    // for debugging
    TLD.revealReactLinks(container);
  });
  const tweetsAndRepliesContainerObserverConfig = {childList: true, subtree: false};
  TLD.tweetsAndRepliesContainerObserver.observe(container, tweetsAndRepliesContainerObserverConfig);
  TLD.tweetsAndRepliesContainerMOActive = true;
  //console.log(TLD.tweetsAndRepliesContainerObserver);
};


/**
 * A function that listens for added messages on pages built with React then
 * cleans the links inside them
 * @method listenForReactMessages
 * @memberof TLD
 * @param {HTMLDivElement} container - The element containing the messages. It
 * should be the type of element returned by getElementById() or
 * querySelector() or similar methods
 */
TLD.listenForReactMessages = function(container) {
  //console.log(container);    // for debugging

  TLD.revealReactLinks(container);

  /**
   * Call TLD.revealReactLinks() every time new messages are added
   */
  TLD.messagesContainerObserver = new MutationObserver(() => {
    //console.log("TLD.messagesContainerObserver");    // for debugging
    TLD.revealReactLinks(container);
  });
  const messagesContainerObserverConfig = {childList: true, subtree: true};
  TLD.messagesContainerObserver.observe(container, messagesContainerObserverConfig);
  TLD.messagesContainerDMBoxMOActive = true;
  //console.log(TLD.messagesContainerObserver);
};


/**
 * A function that detects what type of page was opened
 * @method detectPage
 * @memberof TLD
 * @returns {string} - Returns the type of page detected, or "unknown"
 * if TLD should not try to clean the page
 */
TLD.detectPage = function() {
  //console.log(window.location);    // for debugging
  let locationPathname = window.location.pathname;
  //console.log(locationPathname);    // for debugging

  if (/^\/[^/]+\/status\/.*/.test(locationPathname)) {
    if (/\/photo\/[0-9]+$/.test(locationPathname)) {
      //console.log("A photo was opened");    // for debugging
      return "photo";
    }
    //console.log("A tweet page was opened.");    // for debugging
    return "tweet";
  } else if (/^\/home\/*$/.test(locationPathname)) {
    //console.log("The home page was opened.");    // for debugging
    return "home";
  } else if (/^\/explore\/*$/.test(locationPathname)) {
    //console.log("The \"Explore\" page was opened.");    // for debugging
    return "explore";
  } else if (/^\/messages\/*$/.test(locationPathname)) {
    //console.log("The \"Messages\" page was opened.");    // for debugging
    return "messages";
  } else if (/^\/messages\/.+$/.test(locationPathname)) {
    //console.log("A conversation from the \"Messages\" page was opened.");    // for debugging
    return "conversation";
  } else if (/^\/search\/*$/.test(locationPathname)) {
    //console.log("A \"Search\" page was opened.");    // for debugging
    return "search";
  } else if (/^\/notifications(\/mentions)?$/.test(locationPathname)) {
    //console.log("A \"Notifications\" page was opened.");    // for debugging
    return "notifications";
  } else if (/\/i\/timeline\/*$/.test(locationPathname)) {
    //console.log("A tweet from the \"Notifications\" page was opened.");    // for debugging
    return "timeline";
  } else if (/\/i\/lists\/[0-9]+\/*$/.test(locationPathname)) {
    //console.log("A list from the \"Lists\" page was opened.");    // for debugging
    return "list";
  } else if (/\/i\/bookmarks\/*$/.test(locationPathname)) {
    //console.log("The \"Bookmarks\" page was opened.");    // for debugging
    return "bookmarks";
  } else if (/\/i\/events\/[0-9]+\/*$/.test(locationPathname)) {
    //console.log("An \"event\" page was opened.");    // for debugging
    return "event";
  } else if (/\/i\/topics\/[0-9]+\/*$/.test(locationPathname)) {
    //console.log("A \"Topics\" page was opened.");    // for debugging
    return "topics";
  } else if (/\/[^/]+\/*$/.test(locationPathname)) {
    let mainElement = document.body.querySelector("#react-root main");
    if (mainElement.querySelector("div[data-testid=\"UserDescription\"]")
    || mainElement.querySelector("div[data-testid=\"UserProfileHeader_Items\"]")) {
      //console.log("User description or profile header detected.");    // for debugging
      //console.log("A profile page was opened.");    // for debugging
      return "profile";
    }
  } else {
    //console.log("A unknown page was opened.");    // for debugging
    return "unknown";
  }
};


/**
 * A function that finds the Timeline on React pages
 * @method findReactTimeline
 * @memberof TLD
 * @returns {HTMLDivElement} - Returns the Timeline, or "null" if was not found
 */
TLD.findReactTimeline = function() {
  if (document.body.querySelector("#react-root main div[data-testid=\"primaryColumn\"] section > div[aria-label]")) {
    let timeline = document.body.querySelector("#react-root main div[data-testid=\"primaryColumn\"] section > div[aria-label]");
    //console.log(timeline);    // for debugging
    return timeline;
  } else {
    //console.log("The Timeline was not found");    // for debugging
    return null;
  }
};


/**
 * A function that sends a message to the background script to increase the
 * badge number shown on top of the icon
 * @method increaseBadgeNumber
 * @memberof TLD
 */
TLD.increaseBadgeNumber = function() {
  TLD.cleanedLinks += 1;
  TLD.notifyBackgroundScript({setBadge: (TLD.cleanedLinks).toString()});    // send a message to the background script to update the badge number
};


/**
 * A function that modifies the message box
 * @method modifyDMBox
 * @memberof TLD
 */
TLD.modifyDMBox = function() {
  let DMBox = document.querySelector("div[data-testid=\"DMDrawer\"]");
  //console.log(DMBox);    // for debugging
  let asideElement = DMBox.querySelector("aside");
  if (asideElement === null) return;
  //console.log(asideElement);    // for debugging
  let asideParent = asideElement.parentElement;
  //console.log(asideParent);    // for debugging
  let messageContainerContainer = asideParent.firstElementChild;
  //console.log(messageContainerContainer);    // for debugging
  let messageContainer = messageContainerContainer.querySelector(
    "div[style*='position'][style*='min-height']");
  //console.log(messageContainer);    // for debugging
  if (messageContainer !== null) TLD.revealReactLinks(messageContainer);
};


/**
 * A function that modifies the React pages
 * @method modifyReactPages
 * @memberof TLD
 */
TLD.modifyReactPages = function() {
  let mainElement = document.body.querySelector("#react-root main");
  //console.log(mainElement);    // for debugging
  TLD.mainObserver = new MutationObserver(() => {
    //console.log("TLD.mainObserver");    // for debugging
    if (TLD.lastCleanedPage === window.location.href) {
      return;
    }    // return if this page was already cleaned

    let tweetsContainer, tweetsAndRepliesContainers;    // declare some variables used in the case blocks

    /**
     * Clean the tweets or replies on the page which was opened initially
     */
    switch (TLD.detectPage()) {    // check what type of page was opened
    case "profile":    // if a profile page was opened...
      TLD.cleanReactWebsiteLink();
      // fall-through (no break statement)
    case "tweet":    // if a page with a tweet was opened...
    case "home":    // if the home page was opened...
    case "explore":    // if the "Explore" page was opened...
    case "search":    // if a "Search" page was opened...
    case "notifications":    // if a "Notifications" page was opened...
    case "timeline":    // if a tweet from the "Notifications" page was opened...
    case "list":    // if a list from the "Lists" page was opened...
    case "bookmarks":    // if the "Bookmarks" page was opened...
    case "event":    // if an "event" page was opened...
    case "topics":    // if a "Topics" page was opened...
      tweetsContainer = TLD.findReactTimeline()?.querySelector("div[style*='min-height']");
      if (tweetsContainer?.childElementCount > 1) {
        //console.log("The container with tweets or replies was found.");    // for debugging
        TLD.listenForReactTweetsAndReplies(tweetsContainer);    // listen for added tweets or replies and clean them
        TLD.lastCleanedPage = window.location.href;    // store the URL of this page which was just cleaned
      } else {    // if the Timeline can't be found or was deleted...
        //console.log("The Timeline was not found.");    // for debugging
        if (TLD.tweetsAndRepliesContainerMOActive === true) {
          TLD.tweetsAndRepliesContainerObserver.disconnect();
          TLD.tweetsAndRepliesContainerMOActive = false;
          delete TLD.tweetsAndRepliesContainerObserver;
        } else if (TLD.messagesContainerMOActive === true) {
          TLD.messagesContainerObserver.disconnect();
          TLD.messagesContainerMOActive = false;
          delete TLD.messagesContainerObserver;
        }
        TLD.lastCleanedPage = null;    // reset the property with the URL of the page which was last cleaned
      }
      //console.log(`TLD.lastCleanedPage: ${TLD.lastCleanedPage}`);    // for debugging
      break;
    case "messages":    // if the "Messages" page was opened...
      TLD.lastCleanedPage = null;    // reset the property with the URL of the page which was last cleaned
      //console.log(`TLD.lastCleanedPage: ${TLD.lastCleanedPage}`);    // for debugging
      break;
    case "conversation":    // if a message thread was opened...
      var sections = document.querySelectorAll("#react-root main section");
      TLD.listenForReactMessages(sections[sections.length - 1]);    // find the element with messages and clean them
      TLD.lastCleanedPage = window.location.href;    // store the URL of this page which was just cleaned
      //console.log(`TLD.lastCleanedPage: ${TLD.lastCleanedPage}`);    // for debugging
      break;
    case "photo":    // if a photo was opened...
      tweetsAndRepliesContainers = document.querySelectorAll("div.css-1dbjc4n [aria-label=\"Timeline: Conversation\"] > div[style*='min-height']");
      if (tweetsAndRepliesContainers.length > 0) {
        //console.log("The Timeline and/or the conversation container were found");    // for debugging
        tweetsAndRepliesContainers.forEach(container => {    // clean both the containers
          TLD.listenForReactTweetsAndReplies(container);    // listen for added tweets or replies and clean them
          TLD.lastCleanedPage = window.location.href;    // store the URL of this page which was just cleaned
        });
      }
      break;
    case "unknown":    // if a unknown page was opened...
      TLD.lastCleanedPage = null;    // reset the property with the URL of the page which was last cleaned
      //console.log(`TLD.lastCleanedPage: ${TLD.lastCleanedPage}`);    // for debugging
    }

    /**
     * Monitor the DM box on all the pages
     */
    //console.log(TLD.DMBoxMOActive);    // for debugging
    let DMBox = document.querySelector("div[data-testid=\"DMDrawer\"]");
    if (DMBox !== null && TLD.DMBoxMOActive === false) {
      //console.log(DMBox);    // for debugging
      TLD.modifyDMBox();
      TLD.DMBoxObserver = new MutationObserver(TLD.modifyDMBox);
      const DMBoxObserverConfig = {childList: true, subtree: true};
      TLD.DMBoxObserver.observe(DMBox, DMBoxObserverConfig);
      TLD.DMBoxMOActive = true;
    } else if (DMBox === null && TLD.DMBoxMOActive === true) {
      TLD.DMBoxObserver.disconnect();
      TLD.DMBoxMOActive = false;
      delete TLD.DMBoxObserver;
    }
  });
  const mainObserverConfig = {childList: true, subtree: true};
  TLD.mainObserver.observe(mainElement, mainObserverConfig);

  /**
   * Monitor all the pages for opened photos
   */
  let layersElement = document.querySelector("#react-root div#layers");
  if (layersElement) {
    TLD.layersObserver = new MutationObserver(() => {
      if (TLD.lastCleanedPage === window.location.href) {
        return;
      }    // return if this page was already cleaned

      let tweetsAndRepliesContainer = layersElement.querySelector("div.css-1dbjc4n [aria-label=\"Timeline: Conversation\"] > div[style*='min-height']");
      if (!tweetsAndRepliesContainer) {
        return;
      }
      //console.log("The conversation container was found");    // for debugging
      TLD.listenForReactTweetsAndReplies(tweetsAndRepliesContainer);    // listen for added tweets or replies and clean them
      TLD.lastCleanedPage = window.location.href;    // store the URL of this page which was just cleaned
    });
  }
  const layersObserverConfig = {childList: true, subtree: true};
  TLD.layersObserver.observe(layersElement, layersObserverConfig);
};


/**
 * A function that selects the text links
 * @method selectLinks
 * @memberof TLD
 * @param {HTMLDivElement} container - The element containing the text links. It
 * should be the type of element returned by getElementById() or
 * querySelector() or similar methods
 * @returns {NodeList} - Returns the list of text links found in the container
 */
TLD.selectLinks = function(container) {
  let links = container.querySelectorAll("a[title]");    // in case the links have "title" attributes
  if (links.length === 0) {
    links = container.querySelectorAll("a.css-4rbku5.css-18t94o4.css-901oao.css-16my406.r-1loqt21.r-poiln3.r-bcqeeo.r-qvutc0");
  }    // in case the links have no "title" attributes
  if (links.length === 0) {
    links = container.querySelectorAll("a.css-16my406.r-bcqeeo.r-qvutc0.css-901oao");
  }    // fallback in case the CSS classes of the links have been changed
  return links;
};


/**
 * A function that uncloaks the text links
 * @method uncloakLinks
 * @memberof TLD
 * @param {NodeList} links - The list of text links. It should be a NodeList
 * as the one returned by TLD.selectLinks()
 */
TLD.uncloakLinks = function(links) {
  if (links.length === 0) {
    return;
  }
  for (let link of links) {
    //for (let [index, link] of links.entries()) {    // for debugging
    //console.log(link);    // for debugging
    if (link.hostname !== "t.co" ||
      (link.hostname === "t.co" && link.pathname === "/")) {
      continue;
    }    // if the link is not in the form "t.co/abc", skip it
    /*console.log(`
${index + 1}.href:             ${link.href}
${index + 1}.title:            ${link.title}
${index + 1}.innerText:        ${link.innerText}`);*/    // for debugging
    link.setAttribute("data-shortened-url", link.href);
    if (link.hasAttribute("title")) {    // use the "title" attribute if the link has one
      link.href = link.title;
    } else {
      let linkHref = link.innerText;    // link.text and link.textContent works, too
      if (link.lastElementChild.innerText === "…") {
        //let linkHref = linkHref.substring(0, linkHref.length - 1);
        linkHref = linkHref.slice(0, -1);
      }    // if there is a trailing ellipsis character, remove it
      if (!/^[a-zA-Z0-9.+-]+:\/\//.test(linkHref)) {
        linkHref = `http://${linkHref}`;
      }    // add a protocol if there isn't one in the link text
      link.href = linkHref;
    }
    //console.log(link);    // for debugging
    TLD.increaseBadgeNumber();    // increase the number shown on top of the icon
  }
};



/**
 * Properties of the namespace TLD
 * @property {number} cleanedLinks - The number of links cleaned
 * @property {string} lastCleanedPage - The URL of the last cleaned page
 * @property {boolean} tweetsAndRepliesContainerMOActive - tweets_And_Replies_Container_MutationObserver_Active - shows
 * whether there is a MutationObserver attached to the tweets and replies container
 * @property {boolean} messagesContainerMOActive - messages_Container_MutationObserver_Active - shows
 * whether there is a MutationObserver attached to the message container
 * @property {boolean} DMBoxMOActive - DM_Box_MutationObserver_Active - shows
 * whether there is a MutationObserver attached to the message box
 * @memberof TLD
 */
TLD.cleanedLinks = 0;
TLD.lastCleanedPage;
TLD.tweetsAndRepliesContainerMOActive = false;
TLD.messagesContainerMOActive = false;
TLD.DMBoxMOActive = false;
//console.log(TLD);    // for debugging

browser.runtime.onMessage.addListener(() => {
  //console.log("A message was received from the background script.");    // for debugging
  TLD.increaseBadgeNumber();    // increase the number shown on top of the icon
});    // listen for messages from the background script and increase the badge number

if ( document.body.querySelector("#react-root div#layers") &&
  document.body.querySelector("#react-root main")) {
  //console.log("The main element was found.");    // for debugging
  TLD.modifyReactPages();
} else {
  TLD.bodyObserver = new MutationObserver(() => {
    //console.log("TLD.bodyObserver");    // for debugging
    if (!document.body.querySelector("#react-root div#layers") ||
      !document.body.querySelector("#react-root main")) {
      return;
    }    // return if the <main> element was not created yet
    //console.log("The main element was found.");    // for debugging
    TLD.bodyObserver.disconnect();
    delete TLD.bodyObserver;
    TLD.modifyReactPages();
  });
  const bodyObserverConfig = {childList: true, subtree: true};
  TLD.bodyObserver.observe(document.body, bodyObserverConfig);
}
