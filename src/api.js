import axios from 'axios';
import * as Sentry from '@sentry/browser';

function success(res) {
    return res.data.data;
}

export default {
    auth: {
        me: async () => {
            let res = await axios.get(`${process.env.VUE_APP_API}/auth/me`);
            let user = res.data.data;
            if (!user.name) {
                user.name = user.username;
            }

            Sentry.configureScope((scope) => {
                scope.setUser({username: user.username});
            });

            return user;
        },
    },

    apps: {
        search: (query) => axios.get(`${process.env.VUE_APP_API}/api/v3/apps`, {
            params: query,
        }).then(success),

        get: (id) => axios.get(`${process.env.VUE_APP_API}/api/v3/apps/${id}?channel=xenial`)
            .then(success),

        stats: () => axios.get(`${process.env.VUE_APP_API}/api/v3/stats`)
            .then(success),
    },

    categories: (lang) => axios.get(`${process.env.VUE_APP_API}/api/v3/categories?lang=${lang}`)
        .then(success),

    manage: {
        search: (query, key) => axios.get(`${process.env.VUE_APP_API}/api/v3/manage?apikey=${key}`, {
            params: query,
        }).then(success),

        get: (id, key) => axios.get(`${process.env.VUE_APP_API}/api/v3/manage/${id}?apikey=${key}`)
            .then(success),

        create: (data, key) => axios.post(`${process.env.VUE_APP_API}/api/v3/manage/?apikey=${key}`, data)
            .then(success),

        update: (id, data, key) => axios.put(`${process.env.VUE_APP_API}/api/v3/manage/${id}?apikey=${key}`, data)
            .then(success),

        remove: (id, key) => axios.delete(`${process.env.VUE_APP_API}/api/v3/manage/${id}?apikey=${key}`)
            .then(success),

        revision: (id, data, key) => axios.post(`${process.env.VUE_APP_API}/api/v3/manage/${id}/revision?apikey=${key}`, data)
            .then(success),
    },

    users: {
        getAll: async (key) => {
            let res = await axios.get(`${process.env.VUE_APP_API}/api/users?apikey=${key}`);
            let users = res.data.data;

            users.forEach((user) => {
                let name = 'UNKNOWN';
                if (user.name && user.email) {
                    name = `${user.name} (${user.email})`;
                }
                else if (user.name && !user.email) {
                    name = user.name;
                }
                else if (!user.name && user.email) {
                    name = user.email;
                }

                if (user.role) {
                    name += ` - ${user.role}`;
                }
                else {
                    name += ' - community';
                }

                user.display_name = name;
            });

            users.sort((a, b) => {
                let aname = a.display_name ? a.display_name.toLowerCase() : '';
                let bname = b.display_name ? b.display_name.toLowerCase() : '';

                if (a.role == 'admin' && b.role != 'admin') {
                    return -1;
                }
                if (a.role != 'admin' && b.role == 'admin') {
                    return 1;
                }
                if (aname > bname) {
                    return 1;
                }
                if (aname < bname) {
                    return -1;
                }

                return 0;
            });

            return users;
        },
    },
};
