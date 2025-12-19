# Installation guide
> [!IMPORTANT]
It is highly recommended to use newest versions of HSLayers and layman for security reasons. Especially geoserver should be updated since this version has couple critical vulnerabilities. CGIS deals with it by having geoserver private and not available for public. 
HSLayers has had atleast one major update. This makes it highly likely that CGIS scripts for HSLayers won't work in newer versions. 

## Server information
CGIS was installed inside a virtual server provided by cPouta service by CSC. For the operating system, we opted for Ubuntu 22.04. CSC offers pre-defined virtual machines with varying resource allocations. These predefined virtual machines are referred to as flavors. The more resources the virtual machines use, the more billing units they consume. It is recommended to have a computer that has more than 8 GiB RAM. Otherwise, there will be memory issues, which can crash the applications. 

| Flavor  | CPU cores | Memory (GiB) | Root disk (GB) | Ephemeral disk (GB) | Total disk (GB) | Memory/core (GiB) | Billing Units /h |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| standard.xxlarge  | 8 | 31.2 | 80 | 0 | 80 | 3.8 | 8 |

_Table 1: CITYAM CGIS resource allocation_

## CGIS server components
CGIS is a system that is structured of different types of applications running inside docker containers. The applications can be divided into four major parts, which are HSLayers, HSLayers-server, layer manager (Layman) and drone landing site analysis plugin.

HSLayers is used as the frontend application to create a web map GUI. HSLayers is an open-source application that is built on top of OpenLayers and Angular. It is used to build a map viewer with extra components to control layers.

Layman is used as the backend to publish and store geospatial data through a REST API. Major components of layman are Nginx, Geoserver, Postgresql, Wagtail, Redis, Micka and layman client. Nginx is a web server used to serve content to the web. Geoserver acts as a persistent data store, is used to control data and for APIs. Postgresql is a persistent datastore that includes eg. geospatial vector data, metadata records, information about users, workspaces, access rights, etc. Wagtail is built on top of Django and used to verify authentication and used for user management. Redis is used as in-memory storage. Micka is used to store metadata of geospatial layers. Layman client is the authentication component which communicates with wagtail.

HSLayers-server is a component of HSLayers, which provides three services called Proxy, Share and Layman Auth Client. Proxy service is used to do proxy requests to services on other domains to access eg. map layers. Share service is used to share maps via permalinks or to social media. Layman Auth Client service contains the authentication workflow for connecting to Layman server.

The drone landing site analysis plugin is a weighted multi-criteria analysis tool that identifies potential landing sites within the area of interest. The tool takes vector input data with different weights, which affect the calculations. The end result is a raster dataset with 10m spatial resolution. In CGIS the analysis tool is activated through HSLayers graphical interface and results are stored into layman as raster dataset.

This GitHub repository contains the folder structure of the CGIS server. The folders only contain files that were modified by the developers of CGIS.

## Basic packages in Ubuntu
The server was updated to make sure that the existing software were up to date. Reboot of the server might be needed. After the update, basic packages were installed to the server.
```bash
sudo apt update && sudo apt upgrade
sudo reboot
sudo apt install ca-certificates curl gnupg build-essential git snapd
```

## NVM and node
NVM is a node version manager, which can install and change different versions of node. Node is an open-source JavaScript environment, which makes it possible to create different applications, scripts, tools, etc.

This guide install the applications to the current user's home directory. Therefore, the commands will only work with the user that installed the software. Solution for this is to install the software for all users separately, modify the path of installed software for other users or install the software globally. This guide contains only modifying the path of node for other users.

Download NVM installation script and install it using bash. Replace <version_number> with actual version of NVM.
    
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/<version_number>/install.sh | bash
```

Current version of NVM in CGIS:\
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

Current version of node in CGIS:\
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
 
Verify that the path was updated
```bash   
echo $PATH
```

## Angular
Angular is an open-source typescript-based web application framework to build web applications. In CGIS, Angular is used to built HSLayers graphical interface. Angular can be installed locally or globally. With global installation the user can use Angular CLI commands from anywhere. The benefit is that every user has the same client version. In local installations the commands work only from project folder. The local installations could be used for example to have different versions angular for development and production. In our case, we installed Angular globally.

Install LTS version of Angular globally. Replace <version_number>.
```bash
npm install -g @angular/cli@<version_number>
```

Check that angular was installed
```bash
ng version
```

Current version of Angular in CGIS:\
17.0.0

## Docker
Docker Engine is an open-source service that can build and containerize applications. Docker Engine consists of a long running server daemon process called dockerd, APIs which specify interfaces that programs can use to talk and instruct the Docker daemon and lastly a command line interface client named docker. Docker Desktop should also be mentioned, which is a graphical interface and virtual environment that can be used to manage applications, containers and images from ones computer. It should also be mentioned, that Docker Desktop is licensed unlike Docker Engine. Docker Engine can be installed separately as long as ones system contains linux environment.

Docker Engine was chosen because of its modularity and isolated environments. The isolated environments inside the containers made it possible to test the application without breaking the Ubuntu environment itself. If the application breaks, it is contained inside the containers. The containers can also be easily rebuilt. The downside is that the development and debugging is more complex especially for users new to docker. It is also possible to build CGIS without the docker containers but it is out of scope of this guide.

CGIS consists of multiple different applications inside their own Docker containers that communicate with each others. To build Docker containers, Docker images are needed. Docker images contain building instruction for creating a Docker container. Docker Compose and YAML files were utilized to make running and controlling containers more easier and streamlined.

It is recommended to use official Docker repository since it contains the latest version of docker. This installation guide is for Ubuntu. Do check Docker's own documentation in case there has been changes in the installation guide.

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
Certbot is an open-source software tool for automatically obtaining certificates from Let's Encypt, which is an open certificate authority. The certificate is needed to enable HTTPS for websites to make it more secure. To create a certificate with certbot, an existing application has to be running on HTTP website. HTTPS (443) and HTTP (80) ports have to be open when creating or renewing the certificate. Certbot ceritificates renews automatically every 60 days. The certificate can also be updated manually if automatic system fails.

(optional) Install snapd if it isnt installed already
```bash
sudo apt install snapd
```

Install cerbort using snapd
```bash
sudo snap install --classic certbot
```

Create certificate
Create certificate. Webroot path has to point to the web application folder. Otherwise, the command will produce an error. In CGIS case it would be the built HsLayers application.
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

Certbot created a certificate folder, which has to be activated in the web server. In CGIS, the web server is Nginx, which is located inside a docker container. The certificate folder is mounted from the host to the container. Docker compose and YAML configuration file is utilized for the mounting process. The Nginx configuration file was modified to listen HTTPS port 443 and by adding the certificate folder's path.

In CGIS, updating the certificate has to be done manually. The HTTP port is temporarily made public and the Nginx configuration file is modified to work during the update process. In the GitHub repository the nginx-certficate-renew configuration file is the modified version. It is recommended to find a better way to update the certificate. Nginx configuration should be changed so that it would always work when updating the certificate. There is also the problem that Docker doesn’t recognize when the certificate has been updated. It seems that the updated certificate isn’t copied inside the Nginx docker container for some reason. The docker container has to be restarted for the update to take effect. The problem might be related to folder permissions.

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

_Table 2: Major components of layman and their version number in CGIS. Applications that have line as version number means that no information about version number was found. Layman version is 1.23.0._

Link to the layman github repository. It is also recommended to read the repository’s information and guide related to Layman.
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

Before Layman can be built the service has to be configured. There are multiple files that have to be modified for the system to work. The filepaths for files that were modified in this project can be seen in Table 3. The modified files are also available in the GitHub repository. The files have been cleaned from actual paths and replaced with placeholders.

| Layman file | Description |
| ------------- | ------------- |
| /layman/makefile | Commands for docker-compose |
| /layman/.env | Layman configuration file |
| /layman/deps/wagtail/laymanportal/laymanportal/settings/dev.py | Security, HTTPS |
| /layman/deps/nginx/sample/nginx-template | Web application config file |

_Table 3: Layman files that were modified in CGIS_

Makefile:\
Makefile was utilized to make building of docker containers easier and more streamlined. Docker compose commands were configured into a makefile and then run using make command. With this it is possible to build the CGIS platform using single short command line arguments.

Example:
```bash
sudo make start-prototype
```
Layman environment file:\
The environment file contains parameters that are used when building and running the docker containers. The .env.dev was used as a base and then filled with values that correspond to the CGIS server.

Wagtail laymanportal:\
The dev.py is a Python file, which is used by wagtail administrator system. The file contains security related parameters. It will also control what sites Django can serve. The file was modified so that requests with POST also work. In Django administration page redirect uris were added for callback URLs.

Nginx configuration file:\
The configuration file handles both web traffic redirection and security settings. It contains HTTPS sertificate path, which makes it possible to usage of HTTPS addresses possible. Most components of backend and frontend are added as location blocks, which makes it possible for the containers to communicate with each other and access certain parts using a URL (Example: REST API, map interface, etc). There are also security related settings that were needed for embedded login and authentication to work.

> [!WARNING]
In this version, the geoserver has secrity vulnerabilities, which is why it should not be available publicly. It is highly recommended to get a newer version of the Geoserver.

## HSLayers-server
HSLayers-server is a server component for the HSLayers map application. The server consists of three services, which are proxy, share and layman authentication service. Proxy is used to access services on other domains and work with CORS headers. Share is used to store and share maps via permalinks. Layman authentication client is needed to authenticate to layman from the map application.

Link to the HsLayers-server repository:
https://github.com/hslayers/hslayers-ng/tree/develop/projects/hslayers-server

In CGIS, HSLayers-server is run inside a docker container. A Dockerfile and an environment file are needed for the creation of the Docker image and container. Dockerfile contains the build instructions of the container and .env file the configuration of the application. HSLayers-server configuration parameters were added to a YAML configuration file (volume binds, ports, etc).

Current version of HSLayers-server in CGIS:\
2.0.0

## HSLayers-NG web application
HSLayers-NG is an open-source library built with Angular and OpenLayers, extending latter's functionality with a map GUI and extra components, such as layer manager, permanlink generation, vector ayer styling, API layers, etc.

Link to HSLayers repository and documentations
https://github.com/hslayers/hslayers-ng.

Current version of HSLayers in CGIS:\
13.2.1

Depending on the use case, in Angular there are couple ways to develop applications. One of the ways, is to create an Angular working directory for a single application. Alternatively, it is possible to create a working directory that contains multiple applications. In CGIS multiple applications approach was used.

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

The workspace is a folder location that is created using Angular ng new command. The root structure contains workspace related information like installed libraries, dependencies, project related configuration options, etc. Node_modules folder contains installed libraries needed for developing the web application. Angular.json is contains information to control and configure the project itself. In a single-application workspace, the files related to the app itself are stored in src folder. In multi-application workspace, the application files are organized inside the projects folder, where each application has its own directory.

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

HSLayers scripts for CGIS can be used as a template for testing and further development. The app folder contents can be categorized into four categories. At the root of the folder are the scripts related to main graphical user interface of CGIS. The app folder also contains folders for analysis, login and help panels. The analysis directory contains script for the graphical user interface of the analysis panel and components to connect to the analysis plugin. Login directory scripts create a login panel where the user can login to the system. The help directory creates a help panel which describes how to use CGIS.

Run Angular application in development environment
```bash
ng serve development –host 0.0.0.0
```

Build Angular application after development
```bash
ng build development
```

Building Angular application compiles the scripts into optimized and minified output into dist directory. In CGIS the built application is copied to the Nginx container so that the web server can find and access the application. The necessary parameters for copying are added in YAML configuration file. It should also be mentioned that every time build is done, it generates a cache in the working directory. The cache stores information related to the build, which makes following builds faster. Generation of cache can be toggled on or off. The caches were not automatically removed in this project. This means the more building is done, the more disk space the caches take. It is recommended to remove old caches when they take too much dish space.

## Drone landing site analysis tool
The drone landing site analysis tool is a plugin that was developed to work with CGIS. The tools is a multi-layer analysis to detect potential drone landing sites from selected datasets. The tool was designed to act as a guide for discussing and planning drone landing sites. The quality of the results is highly dependant on the amount, type and quality of data used.

The analysis tool is activated through the frontend web application (HsLayers), which sends a signal to the backend analysis component to start the analysis process. The script check’s the user’s credentials to determine if the user has right permissions to run the analysis. The analysis reads and loads the data from the CGIS server and inserts the data into the multi-layer analysis. The analysis creates a raster from the input data and sends it to the geoserver.

The plugin was developed using Python programming language. After the plugin had been developed, a Dockerfile was created for the containerization process. Parameters related to the plugin were added to an existing YAML configuration file. 

## Creating user accounts
In CGIS two types of accounts can be created, which are normal and analysis users. Normal users can view, create workspaces and data but cannot use the analysis tool. Analysis user can do the same things as normal user and in addition use the analysis tool.

Normal users:\
New users are created from wagtail website. An user (eg. layman) who has administrative permissions should be used to create new users. To create a user, in wagtail go to settings, users and then use add user command. In account tab add necessary information like account name, email, password, etc. In roles tab, the new users are added to moderators and editors groups. These groups affect what the users can do in CGIS.

Analysis users:\
Create the user in similar fashion as when creating a normal user. In django log in with an administrative account (eg. layman). Navigate to access tokens tab and add a new access token. In the token settings, find the created analysis user, create a custom token, set _layman-test-client_ as _application_, set the _expiration date_ of the token and in _scope_ add _read write_ text. The created token's custom token value has to be added to the analysis plugin. Navigate to the analysis folder and search for views.py script. In the script search for code lines that contain data["workspace"] and auth_token. The workspace values should be the name of the analysis account and auth_token value the custom token value that was added in django. Test the created analysis user to confirm that everything works as expected.

> [!NOTE]
Each analysis user needs an access token for the analysis to work. Currently this can only be done by manually adding the access token to the analysis script, which is not ideal. It is recommended to get the authentication to work properly in the analysis scripts. Most likely HsLayer-server could be used to access the authentication service of layman.
