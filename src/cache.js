let back = {name: 'browse'};

// TODO replace with vuex
export default {
    setBack(url) {
        back = url;
    },
    getBack() {
        return back;
    },
};
