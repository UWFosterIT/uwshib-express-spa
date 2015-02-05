## UW Shibboleth NodeJS Express with Nginx proxy
This repo contains a working example of a NodeJS web application using Express that can act as a Shibboleth Service Provider to authorize users via the UW Web Login and a UW Identity Provider.  It also includes an nginx conf that can eaisly be duplicated to permit multiple domains running on the same server.

### DEVELOPMENT SETUP AND START

#### Express
The settings in ``config.js`` should work as is in development, edit it as needed.

    git clone git@github.com:UWFosterIT/uwshib-express-spa.git
    cd uwshib-express-spa
    npm install
    vim config.js

#### UW Shibboleth
The file ``helpers\shibboleth`` implements the [``passport-uwshib``](https://github.com/drstearns/passport-uwshib) node module created by David Stearns. This implementation of it exports a method that your routes can use to require authentication via UW's Shibboleth Identity Provider.  It also exports a user context that is a dummy user while in development.

#### Startup
You should change the name of ``bin/mysiteWWW``.  It's a good idea to name the file something like ``scholarshipsWWW`` for example so it represents what your app is or does. The file name will show up by default in the process list if using [pm2](https://github.com/Unitech/pm2) or something similar.

    node bin/mysiteWWW

Now browse to [http://localhost:3000](http://localhost:3000). You are all set.  Tweak things as needed, add more routes etc.

### PRODUCTION SETUP AND START
What works for us are the instructions below.  This is running on Ubuntu Server 14.0 with Nginx as a proxy.  The proxy enables us to let Nginx do all the SSL work in conjunction with a wildcard cert ``*.foster.washington.edu``. Each site has it's own Nginx configuration file and instance of this repo.

If you want express to do the SSL work without a proxy you can eaisly in ``bin/mySiteWWW`` use ``https.createServer({key: config.key, cert: config.cert}, app);`` instead of ``http.createServer(app);``, but just remember that you will only be able to serve a single site without some hackery express server wrapper code.

**Sample Prereqruisite Checklist**
- [ ] Setup a server, the jsteps below use Ubuntu Server 14.04
- [ ] Have a DNS entry made for each site that you want to serve
- [ ] [Get a certificate for your server](https://wiki.cac.washington.edu/display/infra/UW+Certificate+Services)
- [ ] [Have access to register your Shibboleth SP](https://wiki.cac.washington.edu/display/infra/UW+Certificate+Services)
- [ ] Have a proxy setup on your server like the steps provided below.

#### NVN and Node
The following assumes you created a new user and are logged in as it.  Ideally we don't want to run our apps as the root account and the following steps provide that for us.  **NOTE:** You will need to manually edit your bash.rc whenever you install a newer version of node via nvm.

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

#### Express NodeJS Server
You can use your CI server or some other deployment method to deploy your app.  The steps below help you with the initial install and run.  Once deployed you no longer need the ``sitesname.conf`` file locally in your repo.

    cd ~/
    git clone git@github.com:UWFosterIT/uwshib-express-spa.git
    cd uwshib-express-spa
    npm install
    cp sitename.conf /etc/nginx/conf.d/sitename.conf
    sudo service nginx restart

Edit your ``sitename.conf`` file to have it's contents match your server name, certificate and key paths.  Also make sure the proxy port is available and that you use the same one in the following steps when starting your node app. It might be good practice to have the fqdn in the filename

The goal is to set all configuration via environment variables as this will make your app more flexible in the long run to run on different platforms.  Right now this repo isn't using something like Foreman and instead processes everything via its ``config.js`` file for simplicity.


##### Start your Express app
It's important here that the ``PORT`` below match the site you want to proxy in the nginx conf files above as well as the ``DOMAIN``. Also, the ``DOMAIN`` is your Shibboleth entitity ID and must match the FQDN.

    cd ~
    CERT=[FullPathToPEM] KEY=[TheFullPathToKey] DOMAIN=[SiteFQDN] PORT=[ValueUsedInNginxConf] node [FullPathToNodeApp]

Example using what exists in this repository...(secure your key as you see fit).

    CERT=/home/webuser/certs/sslcert.pem KEY=/home/webuser/certs/sslcert.key DOMAIN=scholarships.foster.washington.edu PORT=3000 node uwshib-express-spa/bin/scholarshipsWWW

#### Testing Shibboleth in production
At a minimum your meta data at https://yoursite.yourdept.washington.edu/Shibboleth.sso/Metadata should load without problems.  If that page doesn't load then you have configured something incorrectly.  Once it does load, you should be able to auto register at https://iam-tools.u.washington.edu/spreg.

If upon registering your site there with the *Get metadata from the SP* checked on their form and that registration says you need to do it manually then you may have some sort of mismatch between your nginx conf and or express env vars.
