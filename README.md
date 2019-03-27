# Twitter Link Deobfuscator

Reveals the real destination of the links from tweets, which are usually concealed using shortened URLs.

## How it works
The Twitter servers secretly conceal the hyperlinks' destinations with shortened [t.co](https://t.co "https://t.co") URLs. This add-on replaces the shortened URLs with the original ones.

Please note that TLD will expand URLs from t.co to other shortened URLs, like bit.ly or mzl.la, if the user originally posted those shortened URLs, but it will not further expand the shortened URLs to their final destinations.

NOTE: This extension comes into action only on twitter.com and stays dormant when other websites are browsed.

The add-on can be enabled and disabled by clicking its icon from the browser toolbar. Once the add-on is installed and while it is enabled it will wait in the background for a page from twitter.com to be opened and only then it will go into action and scan the Twitter Timeline for any hyperlinks with shortened URLs and clean them.

Twitter Link Deobfuscator only needs the minimum amount of permissions. It does not collect, use, store nor share user data.

## Support
In order to report bugs and ask for support please use [Twitter Link Deobfuscator](https://github.com/theAlinP/twitter-link-deobfuscator "Twitter Link Deobfuscator")'s GitHub page instead.

## License
This software is licensed under the MIT License (MIT Expat License). The full text can be found in the file LICENSE.
