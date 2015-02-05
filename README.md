## TO DO
- [ ] [Items listed here](https://tree.taiga.io/project/nogbit-devops-infrastructure/task/40)
- [ ] go through all the steps and double check
- [ ] check for typos etc
- [ ] Make this open source

## UW Shibboleth NodeJS/Express with Nginx proxy
This repo contains an example NodeJS web application using Express.  It also includes an nginx conf that can eaisly be duplicated to permit multiple domains running on the same server.

### OS and Nginx
You can skip this section if you already have a server setup.  It's included here to provide a complete view into what is known to work in production which always seems to be lacking elsewhere.  The key thing here is this work nicely with a wildcard cert such as ``*.foster.washington.edu`` and makes for a very simple to manage nginx proxy into your NodeJS apps.

#### Ubuntu 14.04
Tweak instructions for other servers.  This assumes you created a new user and are logged in as it.  Ideally we don't want to run our apps as the root account and the following steps provide that for us.  NOTE: You will need to manually edit your bash.rc whenever you install a newer version of node via nvm.

    cd ~/
    curl https://raw.githubusercontent.com/creationix/nvm/v0.18.0/install.sh | bash
    nvm install 0.10.36
    echo "nvm use v0.10.36 > /dev/null" >> .bashrc
    # restart or source shell

#### Nginx
Make it so our non root account can run ports (80 for example) that are typically reserved only for root and then set Nginx to auto start.

    sudo apt-get install libcap2-bin
    sudo setcap cap_net_bind_service=+ep `which node`
    sudo apt-get install nginx
    sudo service nginx start
    update-rc.d nginx defaults

#### InCommon SSL Intermediate cert

1. Copy the [second chain from the page here](https://wiki.cac.washington.edu/display/infra/InCommon+SSL+Intermediate+Certificates).
2. Paste into a file ``/usr/local/share/ca-certificates/UniversityOfWashington.crt``
3. Run ``sudo update-ca-certificates -v``...the output should be very long, and at the end should have ``1 added, 0 removed; done``, if not, it didn't work.

### Express NodeJS Server
No clone this onto your server (or locally and deploy somehow).  For ``sitename.conf`` you may want to be explicit and instead name it something like ``scholarships.foster.washington.edu``. You can do this any number of times.  Nginx will automatically pick up any files you have in this directory.  Just make sure to edit them to have the correct paths to your cert and key as well as the correct domain name and port numbers.  Everything must match up otherwise your proxy wont work.

    cd ~/
    git clone [this repo]
    npm install
    cp sitename.conf /etc/nginx/conf.d/sitename.conf

#### Startup in Development
On a development box the site wont fire up the Shibboleth module and will simply return a dummy user for a user context.

    node bin/mysiteWWW

You should change the name of the ``mysiteWWW``.  It's a good idea to name the file something like ``scholarshipsWWW`` for example so it represents what your app is or does. The file name will show up by default in the process list if using [pm2](https://github.com/Unitech/pm2) or something similar.

#### Startup in Production
The goal is to set all configuration via environment variables as this will make your app more flexible in the long run to run on different platforms.  Right now this repo isn't using something like Foreman and instead processes everything via its ``config.js`` file for simplicity.

It's important here that the PORT below match the site you want to proxy in the nginx conf files above as well as the DOMAIN. This also assumes you are running this command from the home directory of the user. You can serve https on your express app via port 3000 for example while Nginx sits in front of that listening on 443 to proxy into port 3000.

    cd ~
    CERT=[FullPathToPEM] KEY=[TheFullPathToKey] DOMAIN=[SiteFQDN] PORT=[ValueUsedInNginxConf] node [FullPathToNodeApp]

Example using what exists in this repository...

    CERT=/home/webuser/certs/sslcert.pem KEY=/home/webuser/certs/sslcert.key DOMAIN=scholarships.foster.washington.edu PORT=3001 node uwshib-express-spa/bin/scholarshipsWWW

#### Startup in Production using PM2
    npm install -g pm2
    pm2 list
    pm2 logs
```
