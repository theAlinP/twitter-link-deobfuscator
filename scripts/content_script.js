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
 * @method revealReactLinks
 * @memberof TLD
 * @param {HTMLDivElement} container - The element containing the tweets or
 * replies. It should be the type of element returned by getElementById() or
 * querySelector() or similar methods
 */
TLD.revealReactLinks = function(container) {
  //console.log(container);    // for debugging
  browser.storage.local.get()    // check if the add-on is enabled
    .then((storedSettings) => {
      //console.log(`The add-on state is: ${storedSettings.enabled}`);    // for debugging
      if (storedSettings.enabled === true) {    // clean the links only if the add-on is enabled
        //let links = document.querySelectorAll("#react-root main section > div[aria-label] > div > div > div a[title]");
        let links = container.querySelectorAll("a[title]");    // in case the links have "title" attributes
        //let links = container.querySelectorAll("a.css-16my406.r-ad9z0x.r-1qd0xha.r-bcqeeo.r-qvutc0.css-901oao");    // in case the links have no "title" attributes
        if (links.length === 0) {
          return;
        }
        //console.log(links);    // for debugging
        for (let link of links) {
        //for (let [index, link] of links.entries()) {    // for debugging
          if (link.hostname === "t.co" && link.pathname !== "/") {
            //console.log(link);    // for debugging
            //console.log(`link.pathname: ${link.pathname}`);    // for debugging
            /*console.log(`
${index + 1}.href:             ${link.href}
${index + 1}.title:            ${link.title}
${index + 1}.innerText:        ${link.innerText}`);*/    // for debugging
            link.setAttribute("data-shortened-url", link.href);
            if (link.hasAttribute("title")) {    // use the "title" attribute if the link has one
              link.href = link.title;
            } else {
              if (link.lastElementChild.innerText === "…") {
                let badURL = link.innerText;
                //let goodURL = badURL.substring(0, badURL.length - 1);
                let goodURL = badURL.slice(0, -1);
                link.href = goodURL;
              } else {
                link.href = link.innerText;
              }
            }
            //console.log(link);    // for debugging
            TLD.increaseBadgeNumber();    // increase the number shown on top of the icon
          }
        }
      }
    })
    .catch(() => {
      console.error("Error retrieving stored settings");
    });
};


/**
 * A function that cleans the links from the user description and the
 * "Website" link, on pages built with React, if there are any
 * @method cleanReactWebsiteLink
 * @memberof TLD
 */
TLD.cleanReactWebsiteLink = function() {
  browser.storage.local.get()    // check if the add-on is enabled
    .then((storedSettings) => {
      //console.log(`The add-on state is: ${storedSettings.enabled}`);    // for debugging
      if (storedSettings.enabled === true) {    // clean the links only if the add-on is enabled
        let userDescription = document.querySelector("div[data-testid=\"UserDescription\"]");
        //console.log(userDescription);    // for debugging
        let userProfileHeader = document.querySelector("div[data-testid=\"UserProfileHeader_Items\"]");
        //console.log(userProfileHeader);    // for debugging
        let links = userDescription.querySelectorAll("a[title]");    // in case the links have "title" attributes
        if (links.length === 0) {
          links = userDescription.querySelectorAll("a.css-16my406.r-ad9z0x.r-1qd0xha.r-bcqeeo.r-qvutc0.css-901oao");
        }    // in case the links have no "title" attributes
        //console.log(links);    // for debugging
        for (let link of links) {
          //console.log(link);    // for debugging
          if (link.hostname === "t.co") {
            link.setAttribute("data-shortened-url", link.href);
            if (link.hasAttribute("title")) {    // use the "title" attribute if the link has one
              link.href = link.title;
            } else {
              if (link.lastElementChild.innerText === "…") {
                let badURL = link.innerText;
                //let goodURL = badURL.substring(0, badURL.length - 1);
                let goodURL = badURL.slice(0, -1);
                link.href = goodURL;
              } else {
                link.href = link.innerText;
              }
            }
            //console.log(link);    // for debugging
            TLD.increaseBadgeNumber();    // increase the number shown on top of the icon
          }
        }
        links = userProfileHeader.querySelectorAll("a");
        //console.log(links);    // for debugging
        for (let link of links) {
          //console.log(link);    // for debugging
          link.setAttribute("data-shortened-url", link.href);
          link.href = `http://${link.text}`;
          //console.log(link);    // for debugging
          TLD.increaseBadgeNumber();    // increase the number shown on top of the icon
        }
      }
    })
    .catch(() => {
      console.error("Error retrieving stored settings");
    });
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
  const containerObserver = new MutationObserver(function() {
    //console.log("containerObserver");    // for debugging
    TLD.revealReactLinks(container);
  });
  const containerObserverConfig = {childList: true, subtree: false};
  containerObserver.observe(container, containerObserverConfig);
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
  const containerObserver = new MutationObserver(function() {
    //console.log("listenForReactMessages() containerObserver");    // for debugging
    TLD.revealReactLinks(container);
  });
  const containerObserverConfig = {childList: true, subtree: true};
  containerObserver.observe(container, containerObserverConfig);
};


/**
 * A function that detects what type of page was opened
 * @method detectPage
 * @memberof TLD
 * @returns {string} Returns the type of page detected, or "unknown"
 * if TLD should not try to clean the page
 */
TLD.detectPage = function() {
  //console.log(window.location);    // for debugging
  let locationPathname = window.location.pathname;
  //console.log(locationPathname);    // for debugging

  if (/^\/[^/]+\/status\/.*/.test(locationPathname)) {
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
  } else if (/\/[^/]+\/*$/.test(locationPathname)) {
    let mainElement = document.body.querySelector("#react-root main");
    if (mainElement.querySelector("div[data-testid=\"UserDescription\"]")
    || mainElement.querySelector("div[data-testid=\"UserProfileHeader_Items\"]")) {
      //console.log("User description or profile header detected.");    // for debugging
      //console.log("A profile page was opened.");    // for debugging
      return "profile";
    } else {
      //console.log("A unknown page was opened.");    // for debugging
      return "unknown";
    }
  }
};


/**
 * A function that finds the Timeline on React pages
 * @method findReactTimeline
 * @memberof TLD
 * @returns {HTMLDivElement} Returns the Timeline, or "null" if was not found
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
  //console.log(`TLD.increaseBadgeNumber() running from this window: ${window.location.href}`);    // for debugging
  if (TLD.cleanedLinks === undefined || TLD.cleanedLinks === null || TLD.cleanedLinks < 1) {
    TLD.cleanedLinks = 1;
  } else {
    TLD.cleanedLinks += 1;
  }
  //console.log(`TLD.cleanedLinks: ${TLD.cleanedLinks}`);    // for debugging
  TLD.notifyBackgroundScript({setBadge: (TLD.cleanedLinks).toString()});    // send a message to the background script to update the badge number
  //console.log(TLD);    // for debugging
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
  let messageContainer = messageContainerContainer.querySelector("div[style*='padding-top'][style*='padding-bottom']");
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
  const mainObserver = new MutationObserver(function() {
    //console.log("mainObserver");    // for debugging
    if (TLD.lastCleanedPage !== window.location.href) {    // if the URL in the address bar changed and this page was not already cleaned...
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
        if (TLD.findReactTimeline() &&
          TLD.findReactTimeline().querySelector("div[style*='min-height']") &&
          TLD.findReactTimeline().querySelector("div[style*='min-height']")
            .childElementCount > 1) {
          //console.log("The Timeline was found.");    // for debugging
          TLD.listenForReactTweetsAndReplies(TLD.findReactTimeline()
            .querySelector("div[style*='min-height']"));    // find the container with tweets or replies and clean them
          TLD.lastCleanedPage = window.location.href;    // store the URL of this page which was just cleaned
        } else {    // if the Timeline can't be found or was deleted...
          //console.log("The Timeline was not found.");    // for debugging
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
      case "unknown":    // if a unknown page was opened...
        TLD.lastCleanedPage = null;    // reset the property with the URL of the page which was last cleaned
        //console.log(`TLD.lastCleanedPage: ${TLD.lastCleanedPage}`);    // for debugging
      }
    }
    //console.log(TLD.DMBoxMOActive);    // for debugging
    let DMBox = document.querySelector("div[data-testid=\"DMDrawer\"]");
    if (DMBox !== null && TLD.DMBoxMOActive === false) {
      //console.log(DMBox);    // for debugging
      TLD.modifyDMBox();
      const DMBoxObserver = new MutationObserver(TLD.modifyDMBox);
      const DMBoxObserverConfig = {childList: true, subtree: true};
      DMBoxObserver.observe(DMBox, DMBoxObserverConfig);
      TLD.DMBoxMOActive = true;
      //console.log("TLD.DMBoxMOActive = true;");    // for debugging
    } else if (DMBox === null && TLD.DMBoxMOActive === true) {
      TLD.DMBoxMOActive = false;
      //console.log("TLD.DMBoxMOActive = false;");    // for debugging
    }
  });
  const mainObserverConfig = {childList: true, subtree: true};
  mainObserver.observe(mainElement, mainObserverConfig);
};



/**
 * Properties of the namespace TLD
 * @property {number} cleanedLinks - The number of links cleaned
 * @property {string} lastCleanedPage - The URL of the last cleaned page
 * @property {boolean} DMBoxMOActive - DM_Box_MutationObserver_Active - shows
 * whether there is a MutationObserver attached to the message box
 * @memberof TLD
 */
TLD.cleanedLinks;
TLD.lastCleanedPage;
TLD.DMBoxMOActive = false;
//console.log(TLD);    // for debugging

browser.runtime.onMessage.addListener(() => {
  //console.log("A message was received from the background script.");    // for debugging
  TLD.increaseBadgeNumber();    // increase the number shown on top of the icon
});    // listen for messages from the background script and increase the badge number

if (document.body.querySelector("#react-root main")) {
  //console.log("The main element was found.");    // for debugging
  TLD.modifyReactPages();
} else {
  const bodyObserver = new MutationObserver(function() {
    //console.log("bodyObserver");    // for debugging
    if (document.body.querySelector("#react-root main")) {
      //console.log("The main element was found.");    // for debugging
      bodyObserver.disconnect();
      TLD.modifyReactPages();
    }
  });
  const bodyObserverConfig = {childList: true, subtree: true};
  bodyObserver.observe(document.body, bodyObserverConfig);
}
