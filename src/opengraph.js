export default function(data) {
    data = (data === undefined) ? {} : data;

    return [
        {name: 'description', content: data.description ? data.description : 'OpenStore - The open source app store'},

        // Schema.org markup for Google+
        {itemprop: 'name', content: data.title ? data.title : 'OpenStore'},
        {itemprop: 'description', content: data.description ? data.description : 'OpenStore for Ubuntu'},
        {itemprop: 'image', content: data.image ? data.image : 'https://open-store.io/assets/logo.png'},

        // Twitter Card data
        {name: 'twitter:card', content: 'summary'},
        {name: 'twitter:title', content: data.title ? data.title : 'OpenStore'},
        {name: 'twitter:description', content: data.description ? data.description : 'OpenStore - The open source app store'},
        {name: 'twitter:image:src', content: data.image ? data.image : 'https://open-store.io/assets/logo.png'},

        // Open Graph data
        {property: 'og:title', content: data.title ? data.title : 'OpenStore'},
        {property: 'og:type', content: 'website'},
        {property: 'og:url', content: window.location.href},
        {property: 'og:image', content: data.image ? data.image : 'https://open-store.io/assets/logo.png'},
        {property: 'og:description', content: data.description ? data.description : 'OpenStore - The open source app store'},
        {property: 'og:site_name', content: 'OpenStore'},
    ];
}
