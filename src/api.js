import axios from 'axios';
import * as Sentry from '@sentry/browser';

function success(res) {
  return res.data.data;
}

export default {
  auth: {
    me: async() => {
      const res = await axios.get(`${process.env.VUE_APP_DOMAIN}/auth/me`);
      const user = res.data.data;
      if (!user.name) {
        user.name = user.username;
      }

      Sentry.configureScope((scope) => {
        scope.setUser({ username: user.username });
      });

      return user;
    },
  },

  apps: {
    search: (query) => axios.get(`${process.env.VUE_APP_DOMAIN}/api/v4/apps`, {
      params: query,
    }).then(success),

    get: (id) => axios.get(`${process.env.VUE_APP_DOMAIN}/api/v4/apps/${id}`)
      .then(success),

    stats: () => axios.get(`${process.env.VUE_APP_DOMAIN}/api/v3/stats`)
      .then(success),

    getReviews: (id) => axios.get(`${process.env.VUE_APP_DOMAIN}/api/v4/apps/${id}/reviews`)
      .then(success),
  },

  categories: (lang, all = false) => {
    let url = `${process.env.VUE_APP_DOMAIN}/api/v3/categories?lang=${lang}`;
    if (all) {
      url += '&all=true';
    }

    return axios.get(url).then(success);
  },

  manage: {
    search: (query, key) => axios.get(`${process.env.VUE_APP_DOMAIN}/api/v3/manage?apikey=${key}`, {
      params: query,
    }).then(success),

    get: (id, key) => axios.get(`${process.env.VUE_APP_DOMAIN}/api/v3/manage/${id}?apikey=${key}`)
      .then(success),

    create: (data, key) => axios.post(`${process.env.VUE_APP_DOMAIN}/api/v3/manage/?apikey=${key}`, data)
      .then(success),

    update: (id, data, key) => axios.put(`${process.env.VUE_APP_DOMAIN}/api/v3/manage/${id}?apikey=${key}`, data)
      .then(success),

    remove: (id, key) => axios.delete(`${process.env.VUE_APP_DOMAIN}/api/v3/manage/${id}?apikey=${key}`)
      .then(success),

    revision: (id, data, key, onUploadProgress) => axios.post(
      `${process.env.VUE_APP_DOMAIN}/api/v3/manage/${id}/revision?apikey=${key}`,
      data,
      { onUploadProgress },
    ).then(success),
  },

  users: {
    getAll: async(key) => {
      const res = await axios.get(`${process.env.VUE_APP_DOMAIN}/api/users?apikey=${key}`);

      const users = res.data.data.map((user) => {
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

        return {
          ...user,
          display_name: name,
        };
      });

      users.sort((a, b) => {
        const aname = a.display_name ? a.display_name.toLowerCase() : '';
        const bname = b.display_name ? b.display_name.toLowerCase() : '';

        if (a.role === 'admin' && b.role !== 'admin') {
          return -1;
        }
        if (a.role !== 'admin' && b.role === 'admin') {
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
