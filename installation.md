# Installation guide
## Notification
HSLayers and Layman have updated after the installation of CGIS. It is highly recommended to use newest version of both applications for security reasons. Especially geoserver should be updated since this version has couple critical vulnerabilities. CGIS deals with it by having geoserver private and not available for public. HSLayers had changes that affected coding syntax. In short, the existing CGIS HSLayers codes most likely won’t work in newer versions. The scripts have to be modified.

## Server information
CGIS was installed inside a virtual server provided by cPouta service by CSC. For the operating system, we opted for Ubuntu 22.04. In new projects one should use latest version. CSC offers pre-defined virtual machines with varying resource allocations. These predefined virtual machines are referred to as flavors. The more resources the virtual machines use, the more billing units they consume. It is recommended to have a flavor that has more than 8 GiB RAM. Otherwise, there will be memory issues, which can crash the applications. 

The virtual environments in cPouta have permanent DNS names that can be used as domains for website names. This can be used in development phase to test the application. For production, it is recommended to obtain a proper domain name and ssl certificate.

| Flavor  | CPU cores | Memory (GiB) | Root disk (GB) | Ephemeral disk (GB) | Total disk (GB) | Memory/core (GiB) | Billing Units /h |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| standard.xxlarge  | 8 | 31.2 | 80 | 0 | 80 | 3.8 | 8 |

Table 1: CITYAM CGIS resource allocation

## CGIS server components
CGIS is a system that is structured of different types of applications running inside docker containers. The applications can be divided into four major parts, which are HSLayers, HSLayers-server, layer manager (Layman) and drone landing site analysis plugin.

HSLayers is used as the frontend application to create a web map GUI. HSLayers is an open-source application that is built on top of OpenLayers and Angular. It is used to build a map viewer with extra components to control layers.

Layman is used as the backend to publish and store geospatial data through a REST API. Major components of layman are Nginx, Geoserver, Postgresql, Wagtail, Redis, Micka and layman client. Nginx is a web server used to serve content to the web. Geoserver acts as a persistent data store, is used to control data and for APIs. Postgresql is a persistent datastore that includes eg. geospatial vector data, metadata records, information about users, workspaces, access rights, etc. Wagtail is built on top of Django and used to verify authentication and used for user management. Redis is used as in-memory storage. Micka is used to store metadata of geospatial layers. Layman client is the authentication component which communicates with wagtail.

HSLayer-server is a component of HSLayers, which is used to communicate between HSLayers and Layman. It also makes it possible to do proxy requests to other services, which open the possibility to make WMS, WFS, etc request to other services.
The drone landing site analysis plugin is a weighted multi-criteria analysis tool that identifies potential landing sites within the area of interest. The tool takes input data with different weights, which affect the calculations. The end result is a raster dataset with 10m spatial resolution. In CGIS the analysis tool is activated through HSLayers graphical interface and results are stored into layman.

## Basic packages in Ubuntu
The server was updated to make sure that the existing software were up to date. Reboot of the server might be needed. After the update, basic packages were installed to the server.
```bash
sudo apt update && sudo apt upgrade
sudo reboot
sudo apt install ca-certificates curl gnupg build-essential git snapd
```

## NVM and node
NVM is a node version manager, which can install and change different versions of node. Node is open-source JavaScript environment which makes it possible to create different applications, scripts, tools, etc.

Note! This guide installs the applications to the current user’s home directory, which is why the commands will not work with other users. This can be avoided by setting the path of node for selected user (6.1). Alternatively, install NVM and node globally.

Download NVM installation script and install it using bash. Replace <version_number> with actual version of NVM.
    
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/<version_number>/install.sh | bash
```

Current version of NVM in CGIS: 
v0.39.7

This addition is optional if the curl added nvm configuration to profile. If not, then search for profile file and add the line below
```bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

Check that NVM has been installed correctly to the system. Remember to reload OS terminal. Otherwise the version check might not register NVM. 
```bash
nvm -v
```

Install the latest stable version of node that HSLayers works with. Check that node and npm were installed correctly.
```bash
nvm install <version number>
node --version
npm --version
```

Current version of node in CGIS
20.14.0

#### (Optional) Modify the path of node for other users
This phase can be skipped, if the server has only a single user. If there are multiple users, which need access to NPM, node and Angular, then continue with this guide.

When installing NPM, node and Angular, the problem is that the applications can only be activate by the user who installed the software. This is because the applications were installed into the user’s home directory. To make the commands available for other user’s one has to be modify .bashrc file inside the users home directories and add the path of NPM to the file.

Open .bashrc file with text editor
```bash
cd /home/username
nano .bashrc
```

Add text below at the end of the file. Replace <version_number> to installed version of node (eg. v20.14.0). This sets the path of node for the selected user.
```bash
export PATH=$PATH:/home/ubuntu/.nvm/versions/node/<version_number>/bin
```

Reload current shell environment
```bash
source ~/.bashrc
```
 
Verify that the path was updates
```bash   
echo $PATH
```

## Angular
Angular is a open-source typescript-based web application framework to build applications. In CGIS Angular is used to built HSLayers graphical interface. Angular can be installed locally or globally. With global installation the user can use Angular CLI commands from anywhere. The benefit is that every user has the same client version. In local installations the commands work only from project folder. The local installations could be used for example to have different versions angular for development and production.

Install LTS version of Angular globally. Replace <version_number>.
```bash
npm install -g @angular/cli@<version_number>
```

Check that angular was installed
```bash
ng version
```

Currently used CGIS angular version:
17.0.0

## Docker
Docker Engine is an open-source service that can build and containerize applications. Docker Engine consists of a long running server daemon process called dockerd, APIs which specify interfaces that programs can use to talk and instruct the Docker daemon and lastly a command line interface client named docker. 

Docker Engine was chosen because of its modularity and isolated environments. The isolated environments inside the containers made it possible to test the application without breaking the Ubuntu environment itself. If the application breaks, it is contained inside the containers. The containers can also be easily rebuilt. The downside is that the development and debugging is more complex especially for people new to docker.

Docker is used in this case to build, run and control docker containers that include software inside them. For more streamlined development and ease of use docker compose with YAML configuration files were used to control and build the components of the CGIS application. Dockerfiles are also needed for the building of the containers. Dockerfiles contain the instructions on how to build the containers.

In this case docker repository was used to install Docker Engine. The official Docker repository has the latest version of Docker. In addition, Docker group has to exist inside Ubuntu and the current user has to be member of the group for Docker commands to work.

Add docker repository
Creates a new directory with permission if it doesn’t exist
```bash
sudo install -m 0755 -d /etc/apt/keyrings
```

Download Docker DPG key from specified URL and save it to created directory
```bash
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
```

Make the file readable to all users
```bash
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

Add the official repository to Apt sources
```bash
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```
```bash
sudo apt-get update
```

Install docker components
```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
 
Check group information
```
getent group docker
```

(Optional) Create docker group. Can be skipped if the group already exists.
```bash
sudo groupadd docker
```

Add current user to the docker group
```bash
sudo usermod -aG docker $USER
```

Activate changes to group
```bash
newgrp docker
```

Test that Docker works
```bash
docker ps -a
```

## Certbot (HTTPS)
Certbot is a free, open source software tool for automatically using Let’s Encrypt certificates on websites to enable HTTPS. HTTPS certificate is needed for more secure website. For the certificate to work one needs a website already running on HTTP. Certbot ceritificates renews automatically every 60 days. HTTPS (443) and HTTP (80) ports have to be open when creating or renewing the certificate.

(optional) Install snapd if it isnt installed already
```bash
sudo apt install snapd
```

Install cerbort using snapd
```bash
sudo snap install --classic certbot
```

Create certificate
Note! Webroot path has to point to a folder where the web application resides. Otherwise, the command will produce an error.
```bash
sudo certbot certonly --webroot --webroot-path </path/to/web/application> -d <mydomain.com>
```

Test automatic renewal of certificate with a test run
```bash
sudo certbot renew --dry-run
```

Command to manually update the certificate if needed
```bash
sudo certbot renew
```

The created certificate folder has to be connected to the web application via a web server. In CGIS case the web server is Nginx, which is located inside a docker container. The certificate folder was copied inside the docker container using docker volume bind. The volume bind was done inside a YAML configuration file. The certificate folder’s path inside the docker container has to be added to the Nginx configuration file for the Nginx to know the location of the certificate. Port 443 has to be open and added to the Nginx configuration file for HTTPS to work properly.

In CGIS the certificate had to be updated manually since we keep the HTTP port normally closed for security reasons. To update certificate in CGIS one needs to be open HTTP (80) port, comment HTTP block and uncomment listen 80 lines in HTTPS block in Nginx configuration file.

Note!
It is recommended to find a better way to update the certificate. Currently it needs quite a lot of manual work. Nginx configuration should be changed so that it would always work when updating the certificate. There is also the problem that Docker doesn’t recognize when the certificate has been updates. It seems that the updated certificate isn’t copied inside the Nginx docker container for some reason. The Nginx docker container has to be restarted for the update to take effect. The problem might be related to folder permissions.

## Layman (LayerManager)
Layman is a publishing server for geospatial data via a REST API. The server creates OGC WMS and WFS APIs from the published data. The server accepts vector and raster data and also layer styling formats. There is also an authentication service, which makes it possible to create users and handle data permissions. Layman server is built on top of many different components like Docker, Python, Flask, PostgreSQL, PostGIS, GDAL, QGIS Server, GeoServer, OpenLayers, Celery, Redis, etc. In table 2 can be seen all layman related components that are running inside docker containers in CGIS server.


| Application name  | Version |
| ------------- | ------------- |
| Layman | - |
| Layman client | - |
| Nginx | 1.16 |
| Postgresql | 13.3 |
| Postgis | 3.1 |
| Geoserver | 2.21.2 |
| Micka | v2020.014 |
| QGIS-server | 3.16.1 |
| Wagtail | 4.2.* |
| Timgen | 1.0.0 |
| Celery worker | - |
| Redis | 4.0.11-alpine |
| Flower | - |

Table 2: Major components of layman and their version number in CGIS. Applications that have line as version number means that no information about version number was found. Layman version is 1.23.0.

Link to the layman github repository. It is also recommended to repository’s information and guide related to Layman.
https://github.com/LayerManager/layman

Clone Layman git repository from source
```bash
git clone https://github.com/LayerManager/layman.git
```

Remember to modify owners and permissions of the folders so that the current user can modify and run the system.
```bash
sudo chown -R <user>:<user> layman/
sudo chmod 775 -R foldername/filename
```

Checkout the 1.23.0 release in current git branch
```bash
git checkout $(git describe --abbrev=0 --tags)
-> v 1.23.0
```

Before Layman can be built the service has to be configured. There are multiple files that have to be modified for the system to work. The filepaths for files that were modified in this project can be seen in XXXX.


| Layman file | Description |
| ------------- | ------------- |
| /layman/makefile | Commands for docker-compose |
| /layman/.env | Layman configuration file |
| /layman/src/layman_settings.py | Settings for layman |
| /layman/deps/wagtail/laymanportal/laymanportal/settings/dev.py | Security, HTTPS |
| /layman/deps/nginx/sample/nginx-template | Web application config file |

Table 3: Layman files that were modified in CGIS

In this project, makefile was utilized to make building of docker containers easier. Makefile is a configuration file that can be used with make command. In this case, docker compose commands were configured into a makefile and then run using the make command. With this it is possible to build the CGIS platform using single short command line argument. For example, sudo make start-prototype

Layman also has an environment file with parameters, which are used to build and run the docker containers. The .env.dev was used as a base and then filled with values that correspond to the CGIS server. See .env file in github repostiory for CGIS platform environment file.

The dev.py is a Python file, which is used by wagtail administrator system. The file contains security related parameters. It will also control what sites Django can serve. In addition, the file was modified so that requests with POST work. See file in github repository for CGIS settings. In Django administration page redirect uris were added for callback URLs. In addition, access tokens for analysis users were added with years long expiration dates. These tokens were needed to verify the logged user during the analysis. If the user cannot be verified, the analysis results cannot be transferred to geoserver.

Note! The tokens should be removed from the analysis script and do the authentication from the script in a proper way. Check layman github repository for more information.

NGINX web server configuration file is for redirecting web traffic and security settings. HTTPS certificate folder’s path inside the docker container was added to the configuration file, which makes using https addresses possible. Most components of backend and frontend were added as location blocks. This makes it possible to access the applications using a URL. (Example: REST API, map interface, etc). There are also security related settings that were needed for embedded login and authentication to work.

Note! If using this guides version of Geoserver, it should not be available publicly. In this version there are two security vulnerabilities. It is highly recommended to get a newer version of the Geoserver.

## HSLayers-server
HSLayers-server is a server component for the HSLayers map application. The server consists of three services, which are proxy, share and layman authentication service. Proxy is used to access services on other domains and work with CORS headers. Share is used to store and share maps via permalinks. Layman authentication client is needed to authenticate to layman from the map application.

The HSLayers-server was installed and ran inside a docker container. The installation and execution of the application was done utilizing a dockerfile. In addition, for the application to run properly an environment file is needed. The file is created inside Ubuntu environment and then moved inside the docker container using volume bind. A YAML file is modified to include and control the HSLayers-server. Necessary ports and volume bind are added to the file.

CGIS HSLayers-server version:
2.0.0

## HSLayers-NG web application
HSLayers-NG is an angular library which extents OpenLayers functionality to build a map GUI with extra components such as layer manager, permalink generation, vector layer styling, API layers, etc. The library is installed into angular and then a working directory is created to develop and build the CGIS web application.

Depending on the use case, in Angular there are couple ways to develop applications. One of these ways, is to create an Angular working directory for single application. Alternatively, it is possible to create a working directory that contains multiple applications.

Create workspace for single application
```bash
ng new cgis
```

Create a workspace and then generate project folders for multiple applications
```bash
ng new cgis --create-application false
cd cgis
ng generate application development
ng generate application production
```

Run Angular application in development environment
```bash
ng serve production –host 0.0.0.0
```

Build Angular application after development
```bash
ng build production
```

Building Angular application creates a new application folder. Building application also generates a cache that stores information related to the build, which makes following builds faster. Generation of cache can be toggled on or off. The built application folder was copied inside Nginx docker container, so that the web server could find and access the application. The copying was done utilizing docker volume bind.

Note! Every time build is done it generates a cache in the working directory. The caches are not automatically removed at least in this project. When developing check how much disk space the caches take periodically. Remember to remove old caches when they take too much disk space.

Install newest HsLayers package
```bash
npm i hslayers-ng
```

Install HSLayers 13.2.1 package
```bash
npm i hslayers-ng@13.2.1
```

Install peer dependencies for HsLayers 13.2.1 if not installed automatically by npm (optional) (check that package numbers are correct and not old ones)
```bash
npm i bootstrap@^5.3 ol@^8.2 @angular/cdk@^17 @angular/common@^17 @angular/core@^17 @angular/forms@^17 @angular/compiler@^17 @angular/platform-browser@^17 @angular/platform-browser-dynamic@^17 @angular/localize@^17 @ngx-translate/core@^15 @ngx-translate/http-loader@^8 deepmerge@^4.0.0 dayjs@^1.0.0 @ng-bootstrap/ng-bootstrap@^16 ol-popup@^5.0.0 proj4@^2.8.1 share-api-polyfill@^1.0.0 rxjs@^7.0.0 zone.js@~0.14.0 xml-js@^1.6.11 ngx-cookie-service@^17 geostyler-style@^7.2.0 geostyler-sld-parser@^5 geostyler-openlayers-parser@^4 geostyler-legend@4 geostyler-qgis-parser@^2 ngx-color@^9 queue@^7 resumablejs@^1 d3@^7 jszip@^3 polygon-splitter@^0.0.11 polygon-clipping@^0.15.3 @popperjs/core@^2 ol-ext@^4
```

CGIS HSLayers version
13.2.1

## Drone landing site analysis tool
The drone landing site analysis tool is a plugin that was developed for CGIS. The tools is a multi-layer analysis to detect potential drone landing sites from selected datasets. The tool was designed to act as a guide for discussing and planning drone landing sites. The quality of the results is highly dependant on the amount and type of data used.

The analysis tool is activated through the frontend web application (HsLayers), which sends a signal to the backend analysis component to start the analysis process. The script check’s the user’s credentials to determine if the user has right permissions to run the analysis. The analysis reads and loads the data from the CGIS server and inserts the data into the multi-layer analysis. The analysis creates a raster from the input data and sends it to the geoserver.
The analysis tool was designed to run inside a docker container. The tool was cloned from a GitHub repository and containerized. A dockerfile was created for the containerization process. A YAML file was modified to activate and copy necessary files to the container.

Note! Getting necessary access tokens from the server should be improved in the future. Currently the tokens have to be added manually to the script, which is not ideal. Most likely HsLayer-server could be used to access the authentication service of layman.


## Creating user accounts
In CGIS two types of accounts can be created, which are normal and analysis users. Normal users can view, create workspaces and data but cannot use the analysis tool. Analysis user can do the same things as normal user and in addition use the analysis tool.

Note!
Each analysis user needs an access token for the analysis to work. Currently this can only be done by manually adding the access token to the analysis script. It is recommended to get the authentication to work properly in the analysis scripts.

Normal users:
New users are created from wagtail website. An user (eg. layman) who has administrative permissions should be used to create new users. To create a user, in wagtail go to settings, users and then use add user command. In account tab add necessary information like account name, email, password, etc. In roles tab, the new users are added to moderators and editors groups. These groups affect what the users can do in CGIS.

Analysis users:
Create the user in similar fashion as when creating a normal user. In django log in with an administrative account (eg. layman). Navigate to access tokens tab and add a new access token. In the token settings, find the created analysis user, create a custom token, set layman-test-client as application, set the expiration date of the token and in scope add read write text. The created token's custom token value has to be added to the analysis plugin. Navigate to the analysis folder and search for views.py script. In the script search for code lines that contain data["workspace"] and auth_token. The workspace values should be the name of the analysis account and auth_token value the custom token value that was added in django. Test the created analysis user to confirm that everything works as expected.
