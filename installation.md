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

## Basic packages in Ubuntu

## NVM and node

## Angular

## Docker

## Certbot (HTTPS)

## Layman (LayerManager)

## HSLayers-server

## HSLayers-NG web application

## Drone landing site analysis tool

## Creating user accounts
