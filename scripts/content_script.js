"use strict";


/**
 * The namespace that will contain all the methods and properties
 * @namespace TLD
 */
var TLD = TLD || {};
//console.log(TLD);    // for debugging


/**
 * A function that reveals the original values of the "href" attributes
 * @method revealLinks
 * @memberof TLD
 */
TLD.revealLinks = function() {
  browser.storage.local.get()    // check if the add-on is enabled
    .then((storedSettings) => {
      //console.log(`The add-on state is: ${storedSettings.enabled}`);    // for debugging
      if (storedSettings.enabled === true) {    // clean the links only if the add-on is enabled
        let links = document.querySelectorAll("a[data-expanded-url]");
        //console.log(links);    // for debugging
        for (let link of links) {
        //for (let [index, link] of links.entries()) {    // for debugging
          if (["", link.href].indexOf(link.getAttribute("data-expanded-url")) <= 0) {
            /*console.log(link);    // prints Object {  }/<unavailable> to the web/browser console
            console.log(`
${index + 1}.href             :${link.href}
${index + 1}.data-expanded-url:${link.getAttribute("data-expanded-url")}
${index + 1}.title            :${link.title}`);*/    // for debugging
            link.setAttribute("data-shortened-url", link.href);
            link.setAttribute("data-original-url", link.getAttribute("data-expanded-url"));
            link.href = link.getAttribute("data-expanded-url");
            link.removeAttribute("data-expanded-url");
            //console.log(link);    // for debugging
            if (! link.classList.contains("u-hidden")) {    /* don't increase the badge number with hidden links. Do it after cleaning the links
                                                               inside their corresponding Twitter Cards, from TLD.restoreTwitterCardOriginalDestination()*/
              TLD.increaseBadgeNumber();    // increase the number shown on top of the icon
            }
          }
        }
      }
    })
    .catch(() => {
      console.error("Error retrieving stored settings");
    });
};


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
 * A function that receives the value of the iframe window's href attribute
 * from the background script then searches for the original
 * destination and sends it to the background script
 * @method findTwitterCardOriginalDestination
 * @memberof TLD
 * @param {object} message - The message received from the background script
 * @param {string} message.to - The name of the function the message is intended for
 * @param {string} message.iframeLocationHref - The location of the iframe from
 * which this script initially reached out to the background script and is used
 * to locate the iframe from the parent document
 */
TLD.findTwitterCardOriginalDestination = function(message) {
  //console.log("Message from the background script:");    // for debugging
  //console.log(message);    // for debugging
  //console.log(`to: ${message.to}`);    // for debugging
  //console.log(`iframeLocationHref: ${message.iframeLocationHref}`);    // for debugging
  let iframe = document.querySelector(`iframe[src="${message.iframeLocationHref}"]`);
  //console.log(iframe);    // for debugging

  // A polyfill to find the ancestor of an element
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector ||
                                Element.prototype.webkitMatchesSelector;
  }
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
      var el = this;
      do {
        if (el.matches(s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }

  let parentCard = iframe.closest(".cards-forward") ||    // used when all the cards are listed
                     iframe.closest(".permalink-tweet") ||    // used when a tweet is singled out (is clicked on or opened directly)
                     iframe.closest("#permalink-overlay");    // used when a tweet is singled out (is clicked on or opened directly)
  //console.log(parentCard);    // for debugging
  var originalDestination;
  if (parentCard.querySelector("a.twitter-timeline-link.u-hidden")) {    // in case a hidden link is found
    originalDestination = parentCard.querySelector("a.twitter-timeline-link.u-hidden").getAttribute("data-original-url") ||    // if TLD.revealLinks() was already called
                          parentCard.querySelector("a.twitter-timeline-link.u-hidden").getAttribute("data-expanded-url");    // if TLD.revealLinks() wasn't already called
  } else if (parentCard.querySelector("a.twitter-timeline-link")) {    // if a hidden link was not found, but a visible one exists...
    let links = parentCard.querySelectorAll("a.twitter-timeline-link");
    //console.log(links);    // for debugging
    originalDestination = links[links.length - 1].getAttribute("data-original-url") ||    // if TLD.revealLinks() was already called
                          links[links.length - 1].getAttribute("data-expanded-url");    // if TLD.revealLinks() wasn't already called
  }/* else {    // if no link was found...
    console.log("No links found for this iframe:");    // for debugging
    console.log(iframe);    // for debugging
  }*/    // for debugging

  if (originalDestination !== undefined && originalDestination !== null) {    // if a link was found...
    //console.log(`Original destination: ${originalDestination}`);    // for debugging
    TLD.notifyBackgroundScript({to: "TLD.restoreTwitterCardOriginalDestination()",
      iframeLocationHref: message.iframeLocationHref,
      originalDestination: originalDestination});
  }
};


/**
 * A function that receives the link's original destination from the background
 * script and uses it to clean the link inside the iframe then sends a message
 * to TLD.increaseBadgeNumber() to update the badge number
 * @method restoreTwitterCardOriginalDestination
 * @memberof TLD
 * @param {object} message - The message received from the background script
 * @param {string} message.to - The name of the function the message is intended for
 * @param {string} message.iframeLocationHref - The location of the iframe from
 * which this script initially reached out to the background script
 * @param {string} message.originalDestination - The original destination,
 * which is used to update the href attribute of the link
 */
TLD.restoreTwitterCardOriginalDestination = function(message) {
  //console.log("Message from the background script:");    // for debugging
  //console.log(message);    // for debugging
  //console.log(`to: ${message.to}`);    // for debugging
  //console.log(`originalDestination: ${message.originalDestination}`);    // for debugging

  if (document.querySelector("a.TwitterCard-container--clickable")) {
    let iframeAnchor = document.querySelector("a.TwitterCard-container--clickable");
    //console.log(`Iframe anchor: ${iframeAnchor}`);    // for debugging
    iframeAnchor.setAttribute("data-shortened-url", iframeAnchor.getAttribute("href"));
    iframeAnchor.setAttribute("href", message.originalDestination);
    //console.log(`Updated anchor href: ${iframeAnchor.getAttribute("href")}`);    // for debugging
    browser.runtime.onMessage.removeListener(TLD.listenForMessages);    // stop listening for messages from the background script, now that the link has been cleaned
    TLD.notifyBackgroundScript({to: "TLD.increaseBadgeNumber()"});    // send a message to TLD.increaseBadgeNumber() through the background script
  } else {
    console.error("The link inside the iframe could not be found");    // for debugging
  }
};


/**
 * A function that listens for added tweets and cleans the links inside them
 * @method listenForTweets
 * @memberof TLD
 */
TLD.listenForTweets = function() {
  if (document.querySelector("#timeline #stream-items-id")) {
    var tweets = document.querySelector("#timeline #stream-items-id");
  } else {
    console.error("The tweets list was not found");    // for debugging
    return;
  }
  //console.log(tweets);    // for debugging

  TLD.revealLinks();

  const tweetsObserver = new MutationObserver(function() {
  /*const tweetsObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      console.log(mutation.type);    // prints childList
      console.log(mutation.target);    // prints Object {  }/<unavailable> to the web/browser console
    });*/    // for debugging
    //console.log("New tweets were added.");    // for debugging
    TLD.revealLinks();
  });
  const tweetsObserverConfig = {childList: true, subtree: false};
  tweetsObserver.observe(tweets, tweetsObserverConfig);    // because new <li> elements are added to tweets every time the bottom of the page is reached
};


/**
 * A function that listens for added replies and cleans the links inside them
 * @method listenForReplies
 * @memberof TLD
 */
TLD.listenForReplies = function() {
  if (document.querySelector("#permalink-overlay .permalink .permalink-replies #stream-items-id")) {
    const replies = document.querySelector("#permalink-overlay .permalink .permalink-replies #stream-items-id");

    TLD.revealLinks();    // call TLD.revealLinks() right now

    /**
     * Call TLD.revealLinks() every time new replies are added
     */
    //console.log(replies);    // for debugging
    const repliesObserver = new MutationObserver(function() {
      //console.log("New replies were added.");    // for debugging
      TLD.revealLinks();
    });
    const repliesObserverConfig = {childList: true, subtree: false};
    repliesObserver.observe(replies, repliesObserverConfig);    // because new <li> elements are added to replies every time the bottom of the page is reached
  } else {
    //console.error("No tweet seems to be singled out right now.");    // for debugging
  }
};


/**
 * A function that cleans the "Website" link, if there is one
 * @method cleanWebsiteLink
 * @memberof TLD
 */
TLD.cleanWebsiteLink = function() {
  browser.storage.local.get()    // check if the add-on is enabled
    .then((storedSettings) => {
      //console.log(`The add-on state is: ${storedSettings.enabled}`);    // for debugging
      if (storedSettings.enabled === true) {    // clean the link only if the add-on is enabled
        if (document.querySelector(".ProfileHeaderCard .ProfileHeaderCard-url a")) {
          let websiteLink = document.querySelector(".ProfileHeaderCard .ProfileHeaderCard-url a");
          //console.log(websiteLink);    // for debugging
          websiteLink.setAttribute("data-shortened-url", websiteLink.href);
          websiteLink.href = websiteLink.title;
          //console.log(websiteLink);    // for debugging
          TLD.increaseBadgeNumber();    // increase the number shown on top of the icon
        } else {
          console.error("The \"Website\" link was not found");    // for debugging
        }
      }
    })
    .catch(() => {
      console.error("Error retrieving stored settings");
    });
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
            link.href = link.title;    // in case the links have "title" attributes
            /*if (link.lastElementChild.innerText === "…") {
              let badURL = link.innerText;
              //let goodURL = badURL.substring(0, badURL.length - 1);
              let goodURL = badURL.slice(0, -1);
              link.href = goodURL;
            } else {
              link.href = link.innerText;
            }*/    // in case the links have no "title" attributes
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
            link.href = link.innerText;
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
  let pathArray = locationPathname.split("/");
  //console.log(pathArray);    // for debugging
  for (let [index, path] of pathArray.entries()) {    // remove the null elements from the array
    //console.log(path);
    if (path === "") {    // if the element is null, like for example the first one...
      pathArray.splice(index, 1);    // ...remove it from the array
    }
  }
  //console.log(pathArray);    // for debugging

  if (pathArray.length > 2 && pathArray[1] === "status") {
    //console.log("A tweet page was opened.");    // for debugging
    return "tweet";
  } else if (pathArray.length === 1 && pathArray[0] === "home") {
    //console.log("The home page was opened.");    // for debugging
    return "home";
  } else if (pathArray.length === 1 && pathArray[0] === "explore") {
    //console.log("The \"Explore\" page was opened.");    // for debugging
    return "explore";
  } else if (pathArray.length === 1) {
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
 * A function that listens for message from the background script and calls other functions
 * @method listenForMessages
 * @memberof TLD
 * @param {object} message - The message received from the background script
 * @param {string} message.to - The name of the function the message is intended for
 */
TLD.listenForMessages = function(message) {
  //console.log(`TLD.listenForMessages() running from this window: ${window.location.href}`);    // for debugging
  //console.log("Message from the background script:");    // for debugging
  //console.log(message);    // for debugging
  //console.log(`to: ${message.to}`);    // for debugging

  if (window === window.top) {    // call the following functions only from the top document
    if (message.to === "TLD.findTwitterCardOriginalDestination()") {
      TLD.findTwitterCardOriginalDestination(message);
    } else if (message.to === "TLD.increaseBadgeNumber()") {
      TLD.increaseBadgeNumber();
    }
  } else {    // call TLD.restoreTwitterCardOriginalDestination only from an iframe
    if (message.to === "TLD.restoreTwitterCardOriginalDestination()" &&
      message.iframeLocationHref === window.location.href) {    // call it only from the iframe with the URL specified in the message
      TLD.restoreTwitterCardOriginalDestination(message);
    }
  }
};



if (window === window.top) {    // add properties to the namespace from the top window, on the first run on the page
  /**
   * Properties of the namespace TLD
   * @property {number} cleanedLinks - The number of links cleaned
   * @property {string} lastCleanedPage - The URL of the last cleaned page
   * @memberof TLD
   */
  TLD.cleanedLinks;
  TLD.lastCleanedPage;
  //console.log(TLD);    // for debugging
}
if (! document.body.contains(document.body.querySelector("#react-root"))) {    // if the page is NOT built with React clean the links the old way
  if (window === window.top) {
    //console.log("The page finished loading.");    // for debugging

    /**
     * Listen for messages from the background script. The callback function
     * gets called every time an iframe sends a message to the top document
     * and when the top document sends a message to an iframe.
     */
    browser.runtime.onMessage.addListener(TLD.listenForMessages);    // listen for messages from the background script and pass them to TLD.listenForMessages()

    // For debugging: print details about the Twitter Cards, the iframe parents and iframes
    /*let cards = document.querySelectorAll(".cards-forward");
    console.log(`Number of cards: ${cards.length}`);
    for (let card of cards) {
      card.style.border = "1px solid rgb(255, 0, 0)";
      let originalDestination = card.querySelector("a.twitter-timeline-link").getAttribute("data-original-url");
      console.log(`Original destination: : ${originalDestination}`);
      let iframeParents = card.querySelectorAll(".js-macaw-cards-iframe-container");    // select the iframes' parents
      console.log(`Number of parents: ${iframeParents.length}`);
      for (let iframeParent of iframeParents) {
        iframeParent.style.border = "1px solid rgb(0, 255, 0)";
        if (iframeParent.contains(iframeParent.querySelector("iframe"))) {
          console.log("The iframe parent has an iframe");
          let iframe = iframeParent.querySelector("iframe");
          console.log(iframe);
        }
      }
    }*/    // for debugging

    TLD.cleanWebsiteLink();    // clean the "Website" link

    /**
     * Clean the links every time new tweets and replies are added
     */
    if (document.querySelector("#timeline")) {
      TLD.listenForTweets();
    } else if (document.querySelector("#permalink-overlay .permalink")) {
      TLD.listenForReplies();
    }

    /**
     * Clean the replies every time a tweet is singled out (is clicked on or
     * it was opened directly from a link or a bookmark)
     */
    if (document.querySelector("#permalink-overlay .PermalinkOverlay-body")) {
      var repliesContainer = document.querySelector("#permalink-overlay .PermalinkOverlay-body");
    } else {
      console.error("The tweet container was not found");    // for debugging
    }
    const repliesContainerObserver = new MutationObserver(TLD.listenForReplies);
    const repliesContainerObserverConfig = {childList: true, subtree: false};
    repliesContainerObserver.observe(repliesContainer, repliesContainerObserverConfig);    // because a new <div> element is added to repliesContainer when a tweet is singled out or it was opened directly

    /**
     * Clean the tweets and the "Website" link every time a tweet opened
     * directly from a link or a bookmark is hidden/closed
     * or a new profile page is opened
     */
    if (document.querySelector("#page-container")) {
      var pageContainer = document.querySelector("#page-container");
    } else {
      console.error("The page container was not found");    // for debugging
    }
    const pageContainerObserver = new MutationObserver(function() {
      //console.log("The page container was modified!");    // for debugging
      if (TLD.lastCleanedPage !== window.location.href) {    // if the URL in the address bar changed and this page was not already cleaned...
        if (! pageContainer.classList.contains("wrapper-permalink")) {
          TLD.cleanWebsiteLink();    // clean the "Website" link
          TLD.lastCleanedPage = window.location.href;    // store the URL of this page which was just cleaned
          //console.log(`TLD.lastCleanedPage: ${TLD.lastCleanedPage}`);    // for debugging
        }
      }
    });
    const pageContainerObserverConfig = {attributes: true};
    pageContainerObserver.observe(pageContainer, pageContainerObserverConfig);    // because the class "wrapper-permalink" is removed from pageContainer when a singled out tweet is closed

    /**
     * Detect when a new page is browsed (Home, Notifications, Who to follow, etc.)
     * then clean the links
     */
    const pageObserver = new MutationObserver(function() {
      //console.log("The page container's attributes were modified.");    // for debugging
      //console.log(`Page container class list: ${document.querySelector("#page-container").classList}`);    // for debugging
      if (pageContainer.querySelector("#timeline").querySelector("a[data-expanded-url]")) {
        //console.log("Shortened URL detected. It will be cleaned immediately.");    // for debugging
        TLD.listenForTweets();
      }
    });
    const pageObserverConfig = {attributes: true};
    pageObserver.observe(pageContainer, pageObserverConfig);    // because the class list from pageContainer is changed after switching to a different page
  } else {    // if the script is running from inside an iframe
    if (document.querySelector("a.TwitterCard-container--clickable")) {    // if there is a link in the Twitter Card...

      /**
       * Listen for messages from the background script. The callback function
       * gets called every time an iframe sends a message to the top document
       * and when the top document sends a message to an iframe.
       */
      browser.runtime.onMessage.addListener(TLD.listenForMessages);    // listen for messages from the background script and pass them to TLD.listenForMessages()

      //console.log("This message is coming from an iframe.");    // for debugging
      //console.log(`Iframe location href: ${window.location.href}`);    // for debugging
      browser.storage.local.get()    // call TLD.notifyBackgroundScript() if the add-on is enabled
        .then((storedSettings) => {
          //console.log(`The add-on state is: ${storedSettings.enabled}`);    // for debugging
          if (storedSettings.enabled === true) {
            TLD.notifyBackgroundScript({to: "TLD.findTwitterCardOriginalDestination()",
              iframeLocationHref: window.location.href});
          }
        })
        .catch(() => {
          console.error("Error retrieving stored settings");
        });
    }
  }
} else {    // if the page is built with React clean the links the new way
  //console.log("React app detected.");    // for debugging
  //console.log(document.body.querySelectorAll("#react-root"));    // for debugging
  const bodyObserver = new MutationObserver(function() {
    //console.log("bodyObserver");    // for debugging
    if (document.body.querySelector("#react-root main")) {
      //console.log("The main element was found.");    // for debugging
      let mainElement = document.body.querySelector("#react-root main");
      //console.log(mainElement);    // for debugging
      const mainObserver = new MutationObserver(function() {
        //console.log("mainObserver");    // for debugging
        if (TLD.findReactTimeline()) {
          //console.log("The Timeline was found.");    // for debugging

          if (TLD.findReactTimeline().querySelector("div[style*='min-height']")
            .childElementCount <= 1) {
            return;
          }    // stop if the container whose "style" attribute value containing the string "min-height" has only 1 child

          bodyObserver.disconnect();
          mainObserver.disconnect();

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
            TLD.listenForReactTweetsAndReplies(TLD.findReactTimeline()
              .querySelector("div[style*='min-height']"));    // find the container with tweets or replies and clean them
            TLD.lastCleanedPage = window.location.href;    // store the URL of this page which was just cleaned
            //console.log(`TLD.lastCleanedPage: ${TLD.lastCleanedPage}`);    // for debugging
            break;
          case "unknown":    // if a unknown page was opened...
            TLD.lastCleanedPage = null;    // reset the property with the URL of the page which was last cleaned
            //console.log(`TLD.lastCleanedPage: ${TLD.lastCleanedPage}`);    // for debugging
          }

          /**
           * Clean the replies and the tweets every time it is navigated
           * to a new page
           */
          const mainObserver2 = new MutationObserver(function() {
            //console.log("mainObserver2");    // for debugging
            if (TLD.lastCleanedPage !== window.location.href) {    // if the URL in the address bar changed and this page was not already cleaned...
              if (TLD.findReactTimeline()) {
                switch (TLD.detectPage()) {    // check what type of page was opened
                case "profile":    // if a profile page was opened...
                  TLD.cleanReactWebsiteLink();
                  // fall-through (no break statement)
                case "tweet":    // if a page with a tweet was opened...
                case "home":    // if the home page was opened...
                case "explore":    // if the "Explore" page was opened...
                  TLD.listenForReactTweetsAndReplies(TLD.findReactTimeline()
                    .querySelector("div[style*='min-height']"));    // find the container with tweets or replies and clean them
                  TLD.lastCleanedPage = window.location.href;    // store the URL of this page which was just cleaned
                  //console.log(`TLD.lastCleanedPage: ${TLD.lastCleanedPage}`);    // for debugging
                  break;
                case "unknown":    // if a unknown page was opened...
                  TLD.lastCleanedPage = null;    // reset the variable with the URL of the page which was last cleaned
                  //console.log(`TLD.lastCleanedPage: ${TLD.lastCleanedPage}`);    // for debugging
                }
              } else {    // if the Timeline can't be found or was deleted...
                //console.log("The Timeline was not found.");
                TLD.lastCleanedPage = null;    // reset the variable with the URL of the page which was last cleaned
                //console.log(`TLD.lastCleanedPage: ${TLD.lastCleanedPage}`);    // for debugging
              }
            }
          });
          const mainObserverConfig2 = {childList: true, subtree: true};
          mainObserver2.observe(mainElement, mainObserverConfig2);
        }
      });
      const mainObserverConfig = {childList: true, subtree: true};
      mainObserver.observe(mainElement, mainObserverConfig);
    }
  });
  const bodyObserverConfig = {childList: true, subtree: false};
  bodyObserver.observe(document.body, bodyObserverConfig);
}
