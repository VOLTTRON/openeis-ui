OpenEIS UI
==========

Static (AngularJS) front-end client to REST API (Django)


System requirements
-------------------

* [Node.js](http://nodejs.org/)
* [npm](https://docs.npmjs.com/getting-started/installing-node) (included with Node.js 0.6.3+)
* [Ruby](https://www.ruby-lang.org/en/documentation/installation/)
* [RubyGems](https://rubygems.org/pages/download)


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

- Note if you get an error on the bower install (ECMDERR Failed to execute "git ls-remote --tags --heads   git://github.com/angular/bower-angular.git").  The problem should be fixed by issuing the following 
git command.

    git config --global url."https://".insteadOf git:// 


Module override
---------------

A build of the openeis-ui module is bundled with [openeis]
(https://github.com/volttron/openeis). To serve your working copy
instead, install it over the bundled module with `pip`:

    $ cd /path/to/openeis
    [openeis]$. env/bin/activate
    (openeis)[openeis]$ pip install --editable /path/to/openeis-ui


Building
--------

Continuous development build:
(automatically build and refresh page on file change)

    [openeis-ui]$ grunt

Single development build:

    [openeis-ui]$ grunt build-dev

Single production (minified) build:

    [openeis-ui]$ grunt build


License
-------

Copyright (c) 2014, Battelle Memorial Institute
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those
of the authors and should not be interpreted as representing official policies,
either expressed or implied, of the FreeBSD Project.


This material was prepared as an account of work sponsored by an
agency of the United States Government.  Neither the United States
Government nor the United States Department of Energy, nor Battelle,
nor any of their employees, nor any jurisdiction or organization
that has cooperated in the development of these materials, makes
any warranty, express or implied, or assumes any legal liability
or responsibility for the accuracy, completeness, or usefulness or
any information, apparatus, product, software, or process disclosed,
or represents that its use would not infringe privately owned rights.

Reference herein to any specific commercial product, process, or
service by trade name, trademark, manufacturer, or otherwise does
not necessarily constitute or imply its endorsement, recommendation,
or favoring by the United States Government or any agency thereof,
or Battelle Memorial Institute. The views and opinions of authors
expressed herein do not necessarily state or reflect those of the
United States Government or any agency thereof.

PACIFIC NORTHWEST NATIONAL LABORATORY
operated by BATTELLE for the UNITED STATES DEPARTMENT OF ENERGY
under Contract DE-AC05-76RL01830
