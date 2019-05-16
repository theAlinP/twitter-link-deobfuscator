"use strict";


let warningMessage;
let warningMessageOpacity;
let fadeOutMessage;


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



browser.storage.local.get()
  .then((storedSettings) => {
    //console.log("The addon state is: " + storedSettings.enabled);    // for debugging
    if (storedSettings.enabled === true) {
      //console.log("The value is true.");    // for debugging

      const stream = document.querySelector("#stream-items-id") || console.error("The timeline was not found");

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
    /*} else if (storedSettings.enabled === false) {
      console.log("The value is false");
    } else {
      console.log("The value is neither true nor false");*/    // for debugging
    }
  })
  .catch(() => {
    console.error("Error retrieving stored settings");
  });
