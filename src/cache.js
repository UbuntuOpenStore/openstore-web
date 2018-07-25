let back = {name: 'browse'};

export default {
    setBack(url) {
        back = url;
    },
    getBack() {
        return back;
    },
};
