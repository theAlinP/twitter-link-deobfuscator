# Changelog

All notable changes to this project will be documented in this file.

### [1.7.2](https://github.com/theAlinP/twitter-link-deobfuscator/compare/1.7.1...1.7.2) (2024-05-24)


### Bug Fixes

* uncloak the Twitter Cards from pinned and regular tweets from profile pages ([89cd135](https://github.com/theAlinP/twitter-link-deobfuscator/commit/89cd135915657806fd7fc8160674751c6c0320ab))
* detect and uncloak the text links again ([699bcce](https://github.com/theAlinP/twitter-link-deobfuscator/commit/699bcce231b69e612ee2c51766996eb7870b1c75))
* run on the x.com domain, too ([ce3d06c](https://github.com/theAlinP/twitter-link-deobfuscator/commit/ce3d06c459c05809331dbd4d8fc8b60a686cfd49))


### Other updates

* update the dependencies ([902f5dd](https://github.com/theAlinP/twitter-link-deobfuscator/commit/902f5ddeecd08e9f18d803b5e4446504d95acf5d))

### [1.7.1](https://github.com/theAlinP/twitter-link-deobfuscator/compare/1.7.0...1.7.1) (2024-04-21)


### Bug Fixes

* uncloak the text links again ([7659813](https://github.com/theAlinP/twitter-link-deobfuscator/commit/765981309356c81b2bdb9810664eb72d192a67c4)), closes [#35](https://github.com/theAlinP/twitter-link-deobfuscator/issues/35)


### Other updates

* update the dependencies ([3a5ea76](https://github.com/theAlinP/twitter-link-deobfuscator/commit/3a5ea7610023ac6eca31c5298a479905a2900676)), closes [#34](https://github.com/theAlinP/twitter-link-deobfuscator/issues/34)
* update the year from the LICENSE file ([6e8c315](https://github.com/theAlinP/twitter-link-deobfuscator/commit/6e8c31579668394d8dbd6c0ceff9550175cfde5e))


## [1.7.0](https://github.com/theAlinP/twitter-link-deobfuscator/compare/1.6.1...1.7.0) (2023-06-05)


### Features

* add Chinese(zh) locale ([ac8ae12](https://github.com/theAlinP/twitter-link-deobfuscator/commit/ac8ae1236102390993c69a87d58362815367396a))


### Bug Fixes

* uncloak the Twitter Cards from quoted tweets ([ff0b22a](https://github.com/theAlinP/twitter-link-deobfuscator/commit/ff0b22ab31f1e92d2481ecd0fe0f0675d993afcd))


### Other updates

* **deps:** bump cacheable-request and got ([a18f169](https://github.com/theAlinP/twitter-link-deobfuscator/commit/a18f1691ca56c8fabd5e5ce574f744823a19fb7e))
* update the dependencies ([f0b7462](https://github.com/theAlinP/twitter-link-deobfuscator/commit/f0b7462b16a9f37fef733d87cfc55a559b106540)), closes [#28](https://github.com/theAlinP/twitter-link-deobfuscator/issues/28)
* update the dependencies ([92b8280](https://github.com/theAlinP/twitter-link-deobfuscator/commit/92b8280390292347bece8070a323aa8ea057cfea))


### [1.6.1](https://github.com/theAlinP/twitter-link-deobfuscator/compare/1.6.0...1.6.1) (2022-10-23)


### Bug Fixes

* uncloak the text links from replies to tweets with photos ([de304ec](https://github.com/theAlinP/twitter-link-deobfuscator/commit/de304ec424a7cd4859f1d1c74da4dfa6fda991e6))
* uncloak the Twitter Cards from the top tweets from the "Home" page ([6cd15da](https://github.com/theAlinP/twitter-link-deobfuscator/commit/6cd15daa8195308b465fb7cb3e43aba60c2530ad))


### Other updates

* update the dependencies ([0f738d5](https://github.com/theAlinP/twitter-link-deobfuscator/commit/0f738d5b0c363291c79a80e0a5ff0e87e99f0057))
* improve readability ([1115150](https://github.com/theAlinP/twitter-link-deobfuscator/commit/1115150ffbd7baab9d5c7f11653cfceb43f5b242))

## [1.6.0](https://github.com/theAlinP/twitter-link-deobfuscator/compare/1.5.2...1.6.0) (2022-09-04)


### Features

* support Twitter Tor service(.onion domain) ([d520aa7](https://github.com/theAlinP/twitter-link-deobfuscator/commit/d520aa715c5568653daad94b5a1674b3c588e159))


### Other updates

* update the dependencies ([742512d](https://github.com/theAlinP/twitter-link-deobfuscator/commit/742512d5aa200f441bdbf5c38ca4a70af2ca0d07))
* replace the "/" between the domains to not confuse them with an URL ([0b67acf](https://github.com/theAlinP/twitter-link-deobfuscator/commit/0b67acf7e489ad727778e9cd83db6e504a38a1e6))

### [1.5.2](https://github.com/theAlinP/twitter-link-deobfuscator/compare/1.5.1...1.5.2) (2022-07-07)


### Bug Fixes

* uncloak the Twitter Cards from additional replies to tweets ([9c92e32](https://github.com/theAlinP/twitter-link-deobfuscator/commit/9c92e321c3edd16ea719e967b683eada9ada6932))
* uncloak the Twitter Cards from the "Home" page - again ([9dcb74c](https://github.com/theAlinP/twitter-link-deobfuscator/commit/9dcb74c039876e811aead068a3e29197af7931b5))
* improve the detection of polls from Twitter Cards ([99d0acb](https://github.com/theAlinP/twitter-link-deobfuscator/commit/99d0acb5599aa9409701570c65a0ccd9e6e83da6))


### Other updates

* update the dependencies ([408aab9](https://github.com/theAlinP/twitter-link-deobfuscator/commit/408aab92ac49c9bddc74ee36cd2a0acfb8ed4eca))

### [1.5.1](https://github.com/theAlinP/twitter-link-deobfuscator/compare/1.5.0...1.5.1) (2022-06-05)


### Bug Fixes

* clean the Twitter Cards from individual tweets ([643cb3a](https://github.com/theAlinP/twitter-link-deobfuscator/commit/643cb3a163d005b62ea0d404a0cd47bf6f7acf2c))


### Other updates

* update the dependencies ([db71137](https://github.com/theAlinP/twitter-link-deobfuscator/commit/db71137b5b0ad0ee9d6e427843b908f5082d60e1))

## [1.5.0](https://github.com/theAlinP/twitter-link-deobfuscator/compare/1.4.0...1.5.0) (2022-05-23)


### Features

* uncloak the Twitter Cards from "Topic" pages ([b4932cb](https://github.com/theAlinP/twitter-link-deobfuscator/commit/b4932cb55e872086164fb0c13e3f536c8d013166))
* uncloak the text links from "Topic" pages ([9014428](https://github.com/theAlinP/twitter-link-deobfuscator/commit/9014428ea4d8db52d0bba2b7887b4ac365902a04))


### Bug Fixes

* uncloak the Twitter Cards from "List" pages ([d5990b3](https://github.com/theAlinP/twitter-link-deobfuscator/commit/d5990b39a8e38e80263cbd8a69212f0a862a66d6))
* uncloak the Twitter Cards from profile pages ([60b7e30](https://github.com/theAlinP/twitter-link-deobfuscator/commit/60b7e30a60cb93f1a6fa12b91036c00bc7b2efbf))
* fix the way to detect "event" or unknown pages ([a2ebf6d](https://github.com/theAlinP/twitter-link-deobfuscator/commit/a2ebf6dbf18ed7f64c83366c311337db4ceb89c8))
* uncloak the text links from the Direct Messages box/drawer ([95e6811](https://github.com/theAlinP/twitter-link-deobfuscator/commit/95e68114254d57cef061e6d29f88d17807da824d))


### Other updates

* remove unnecessary optional chaining ([fde4391](https://github.com/theAlinP/twitter-link-deobfuscator/commit/fde439117e4bcaf4f8ab62c76693dbb2c8c5441c))
* update the dependencies ([b4f3a78](https://github.com/theAlinP/twitter-link-deobfuscator/commit/b4f3a78aaa4c9a2ab8ce86f5a5ab305d470d7270))

## [1.4.0](https://github.com/theAlinP/twitter-link-deobfuscator/compare/1.3.9...1.4.0) (2021-10-05)


### Features

* uncloak the text links from "event" pages ([e1b24cd](https://github.com/theAlinP/twitter-link-deobfuscator/commit/e1b24cd99a854d292d4d7a33e6715a92648430e6))
* uncloak the Twitter Cards from "event" pages ([cc42ce7](https://github.com/theAlinP/twitter-link-deobfuscator/commit/cc42ce70724b3baf2b5df9c79716250498b5553d))
* uncloak the Twitter Cards from the "Explore" page ([206a018](https://github.com/theAlinP/twitter-link-deobfuscator/commit/206a01833cbed2e713685d2f3b0f986b25ab0bf5))


### Other updates

* update the dependencies ([7a9ef46](https://github.com/theAlinP/twitter-link-deobfuscator/commit/7a9ef46fae721896f6fff271dfd8262309cc130c))

### [1.3.9](https://github.com/theAlinP/twitter-link-deobfuscator/compare/1.3.8...1.3.9) (2021-09-18)


### Bug Fixes

* uncloak the Twitter Cards from the retweets on the "Home" page ([e155786](https://github.com/theAlinP/twitter-link-deobfuscator/commit/e155786c85b13ee97f6236735becf3599feec255))
* uncloak the Twitter Cards from the "Lists" page again ([db0e1d4](https://github.com/theAlinP/twitter-link-deobfuscator/commit/db0e1d48975b1ff02cceb899671d999255bebbb5))
* uncloak the Twitter Cards from the Bookmarks page again ([69dfc33](https://github.com/theAlinP/twitter-link-deobfuscator/commit/69dfc33482a0b75548245d8d81ec183f59d26770))
* uncloak the Twitter Cards from clicked-on tweets again ([0f47e9f](https://github.com/theAlinP/twitter-link-deobfuscator/commit/0f47e9f9ee9cf3506a6e3233a3b0e467fe1ffa64))


### Other updates

* update the dependencies ([447c92f](https://github.com/theAlinP/twitter-link-deobfuscator/commit/447c92f7a84a689ad8cab7399a3e681cadcc0077))
* remove references to object properties from outdated nestings ([0b9229c](https://github.com/theAlinP/twitter-link-deobfuscator/commit/0b9229ceac79798a22f05ddb0964c8fad8f06f24))
* merge 2 tweet cleaning functions into 1 ([29f3429](https://github.com/theAlinP/twitter-link-deobfuscator/commit/29f3429ec50b105195289706273ea9a1ca920baf))
* create a separate function to select and return the tweet entries ([a56497c](https://github.com/theAlinP/twitter-link-deobfuscator/commit/a56497c521ffa0405ef8f7ce2ecaadbbddcb4e03))
* use the strict equality operator where possible ([e0be872](https://github.com/theAlinP/twitter-link-deobfuscator/commit/e0be8721f32b1260792424930cb18ffe83b55859))
* use nesting instead of continue/return to control code execution ([b065410](https://github.com/theAlinP/twitter-link-deobfuscator/commit/b06541040dd429c753c9e55d31f5fa62614186bc))
* remove unnecessary return statement ([ce530e1](https://github.com/theAlinP/twitter-link-deobfuscator/commit/ce530e1a834f5a9f6eb709c7cdd531b129b23272))
* reduce nesting ([50c7cff](https://github.com/theAlinP/twitter-link-deobfuscator/commit/50c7cffd57c14f9a5f457605340c45ea297afc34))
* remove duplications and similar code ([a79be0e](https://github.com/theAlinP/twitter-link-deobfuscator/commit/a79be0e0167164ff773402aa3e6f15265ac04b30))
* rephrase a JSDoc comment ([fe44d4e](https://github.com/theAlinP/twitter-link-deobfuscator/commit/fe44d4e9c41e89ed1ac407bb71787bc1c2234d17))
* add missing optional chaining ([3171101](https://github.com/theAlinP/twitter-link-deobfuscator/commit/317110163c21fcb11e25ce76488edadbbfbefe4b))
* remove unnecessary optional chaining ([7670aa4](https://github.com/theAlinP/twitter-link-deobfuscator/commit/7670aa4eefccef22c2f22b63e342df4df082abd2))

### [1.3.8](https://github.com/theAlinP/twitter-link-deobfuscator/compare/1.3.7...1.3.8) (2021-06-22)


### Bug Fixes

* uncloak the Twitter Cards from the profile pages again ([0dcceca](https://github.com/theAlinP/twitter-link-deobfuscator/commit/0dcceca167a054ad791047cc5ed8c1406be8f9e0))


### Other updates

* update the dependencies ([ba6b3fc](https://github.com/theAlinP/twitter-link-deobfuscator/commit/ba6b3fc264a39e22905e364eb7ed51be17572c78))
* remove unnecessary code ([a85587f](https://github.com/theAlinP/twitter-link-deobfuscator/commit/a85587f223646706fdcea6005d16b33cb24b09b5))
* update the ESLint configuration file ([6fb09e8](https://github.com/theAlinP/twitter-link-deobfuscator/commit/6fb09e8ab59832dfde3f4d29690de55c059fc311))

### [1.3.7](https://github.com/theAlinP/twitter-link-deobfuscator/compare/1.3.6...1.3.7) (2021-05-12)


### Bug Fixes

* **background_script.js:** uncloak the Twitter Cards from the profile pages ([d75109b](https://github.com/theAlinP/twitter-link-deobfuscator/commit/d75109ba860594680206e898d3cdc2ff4eb7a9ee))


### Other updates

* update dependencies ([24a4dec](https://github.com/theAlinP/twitter-link-deobfuscator/commit/24a4dec7624eb9db0fd272c842be8993bcacc173))

### [1.3.6](https://github.com/theAlinP/twitter-link-deobfuscator/compare/1.3.5...1.3.6) (2021-05-06)


### Bug Fixes

* use optional chaining to prevent crashes in some browsers ([7ae7be0](https://github.com/theAlinP/twitter-link-deobfuscator/commit/7ae7be0daf8dda6872ff55bf5285c7cd811a69e7)), closes [#17](https://github.com/theAlinP/twitter-link-deobfuscator/issues/17)


### Other updates

* configure standard-version ([dae38a8](https://github.com/theAlinP/twitter-link-deobfuscator/commit/dae38a89b6bf6172ed097450be4a8b78e3a12b29))
* add Standard Version as a development dependency ([6b6399e](https://github.com/theAlinP/twitter-link-deobfuscator/commit/6b6399ed4bce981a2505a959314a0a142370c927))
* convert the Commitlint configuration to a JSON file ([67bfd87](https://github.com/theAlinP/twitter-link-deobfuscator/commit/67bfd87e3e7dd2aa24ebf2f49f6ec280487694c7))
* add Commitlint and Husky as development dependencies ([f2bc4a8](https://github.com/theAlinP/twitter-link-deobfuscator/commit/f2bc4a80dbcc2f564938125552dcfdafd04281e4))
* add Commitizen as a development dependency ([d5caad4](https://github.com/theAlinP/twitter-link-deobfuscator/commit/d5caad46e49427f450beae0705ecd9e856635941))
* add a pre-commit hook to lint the source files ([6af4e49](https://github.com/theAlinP/twitter-link-deobfuscator/commit/6af4e499ff4802f297aef36440722b73484dbf74))
* add Web-ext as a development dependency ([bad55b5](https://github.com/theAlinP/twitter-link-deobfuscator/commit/bad55b53313c5cd3d5544bce292ff6261f945f41))
* create a package.json file ([e583d39](https://github.com/theAlinP/twitter-link-deobfuscator/commit/e583d39731295530ae38fd8f86fed3b3b49cf9b7))
* add a .gitignore file to ignore the built extension packages ([01661b9](https://github.com/theAlinP/twitter-link-deobfuscator/commit/01661b9799ebe29335d50e950c93b19e0d38018b))
* add a Conventional Commits badge ([152a7ce](https://github.com/theAlinP/twitter-link-deobfuscator/commit/152a7ce684e6276e94fc4018ab07d7a4f769927c))
