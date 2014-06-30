OpenEIS UI
==========

Static (AngularJS) front-end client to REST API (Django)


Requirements
------------

* [Node.js](http://nodejs.org/)
* [npm](https://www.npmjs.org/) (included with Node.js 0.6.3+) 
* npm modules [bower](http://bower.io/) and [grunt-cli](http://gruntjs.com/)
* [Ruby](https://www.ruby-lang.org/en/installation/)
* Ruby gem [Sass](http://sass-lang.com/)


Installing environment dependencies
-----------------------------------

    $ npm install -g bower
    $ npm install -g grunt-cli
    $ gem install sass


Installing project dependencies
-------------------------------

    $ cd /path/to/openeis-ui
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
