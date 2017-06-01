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
* Install NPM dependencies (it's best to run this in the VM):
    * Run: `npm install`
* Attach to the docker container (if needed - from inside the vagrant VM):
    * Attach to the api container: `attach_api`
    * Attach to the web container: `attach_web`
* Update your system's hosts file:
    * Add `192.168.58.123 local.open.uappexplorer.com`
* Visit the site:
    * In your browser go to: `local.open.uappexplorer.com`
* Profit!

## App Api

* GET /api/apps
    * Returns a list of all non-deleted apps
    * Optionally takes the query string parameters:
        * frameworks: A comma separated list of frameworks, limits results to only apps with one of the specified frameworks
        * architecture: One of all, armhf, i386, or x86_64, limits results to only apps that support that architecture
    * Format:

    ```
    {
        architecture: String,
        author: String,
        category: String,
        description: String,
        filesize: Number,
        framework: String,
        icon: Url,
        id: String,
        license: String,
        name: String,
        package: Url,
        source: String,
        tagline: String,
        types: Array,
        version: String
    }
    ```

* GET /api/apps/:id
    * Returns an app matching :id
    * Returns 404 if not found
    * Format (see above)

* POST /api/apps
    * Creates a new app
    * Takes a click package and optional arguments
    * Uploaded file should be sent with the content type of multipart/form-data
    * File should be uploaded with the name "file"
    * Optional body arguments:

    ```
    {
        category: String,
        description: String,
        license: String,
        source: String,
        tagline: String
    }
    ```

* PUT /api/apps/:id
    * Updates an existing app with a matching :id
    * See POST for more information about file uploaded and format
* DELETE /api/apps/:id
    * Mark package as deleted with matching :id

## Contributors ##

* [Brian Douglass](http://bhdouglass.com/)
* [Michael Zanetti](http://notyetthere.org/)
* [Marius Gripsgård](http://mariogrip.com/)
* [Michał Prędotka](http://mivoligo.com/) (Telegram banner)

## License ##

Copyright (C) 2016 [Brian Douglass](http://bhdouglass.com/)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3, as published
by the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranties of MERCHANTABILITY, SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
