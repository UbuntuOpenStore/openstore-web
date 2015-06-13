# Open App Store Web #

Web viewer for the [Open App Store](http://notyetthere.org/openstore-tweakgeek-and-more/).

## Development ##

* Install mongodb:
    * Ubuntu: `apt-get install mongodb`
    * Arch Linux: `pacman -S mongodb`
* Install gulp and supervisor:
    * Run: `npm install gulp supervisor --global`
* Install NPM dependencies:
    * Run: `npm install`
* Start up webserver:
    * Run: `npm start`
    * Go to: `localhost:3000`

## App Api ##

* GET /api/apps
    * Returns a list of all non-deleted apps
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

## License ##

Copyright (C) 2015 [Brian Douglass](http://bhdouglass.com/)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3, as published
by the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranties of MERCHANTABILITY, SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
