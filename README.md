# Twitter Link Deobfuscator

Reveals the original destinations of the links and Twitter Cards from tweets as well as from replies, but also the "Website" link and others, which are usually concealed using shortened URLs.

Okay, okay. I know that "deobfuscator" is not a real word, but it seems like the right word to describe what the add-on does. Plus, if "obfuscator" is a real one, then I think "deobfuscator" deserves some consideration, too.

## How it works
The Twitter servers secretly conceal the hyperlinks' destinations with shortened [t.co](https://t.co "https://t.co") URLs. This add-on replaces the shortened URLs with the original ones.

Please note that TLD will expand URLs from t.co to other shortened URLs, like bit.ly or mzl.la, if the user originally posted those shortened URLs, but it will not further expand the original shortened URLs to their final destinations.

NOTE: This extension comes into action only on twitter.com and stays dormant when other websites are browsed.

The add-on can be enabled and disabled by clicking its icon from the browser toolbar. Once the add-on is installed and while it is enabled it will wait in the background for a page from twitter.com to be opened and only then it will go into action and scan the web page for any hyperlinks with shortened URLs and clean them.

Twitter Link Deobfuscator only needs the minimum amount of permissions. It does not collect, use, store nor share user data.

## Installation
The easiest and safest way would be to go to AMO (addons.mozilla.org) and install the stable [Twitter Link Deobfuscator](https://addons.mozilla.org/en-US/firefox/addon/twitter-link-deobfuscator/ "Twitter Link Deobfuscator") from there.

You can then (or before) clone/download this Git repository and temporarily install TLD from the latest commit. Please note that it might be buggy because the latest commits are not tested extensively. To install an add-on temporarily you need to enter "about:debugging" in the browser's address bar, click "Load Temporary Add-on", in the new window that appears select the "manifest.json" file from TLD's repository then click "Open". If TLD was not already installed, it will be installed temporarily until the browser is closed and if it was, it will be replaced temporarily by the updated add-on from the repository.

There is another way to install add-ons temporarily, and that is by using the [web-ext](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext "Getting started with web-ext") command line tool. Web-ext is a Node.js module that can do a lot more than just allow installing add-ons but I leave that for you to discover.

## Disclaimer
TLD is guaranteed to work correctly on [twitter.com](https://twitter.com "https://twitter.com").

I cannot guarantee that it will work on any of its subdomains (about.twitter.com, analytics.twitter.com, careers.twitter.com, data.twitter.com, developer.twitter.com, help.twitter.com, media.twitter.com, marketing.twitter.com etc.). Because not many people browse those subdomains and because there is not much user generated content there, in the sense of tweets, just some occasional quoted ones, I did not spend much time to make it work there. I intend to get to it at some point, but I don't know when. If someone says they need TLD to work on subdomains, I will make this a priority.

One notable mention is the subdomain [mobile.twitter.com](https://mobile.twitter.com "https://mobile.twitter.com") which is the version optimized for mobile devices. Unlike the standard version \([https://twitter.com](https://twitter.com "https://twitter.com")\), the mobile-oriented one does not embed in the page the original URLs of the hyperlinks posted by the user, probably to save bandwidth. This is a major problem because TLD cannot clean the links if it cannot find the original URLs. There might be a workaround around this but only by sacrificing your privacy which would defeat the purpose of this add-on, therefore I will not use it. You should assume that TLD doesn't work on mobile.twitter.com, either.

## For developers
You can find detailed JSDoc comments in the source code that will help you understand how the add-on works. You can generate documentation from them using the [jsdoc](https://github.com/jsdoc/jsdoc/ "JSDoc") tool as described in the page linked earlier.

## Support
In order to report bugs and ask for support please use [Twitter Link Deobfuscator](https://github.com/theAlinP/twitter-link-deobfuscator "Twitter Link Deobfuscator")'s GitHub page instead.

## License
This software is licensed under the MIT License (MIT Expat License). The full text can be found in the file LICENSE.
