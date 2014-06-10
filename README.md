OpenEIS UI
==========

Static (AngularJS) front-end client to REST API (Django)

Requirements
------------------

* [Node.js](http://nodejs.org/)
* [npm](https://www.npmjs.org/) (often included with Node.js)
* npm modules [bower](http://bower.io/) and [grunt-cli](http://gruntjs.com/)


Installing dependencies
-----------------------

    [openeis-ui]$ npm install
    [openeis-ui]$ bower install


Building
--------

Single build: (production/minified)

    [openeis-ui]$ grunt build

Single build: (development)

    [openeis-ui]$ grunt build-dev

Continuous development build (watch for changes and build automatically):

    [openeis-ui]$ grunt
