"use strict";


/**
 * Create a function that reveals the original <href> attributes' values
 */
function revealLinks() {
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
}


/**
 * Create a function that communicates with the background script
 */
function notifyBackgroundScript(iframeLocationHref) {
  //console.log(`notifyBackgroundScript() running from this window: ${window.location.href}`);    // for debugging
  //console.log(iframeLocationHref);    // for debugging
  let sending = browser.runtime.sendMessage({iframeLocationHref: iframeLocationHref});
  sending.then(handleResponse, handleError);
}


/**
 * Create a function that handles the responses coming from the background script
 */
/*function handleResponse(message) {
  console.log(`handleResponse() running from this window: ${window.location.href}`);    // for debugging
  console.log("Response from the background script:");    // for debugging
  console.log("message.response: " + message.response);    // for debugging
}*/    // for debugging
function handleResponse() {}


/**
 * Create a function that handles any messaging errors
 */
function handleError(error) {
  //console.log(`handleError() running from this window: ${window.location.href}`);    // for debugging
  //console.error(`Error: ${error}`);
  console.error(`${error}`);
}


/**
 * Create a function that gets the iframe href from the background script
 */
function getIframeHrefFromBackgroundScript(message) {
  //console.log(`getIframeHrefFromBackgroundScript() running from this window: ${window.location.href}`);    // for debugging

  if (window !== window.top) {    // stop if this function is not called from the top document
    //console.log("This function was not called from the top document. Exiting...");    // for debugging
    return;
  }
  if (message.to !== "getIframeHrefFromBackgroundScript()") {    // stop if the message was not meant for this function
    //console.log("The message was not meant for this function. Exiting...");    // for debugging
    return;
  }

  //console.log(message);    // for debugging
  //console.log("Message from the background script:");    // for debugging
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

  return Promise.resolve({response: "The iframe href was received.",
    originalDestination: originalDestination});
}


/**
 * Create a function that gets the original destination from the background script
 */
function getOriginalDestinationFromBackgroundScript(message) {
  //console.log(`getOriginalDestinationFromBackgroundScript() running from this window: ${window.location.href}`);    // for debugging

  if (window === window.top) {    // stop if this function is called from the top document
    //console.log("This function was NOT called from inside an iframe. Exiting...");    // for debugging
    return;
  }
  if (message.to !== "getOriginalDestinationFromBackgroundScript()") {    // stop if the message was not meant for this function
    //console.log("The message was not meant for this function. Exiting...");    // for debugging
    return;
  }
  if (message.iframeLocationHref !== window.location.href) {    // stop if the message was not meant for this window/iframe
    //console.log("The message was not meant for this window/iframe. Exiting...");    // for debugging
    return;
  }

  //console.log(message);    // for debugging
  //console.log("Message from the background script:");    // for debugging
  //console.log(`to: ${message.to}`);    // for debugging
  //console.log(`originalDestination: ${message.originalDestination}`);    // for debugging

  let iframeAnchor = document.querySelector("a.TwitterCard-container--clickable") || console.log("iframeAnchor could not be set");
  //console.log("Iframe anchor: " + iframeAnchor);    // for debugging
  iframeAnchor.setAttribute("data-shortened-url", iframeAnchor.getAttribute("href"));
  iframeAnchor.setAttribute("href", message.originalDestination);
  //console.log("Updated anchor href: " + iframeAnchor.getAttribute("href"));    // for debugging

  return Promise.resolve({response: "The original destination was received."});
}


function listenForTweets() {
  if (document.querySelector("#timeline")) {
    var tweets = document.querySelector("#timeline").querySelector("#stream-items-id") || console.error("The timeline was not found");
  } else {
    return;
  }
  //console.log(tweets);    // for debugging

  browser.storage.local.get()    // call revealLinks() if the add-on is enabled
    .then((storedSettings) => {
      //console.log("The addon state is: " + storedSettings.enabled);    // for debugging
      if (storedSettings.enabled === true) {
        //console.log("The value is true.");    // for debugging
        revealLinks();
      /*} else if (storedSettings.enabled === false) {
        console.log("The value is false");
      } else {
        console.log("The value is neither true nor false");*/    // for debugging
      }
    })
    .catch(() => {
      console.error("Error retrieving stored settings");
    });

  const tweetsObserver = new MutationObserver(function() {
  /*const tweetsObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      console.log(mutation.type);    // prints childList
      console.log(mutation.target);    // prints Object {  }/<unavailable> to the web/browser console
    });*/    // for debugging
    //console.log("New tweets were added.");    // for debugging
    browser.storage.local.get()    // call revealLinks() if the add-on is enabled
      .then((storedSettings) => {
        if (storedSettings.enabled === true) {
          revealLinks();
        }
      })
      .catch(() => {
        console.error("Error retrieving stored settings");
      });

  });
  const tweetsObserverConfig = {childList: true, subtree: false};
  tweetsObserver.observe(tweets, tweetsObserverConfig);    // because new <li> elements are added to tweets every time the bottom of the page is reached
}


function listenForReplies() {
  let repliesContainer = document.querySelector(".PermalinkOverlay-body") || console.log("The tweet container was not found");
  //if (repliesContainer.contains(repliesContainer.querySelector(".permalink-tweet-container")) ||
  //    repliesContainer.contains(repliesContainer.querySelector(".permalink-replies"))) {
  if (repliesContainer.contains(repliesContainer.querySelector(".permalink"))) {

    browser.storage.local.get()    // call revealLinks() if the add-on is enabled
      .then((storedSettings) => {
        //console.log("The addon state is: " + storedSettings.enabled);    // for debugging
        if (storedSettings.enabled === true) {
          //console.log("The value is true.");    // for debugging
          revealLinks();
        /*} else if (storedSettings.enabled === false) {
          console.log("The value is false");
        } else {
          console.log("The value is neither true nor false");*/    // for debugging
        }
      })
      .catch(() => {
        console.error("Error retrieving stored settings");
      });

    /**
     * Call revealLinks() every time new replies are added
     */
    const replies = repliesContainer.querySelector(".permalink-replies").querySelector("#stream-items-id") || console.error("The replies list was not found");
    //console.log(replies);    // for debugging
    const repliesObserver = new MutationObserver(function() {
      //console.log("New replies were added.");    // for debugging
      browser.storage.local.get()    // call revealLinks() if the add-on is enabled
        .then((storedSettings) => {
          if (storedSettings.enabled === true) {
            revealLinks();
          }
        })
        .catch(() => {
          console.error("Error retrieving stored settings");
        });
    });
    const repliesObserverConfig = {childList: true, subtree: false};
    repliesObserver.observe(replies, repliesObserverConfig);    // because new <li> elements are added to replies every time the bottom of the page is reached
  }
}



if (window === window.top) {
  //console.log("The page finished loading.");    // for debugging

  browser.runtime.onMessage.addListener(getIframeHrefFromBackgroundScript);    // listen for messages from the background script with the iframe href

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

  /**
   * Call revealLinks() every time new tweets and replies are added
   */
  if (document.querySelector("#timeline")) {
    listenForTweets();
  } else if (document.querySelector(".PermalinkOverlay-body")) {
    listenForReplies();
  }

  /**
   * Call revealLinks() every time a tweet is singled out (is clicked on or
   * it was opened directly from a link or a bookmark)
   */
  let repliesContainer = document.querySelector(".PermalinkOverlay-body") || console.log("The tweet container was not found");
  const repliesContainerObserver = new MutationObserver(listenForReplies);
  const repliesContainerObserverConfig = {childList: true, subtree: false};
  repliesContainerObserver.observe(repliesContainer, repliesContainerObserverConfig);    // because a new <div> element is added to repliesContainer when a tweet is singled out or it was opened directly

  /**
   * Call revealLinks() every time a singled out tweet is hidden/closed
   */
  let pageContainer = document.querySelector("#page-container") || console.log("The page container was not found");
  if (pageContainer.classList.contains("wrapper-permalink")) {
    const pageContainerObserver = new MutationObserver(function() {
      //console.log("The page container was modified!");    // for debugging
      if (! pageContainer.classList.contains("wrapper-permalink")) {
        listenForTweets();
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
} else {
  if (document.querySelector("a.TwitterCard-container--clickable")) {    // if there is a link in the Twitter Card...
    browser.runtime.onMessage.addListener(getOriginalDestinationFromBackgroundScript);    // listen for messages from the background script with the original destination
    //console.log("This message is coming from an iframe.");    // for debugging
    //console.log(`Iframe location href: ${window.location.href}`);    // for debugging
    browser.storage.local.get()    // call notifyBackgroundScript() if the add-on is enabled
      .then((storedSettings) => {
        //console.log("The addon state is: " + storedSettings.enabled);    // for debugging
        if (storedSettings.enabled === true) {
          //console.log("The value is true.");    // for debugging
          notifyBackgroundScript(window.location.href);
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
