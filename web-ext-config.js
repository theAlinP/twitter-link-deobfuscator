module.exports = {
  ignoreFiles: [
    'package.json',
    'package-lock.json',
    'web-ext-config.js',
    'git_hooks'
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
