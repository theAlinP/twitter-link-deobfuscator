"use strict";

const stream = document.querySelector("#stream-items-id") || console.error("The timeline was not found");
let warningMessage;
let warningMessageOpacity;
let fadeOutMessage;

/**
 * Create a function that reveals the <href> attributes
 */
function revealLinks() {
  let links = document.querySelectorAll("a[data-expanded-url]");
  let i;
  //console.log(links);    // for debugging
  for (i = 0; i < links.length; i += 1) {
    if (["", links[i].href].indexOf(links[i].getAttribute("data-expanded-url")) <= 0) {
      /*console.log(links[i]);    // prints Object {  }/<unavailable> to the web/browser console
      console.log((i + 1) + ": href             :" + links[i].href + "\n" +
            (i + 1) + ": data-expanded-url:" + links[i].getAttribute("data-expanded-url") + "\n" +
            (i + 1) + ": title            :" + links[i].title);*/    // for debugging
      links[i].href = links[i].getAttribute("data-expanded-url");
      links[i].removeAttribute("data-expanded-url");
      //console.log(links[i]);    // prints Object {  }/<unavailable> to the web/browser console
    }
  }
}

/**
 * Create a function that fades out the warning message
 */
function fadeOutWarning() {
  warningMessageOpacity -= 1;
  warningMessage.style.opacity = warningMessageOpacity / 100;
  if (warningMessageOpacity === 0) {
    window.clearTimeout(fadeOutMessage);
    warningMessage.parentElement.removeChild(warningMessage);
    return;
  }
  window.setTimeout(fadeOutWarning, 16.666);
}

revealLinks();

/**
 * Call revealLinks() every time new tweets are added or show the warning
 * if the Twitter timeline cannot be detected
 */
if (stream !== undefined && stream !== null) {
  const streamObserver = new MutationObserver(function () {
  /*const streamObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      console.log(mutation.type);    // prints childList
      console.log(mutation.target);    // prints Object {  }/<unavailable> to the web/browser console
    });*/    // for debugging
    revealLinks();
  });
  const observerConfig = {childList: true, subtree: false};
  streamObserver.observe(stream, observerConfig);
} else {
  console.error(`
Warning! The Twitter team modified the page structure.
         The add-on "Twitter Link Deobfuscator" no longer works properly.
         Please update it or, if there is no update available, contact Alin.`);
  warningMessage = document.createElement("div");
  warningMessage.setAttribute("id", "warningMessage");
  warningMessage.style.position = "fixed";
  warningMessage.style.bottom = "10px";
  warningMessage.style.right = "10px";
  warningMessage.style.border = "1px solid #F00";
  warningMessage.style.borderRadius = "5px";
  warningMessage.style.color = "#F00";
  warningMessage.style.backgroundColor = "#FF";
  warningMessage.style.textAlign = "center";
  warningMessage.style.textShadow = "2px 2px 2px #F00";
  warningMessage.style.padding = "3px";
  warningMessage.style.opacity = "1";
  warningMessage.innerHTML = "The Twitter team modified the page structure!\n<br />\n\"Twitter Link Deobfuscator\" no longer works properly.";
  document.body.appendChild(warningMessage);
  warningMessage = document.getElementById("warningMessage");
  warningMessageOpacity = 100;
  fadeOutMessage = window.setTimeout(fadeOutWarning, 2000);
}
