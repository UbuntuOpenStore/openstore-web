export default function(data) {
    data = (data === undefined) ? {} : data;

    return [
        {name: 'description', id: 'description', content: data.description ? data.description : 'OpenStore - The open source app store'},

        // Schema.org markup for Google+
        {itemprop: 'name', id: 'name', content: data.title ? data.title : 'OpenStore'},
        {itemprop: 'description', id: 'idescription', content: data.description ? data.description : 'OpenStore for Ubuntu'},
        {itemprop: 'image', id: 'image', content: data.image ? data.image : 'https://open-store.io/logo.png'},

        // Twitter Card data
        {name: 'twitter:card', id: 'tcard', content: 'summary'},
        {name: 'twitter:title', id: 'ttitle', content: data.title ? data.title : 'OpenStore'},
        {
            name: 'twitter:description',
            id: 'tdescription',
            content: data.description ? data.description : 'OpenStore - The open source app store',
        },
        {name: 'twitter:image:src', id: 'timage', content: data.image ? data.image : 'https://open-store.io/logo.png'},

        // Open Graph data
        {property: 'og:title', id: 'otitle', content: data.title ? data.title : 'OpenStore'},
        {property: 'og:type', id: 'otype', content: 'website'},
        {property: 'og:url', id: 'ourl', content: window.location.href},
        {property: 'og:image', id: 'oimage', content: data.image ? data.image : 'https://open-store.io/logo.png'},
        {
            property: 'og:description',
            id: 'odescription',
            content: data.description ? data.description : 'OpenStore - The open source app store',
        },
        {property: 'og:site_name', id: 'ositename', content: 'OpenStore'},
    ];
}
