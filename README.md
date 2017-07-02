# OpenStore Web

Web viewer and api for the [OpenStore](http://notyetthere.org/openstore-tweakgeek-and-more/).

## Reporting Bugs

Please report any bugs/features/requests in our [bug tracker](https://github.com/UbuntuOpenStore/openstore-meta/issues).

## Development

* Install [vagrant](http://vagrantup.com/)
* Install the docker compose vagrant plugin:
    * Run: `vagrant plugin install vagrant-docker-compose`
* Start vagrant:
    * Run: `vagrant up`
* Attach to the docker container (if needed - from inside the vagrant VM):
    * Attach to the api container: `attach_api`
    * Attach to the web container: `attach_web`
* Update your system's hosts file:
    * Add `192.168.58.123 local.open.uappexplorer.com`
* Visit the site:
    * In your browser go to: `local.open.uappexplorer.com`
* Login
    * Login to the OpenStore to setup your user
    * Upgrade your user to an admin (From inside the vagrant VM): `docker exec -it openstore_api_1 node /srv/openstore/api/bin/setup-admin`
* Profit!

## Contributors ##

* [Brian Douglass](http://bhdouglass.com/)
* [Michael Zanetti](http://notyetthere.org/)
* [Marius Gripsgård](http://mariogrip.com/)
* [Michał Prędotka](http://mivoligo.com/)

## License ##

Copyright (C) 2017 [Brian Douglass](http://bhdouglass.com/)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3, as published
by the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranties of MERCHANTABILITY, SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
