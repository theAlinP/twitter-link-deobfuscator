"use strict";


/**
 * A function that reveals the original values of the "href" attributes
 * @function revealLinks
 */
function revealLinks() {
  browser.storage.local.get()    // check if the add-on is enabled
    .then((storedSettings) => {
      //console.log("The addon state is: " + storedSettings.enabled);    // for debugging
      if (storedSettings.enabled === true) {    // clean the links only if the add-on is enabled
        //console.log("The value is true.");    // for debugging
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
          }
        }
      /*} else if (storedSettings.enabled === false) {
        console.log("The value is false");
      } else {
        console.log("The value is neither true nor false");*/    // for debugging
      }
    })
    .catch(() => {
      console.error("Error retrieving stored settings");
    });
}


/**
 * A function that communicates with the background script {@link boolean}
 * @function notifyBackgroundScript
 * @param {object} message - The message to be sent to the background script
 */
function notifyBackgroundScript(message) {
  //console.log(`notifyBackgroundScript() running from this window: ${window.location.href}`);    // for debugging
  let sending = browser.runtime.sendMessage(message);
  sending.then(handleResponse, handleError);    // a response is received from the background script only if sendResponse is used
}


/**
 * A function that handles the responses coming from the background script
 * @function handleResponse
 * @param {object} message - The response received from the background script
 * after sending it a message from notifyBackgroundScript()
 * @param {string} message.response - The contents of the response
 */
/*function handleResponse(message) {
  console.log(`handleResponse() running from this window: ${window.location.href}`);    // for debugging
  console.log("Response from the background script:");    // for debugging
  console.log(message);    // for debugging
}*/    // for debugging
function handleResponse() {}


/**
 * A function that handles any messaging errors
 * @function handleError
 * @param {object} error - An object as defined by the browser
 */
function handleError(error) {
  //console.log(`handleError() running from this window: ${window.location.href}`);    // for debugging
  //console.error(error);    // for debugging
  console.error(`Error: ${error.message}`);
}


/**
 * A function that receives the value of the iframe window's href attribute
 * from the background script then searches for the original
 * destination and sends it to the background script
 * @function findTwitterCardOriginalDestination
 * @param {object} message - The message received from the background script
 * @param {string} message.to - The name of the function the message is intended for
 * @param {string} message.iframeLocationHref - The location of the iframe from
 * which this script initially reached out to the background script and is used
 * to locate the iframe from the parent document
 */
function findTwitterCardOriginalDestination(message) {
  //console.log(`findTwitterCardOriginalDestination() running from this window: ${window.location.href}`);    // for debugging

  if (window !== window.top) {    // stop if this function is not called from the top document
    //console.log("This function was not called from the top document. Exiting...");    // for debugging
    return;
  }
  if (message.to !== "findTwitterCardOriginalDestination()") {    // stop if the message was not meant for this function
    //console.log("The message was not meant for this function. Exiting...");    // for debugging
    return;
  }

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
    originalDestination = parentCard.querySelector("a.twitter-timeline-link.u-hidden").getAttribute("data-original-url") ||    // if revealLinks() was already called
                          parentCard.querySelector("a.twitter-timeline-link.u-hidden").getAttribute("data-expanded-url");    // if revealLinks() wasn't already called
  } else {    // if a hidden link was not found, use the last useful link found
    let links = parentCard.querySelectorAll("a.twitter-timeline-link");
    //console.log(links);    // for debugging
    originalDestination = links[links.length - 1].getAttribute("data-original-url") ||    // if revealLinks() was already called
                          links[links.length - 1].getAttribute("data-expanded-url");    // if revealLinks() wasn't already called
  }
  //console.log("Original destination: " + originalDestination);    // for debugging

  notifyBackgroundScript({to: "restoreTwitterCardOriginalDestination()",
    iframeLocationHref: message.iframeLocationHref,
    originalDestination: originalDestination});
}


/**
 * A function that receives the link's original destination from the background
 * script and uses it to clean the link inside the iframe
 * @function restoreTwitterCardOriginalDestination
 * @param {object} message - The message received from the background script
 * @param {string} message.to - The name of the function the message is intended for
 * @param {string} message.iframeLocationHref - The location of the iframe from
 * which this script initially reached out to the background script
 * @param {string} message.originalDestination - The original destination,
 * which is used to update the href attribute of the link
 */
function restoreTwitterCardOriginalDestination(message) {
  //console.log(`restoreTwitterCardOriginalDestination() running from this window: ${window.location.href}`);    // for debugging

  if (window === window.top) {    // stop if this function is called from the top document
    //console.log("This function was NOT called from inside an iframe. Exiting...");    // for debugging
    return;
  }
  if (message.to !== "restoreTwitterCardOriginalDestination()") {    // stop if the message was not meant for this function
    //console.log("The message was not meant for this function. Exiting...");    // for debugging
    return;
  }
  if (message.iframeLocationHref !== window.location.href) {    // stop if the message was not meant for this window/iframe
    //console.log("The message was not meant for this window/iframe. Exiting...");    // for debugging
    return;
  }

  //console.log("Message from the background script:");    // for debugging
  //console.log(message);    // for debugging
  //console.log(`to: ${message.to}`);    // for debugging
  //console.log(`originalDestination: ${message.originalDestination}`);    // for debugging

  let iframeAnchor = document.querySelector("a.TwitterCard-container--clickable") || console.log("iframeAnchor could not be set");
  //console.log("Iframe anchor: " + iframeAnchor);    // for debugging
  iframeAnchor.setAttribute("data-shortened-url", iframeAnchor.getAttribute("href"));
  iframeAnchor.setAttribute("href", message.originalDestination);
  //console.log("Updated anchor href: " + iframeAnchor.getAttribute("href"));    // for debugging
}


/**
 * A function that listens for added tweets and cleans the links inside them
 * @function listenForTweets
 */
function listenForTweets() {
  if (document.querySelector("#timeline")) {
    var tweets = document.querySelector("#timeline").querySelector("#stream-items-id") || console.error("The timeline was not found");
  } else {
    return;
  }
  //console.log(tweets);    // for debugging

  revealLinks();

  const tweetsObserver = new MutationObserver(function() {
  /*const tweetsObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      console.log(mutation.type);    // prints childList
      console.log(mutation.target);    // prints Object {  }/<unavailable> to the web/browser console
    });*/    // for debugging
    //console.log("New tweets were added.");    // for debugging
    revealLinks();
  });
  const tweetsObserverConfig = {childList: true, subtree: false};
  tweetsObserver.observe(tweets, tweetsObserverConfig);    // because new <li> elements are added to tweets every time the bottom of the page is reached
}


/**
 * A function that listens for added replies and cleans the links inside them
 * @function listenForReplies
 */
function listenForReplies() {
  let repliesContainer = document.querySelector(".PermalinkOverlay-body") || console.log("The tweet container was not found");
  //if (repliesContainer.contains(repliesContainer.querySelector(".permalink-tweet-container")) ||
  //    repliesContainer.contains(repliesContainer.querySelector(".permalink-replies"))) {
  if (repliesContainer.contains(repliesContainer.querySelector(".permalink"))) {

    revealLinks();

    /**
     * Call revealLinks() every time new replies are added
     */
    const replies = repliesContainer.querySelector(".permalink-replies").querySelector("#stream-items-id") || console.error("The replies list was not found");
    //console.log(replies);    // for debugging
    const repliesObserver = new MutationObserver(function() {
      //console.log("New replies were added.");    // for debugging
      revealLinks();
    });
    const repliesObserverConfig = {childList: true, subtree: false};
    repliesObserver.observe(replies, repliesObserverConfig);    // because new <li> elements are added to replies every time the bottom of the page is reached
  }
}


/**
 * A function that cleans the "Website" link, if there is one
 * @function cleanWebsiteLink
 */
function cleanWebsiteLink() {
  browser.storage.local.get()    // check if the add-on is enabled
    .then((storedSettings) => {
      //console.log("The addon state is: " + storedSettings.enabled);    // for debugging
      if (storedSettings.enabled === true) {    // clean the link only if the add-on is enabled
        if (document.querySelector(".ProfileHeaderCard")) {
          if (document.querySelector(".ProfileHeaderCard .ProfileHeaderCard-url")) {
            let websiteLink = document.querySelector(".ProfileHeaderCard .ProfileHeaderCard-url a");
            if (websiteLink !== undefined && websiteLink !== null) {    // check if websiteLink is set (meaning it was found)
              //console.log(websiteLink);    // for debugging
              websiteLink.setAttribute("data-shortened-url", websiteLink.href);
              websiteLink.href = websiteLink.title;
              //console.log(websiteLink);    // for debugging
            }
          }
        }
      }
    })
    .catch(() => {
      console.error("Error retrieving stored settings");
    });
}


/**
 * A function that reveals the original values of the "href" attributes on pages built with React
 * @function revealReactLinks
 * @param {HTMLDivElement} container - The element containing the tweets or
 * replies. It should be the type of element returned by getElementById() or
 * querySelector() or similar methods
 */
function revealReactLinks(container) {
  //console.log(container);    // for debugging
  browser.storage.local.get()    // check if the add-on is enabled
    .then((storedSettings) => {
      //console.log("The addon state is: " + storedSettings.enabled);    // for debugging
      if (storedSettings.enabled === true) {    // clean the links only if the add-on is enabled
        //console.log("The value is true.");    // for debugging
        //let links = document.querySelectorAll("#react-root main section > div[aria-label] > div > div > div a[title]");
        let links = container.querySelectorAll("a[title]");
        //console.log(links);    // for debugging
        for (let link of links) {
        //for (let [index, link] of links.entries()) {    // for debugging
          if (link.href.startsWith("https://t.co")) {
            /*console.log(link);    // for debugging
            console.log(`
${index + 1}.href             :${link.href}
${index + 1}.title            :${link.title}`);*/    // for debugging
            link.setAttribute("data-shortened-url", link.href);
            link.href = link.title;
            //console.log(link);    // for debugging
          }
        }
      }
    })
    .catch(() => {
      console.error("Error retrieving stored settings");
    });
}


/**
 * A function that cleans the links from the user description and the
 * "Website" link, on pages built with React, if there are any
 * @function cleanReactWebsiteLink
 */
function cleanReactWebsiteLink() {
  browser.storage.local.get()    // check if the add-on is enabled
    .then((storedSettings) => {
      //console.log("The addon state is: " + storedSettings.enabled);    // for debugging
      if (storedSettings.enabled === true) {    // clean the links only if the add-on is enabled
        let userDescription = document.querySelector("div[data-testid=\"UserDescription\"]");
        //console.log(userDescription);    // for debugging
        let userProfileHeader = document.querySelector("div[data-testid=\"UserProfileHeader_Items\"]");
        //console.log(userProfileHeader);    // for debugging
        let links = userDescription.querySelectorAll("a");
        //console.log(links);    // for debugging
        for (let link of links) {
          //console.log(link);    // for debugging
          if (link.title) {
            link.setAttribute("data-shortened-url", link.href);
            link.href = link.title;
            //console.log(link);    // for debugging
          }
        }
        links = userProfileHeader.querySelectorAll("a");
        //console.log(links);    // for debugging
        for (let link of links) {
          //console.log(link);    // for debugging
          link.setAttribute("data-shortened-url", link.href);
          link.href = "http://" + link.text;
          //console.log(link);    // for debugging
        }
      }
    })
    .catch(() => {
      console.error("Error retrieving stored settings");
    });
}


/**
 * A function that listens for added tweets or replies on pages built with React
 * then cleans the links inside them
 * @function listenForReactTweetsAndReplies
 * @param {HTMLDivElement} container - The element containing the tweets or
 * replies. It should be the type of element returned by getElementById() or
 * querySelector() or similar methods
 */
function listenForReactTweetsAndReplies(container) {
  //console.log(container);    // for debugging

  revealReactLinks(container);

  /**
   * Call revealReactLinks() every time new tweets or replies are added
   */
  const containerObserver = new MutationObserver(function() {
    //console.log("containerObserver");    // for debugging
    revealReactLinks(container);
  });
  const containerObserverConfig = {childList: true, subtree: false};
  containerObserver.observe(container, containerObserverConfig);
}


/**
 * A function that detects what type of page was opened
 * @function detectPage
 */
function detectPage() {
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
}


/**
 * A function that finds the Timeline on React pages
 * @function findReactTimeline
 */
function findReactTimeline() {
  let timeline = document.body.querySelector("#react-root main div[data-testid=\"primaryColumn\"] section > div[aria-label]");
  if (timeline !== null && timeline !== undefined) {
    //console.log(timeline);    // for debugging
    return timeline;
  } else {
    //console.log("The Timeline was not found");    // for debugging
    return null;
  }
}



if (! document.body.contains(document.body.querySelector("#react-root"))) {    // if the page is NOT built with React clean the links the old way
  if (window === window.top) {
    //console.log("The page finished loading.");    // for debugging

    /**
     * Listen for messages from the background script. The callback functions
     * get called every time an iframe sends a message to the top document
     * and when the top document sends a message to an iframe.
     */
    browser.runtime.onMessage.addListener(findTwitterCardOriginalDestination);    // listen for messages from the background script and pass them to the callback function

    // For debugging: print details about the Twitter Cards, the iframe parents and iframes
    /*let cards = document.querySelectorAll(".cards-forward");
    console.log("Number of cards: " + cards.length);
    for (let card of cards) {
      card.style.border = "1px solid rgb(255, 0, 0)";
      let originalDestination = card.querySelector("a.twitter-timeline-link").getAttribute("data-original-url");
      console.log(`Original destination: : ${originalDestination}`);
      let iframeParents = card.querySelectorAll(".js-macaw-cards-iframe-container");    // select the iframes' parents
      console.log("Number of parents: " + iframeParents.length);
      for (let iframeParent of iframeParents) {
        iframeParent.style.border = "1px solid rgb(0, 255, 0)";
        if (iframeParent.contains(iframeParent.querySelector("iframe"))) {
          console.log("The iframe parent has an iframe");
          let iframe = iframeParent.querySelector("iframe");
          console.log(iframe);
        }
      }
    }*/    // for debugging

    cleanWebsiteLink();    // clean the "Website" link

    /**
     * Clean the links every time new tweets and replies are added
     */
    if (document.querySelector("#timeline")) {
      listenForTweets();
    } else if (document.querySelector(".PermalinkOverlay-body")) {
      listenForReplies();
    }

    /**
     * Clean the replies every time a tweet is singled out (is clicked on or
     * it was opened directly from a link or a bookmark)
     */
    let repliesContainer = document.querySelector(".PermalinkOverlay-body") || console.log("The tweet container was not found");
    const repliesContainerObserver = new MutationObserver(listenForReplies);
    const repliesContainerObserverConfig = {childList: true, subtree: false};
    repliesContainerObserver.observe(repliesContainer, repliesContainerObserverConfig);    // because a new <div> element is added to repliesContainer when a tweet is singled out or it was opened directly

    /**
     * Clean the tweets and the "Website" link every time a tweet opened directly
     * from a link or a bookmark is hidden/closed
     */
    let pageContainer = document.querySelector("#page-container") || console.log("The page container was not found");
    if (pageContainer.classList.contains("wrapper-permalink")) {
      const pageContainerObserver = new MutationObserver(function() {
        //console.log("The page container was modified!");    // for debugging
        if (! pageContainer.classList.contains("wrapper-permalink")) {
          listenForTweets();
          cleanWebsiteLink();    // clean the "Website" link
        }
      });
      const pageContainerObserverConfig = {attributes: true};
      pageContainerObserver.observe(pageContainer, pageContainerObserverConfig);    // because the class "wrapper-permalink" is removed from pageContainer when a singled out tweet is closed
    }

    /**
     * Detect when a new page is browsed (Home, Notifications, Who to follow, etc.)
     * then clean the links
     */
    const pageObserver = new MutationObserver(function() {
      //console.log("The page container's attributes were modified.");    // for debugging
      //console.log("Page container class list: " + document.querySelector("#page-container").classList);    // for debugging
      if (pageContainer.querySelector("#timeline").querySelector("a[data-expanded-url]")) {
        //console.log("Shortened URL detected. It will be cleaned immediately.");    // for debugging
        listenForTweets();
      }
    });
    const pageObserverConfig = {attributes: true};
    pageObserver.observe(pageContainer, pageObserverConfig);    // because the class list from pageContainer is changed after switching to a different page
  } else {    // if the script is running from inside an iframe
    if (document.querySelector("a.TwitterCard-container--clickable")) {    // if there is a link in the Twitter Card...
      browser.runtime.onMessage.addListener(restoreTwitterCardOriginalDestination);    // listen for messages from the background script and pass them to the callback function
      //console.log("This message is coming from an iframe.");    // for debugging
      //console.log(`Iframe location href: ${window.location.href}`);    // for debugging
      browser.storage.local.get()    // call notifyBackgroundScript() if the add-on is enabled
        .then((storedSettings) => {
          //console.log("The addon state is: " + storedSettings.enabled);    // for debugging
          if (storedSettings.enabled === true) {
            //console.log("The value is true.");    // for debugging
            notifyBackgroundScript({to: "findTwitterCardOriginalDestination()",
              iframeLocationHref: window.location.href});
          /*} else if (storedSettings.enabled === false) {
            console.log("The value is false");
          } else {
            console.log("The value is neither true nor false");*/    // for debugging
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
        if (findReactTimeline()) {
          //console.log("The Timeline was found.");    // for debugging
          bodyObserver.disconnect();
          mainObserver.disconnect();

          /**
           * Clean the tweets or replies on the page which was opened initially
           */
          var windowHref;    // declare a variable that will hold the URL of the last cleaned page
          switch (detectPage()) {    // check what type of page was opened
          case "profile":    // if a profile page was opened...
            cleanReactWebsiteLink();
            // fall-through (no break statement)
          case "tweet":    // if a page with a tweet was opened...
          case "home":    // if the home page was opened...
          case "explore":    // if the "Explore" page was opened...
            listenForReactTweetsAndReplies(findReactTimeline()
              .querySelector("div > div > div"));    // find and clean the element with tweets or replies
            windowHref = window.location.href;    // store the URL of this page which was just cleaned
            break;
          case "unknown":    // if a unknown page was opened...
            windowHref = null;    // reset the variable with the URL of the page which was last cleaned
          }
          //console.log(windowHref);    // for debugging

          /**
           * Clean the replies and the tweets every time it is navigated
           * to a new page
           */
          const mainObserver2 = new MutationObserver(function() {
            //console.log("mainObserver2");    // for debugging
            //console.log(windowHref);    // for debugging
            if (windowHref !== window.location.href) {    // if the URL in the address bar changed and this page was not already cleaned...
              if (findReactTimeline()) {
                switch (detectPage()) {    // check what type of page was opened
                case "profile":    // if a profile page was opened...
                  cleanReactWebsiteLink();
                  // fall-through (no break statement)
                case "tweet":    // if a page with a tweet was opened...
                case "home":    // if the home page was opened...
                case "explore":    // if the "Explore" page was opened...
                  listenForReactTweetsAndReplies(findReactTimeline()
                    .querySelector("div > div > div"));    // find and clean the element with tweets or replies
                  windowHref = window.location.href;    // store the URL of this page which was just cleaned
                  break;
                case "unknown":    // if a unknown page was opened...
                  windowHref = null;    // reset the variable with the URL of the page which was last cleaned
                }
              } else {    // if the Timeline can't be found or was deleted...
                //console.log("The timeline was not found.");
                windowHref = null;    // reset the variable with the URL of the page which was last cleaned
              }
              //console.log(windowHref);    // for debugging
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
