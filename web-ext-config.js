module.exports = {
  ignoreFiles: [
    'commitlint.config.js',
    'package.json',
    'package-lock.json',
    'web-ext-config.js'
  ],
  run: {
    browserConsole: true,
    firefox: "/opt/firefox-aurora/firefox",
    startUrl: [
      "about:debugging#/runtime/this-firefox",
      "https://twitter.com/firefox"
    ]
  }
};
