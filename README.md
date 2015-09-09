# selectboxExtended

This is an extension (not a fork/replacement) for [jQuery Selectbox](http://www.bulgaria-web-developers.com/projects/javascript/selectbox/) which has been developed separately by Dimitar Ivanov.

## Usage

Download the original plugin and include `selectboxExtended.js` after the original plugin.

Initialization should be done through `selectboxExtended` (e.g. `jQuery('select').selectboxExtended()`). Please refer to the [original plugin](http://www.bulgaria-web-developers.com/projects/javascript/selectbox/) for any options.

At the current version, only instantiation behaves different. You may continue to call `selectbox` for all other options after initialization.


## License

This extension is being released under MIT license.

The original plugin has been released under MIT and GPL licenses.

Note that you can combine MIT licensed code with GPL licensed code without any problems as MIT and GPLv2 are considered compatible, see the [GPL FAQ]( http://www.gnu.org/licenses/gpl-faq.html#WhatDoesCompatMean) for details.


## Enhancements

Instances created through `selectboxExtended` feature the following enhancements over the original plugin:

* typing will filter options for the focused selectbox and jump to the first matching item (in both closed and open state) which provides a more native experience compared to pure selects
* navigation using up/down arrows sets as well as typing will instantly set the selected value active
* (Shift-)TAB can be used to navigate between input fields if a selectbox instance is focused (this appears to have been intended by the original plugin but didn't work?)
