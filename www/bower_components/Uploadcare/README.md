Uploadcare Widget
=================

[Uploadcare](https://uploadcare.com) is an PaaS for file uploads,
cloud storage and on-the-fly image transformations.

This package contains compiled version of the widget.

  * [Source code](https://github.com/uploadcare/uploadcare-widget)
  * [Issues](https://github.com/uploadcare/uploadcare-widget/issues)
  * [License](https://github.com/uploadcare/uploadcare-widget/blob/master/LICENSE)
  * [Widget documentation](https://uploadcare.com/documentation/widget/)
  * [JavaScript API documentation](https://uploadcare.com/documentation/javascript_api/)

## Files

Uploadcare library, requiring jQuery as a dependency:

  * uploadcare.js
  * uploadcare.min.js

Standalone Uploadcare library with no external dependences:

  * uploadcare.full.js
  * uploadcare.full.min.js

## How to use it

Add following code to header of your web page:

    <script>
        // Widget settings
        UPLOADCARE_PUBLIC_KEY = 'your_public_key';
    </script>
    <script src="/bower_components/jquery/jquery.js" charset="utf-8"></script>
    <script src="/bower_components/uploadcare/uploadcare.min.js" charset="utf-8"></script>

Add the tag in the place where widget needs to be displayed:

    <input type="hidden" role="uploadcare-uploader">

For more info, see [Documentation](https://uploadcare.com/documentation/)
