#!/bin/bash

apt-get install -y nginx
ln -s /srv/openstore/env/proxy.conf /etc/nginx/conf.d/proxy.conf
rm /etc/nginx/sites-enabled/default
service nginx restart

sed -i 's/#force_color_prompt/force_color_prompt/g' /home/vagrant/.bashrc
echo 'cd /srv/openstore' >> /home/vagrant/.bashrc

ln -s /srv/openstore/env/attach_api.sh /usr/local/bin/attach_api
ln -s /srv/openstore/env/attach_web.sh /usr/local/bin/attach_web

chmod +x /usr/local/bin/attach_api
chmod +x /usr/local/bin/attach_web
