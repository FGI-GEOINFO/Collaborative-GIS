# FGI Web Collaborative GIS (CGIS) for CITYAM

![Collaborative GIS user interface](https://github.com/FGI-GEOINFO/Collaborative-GIS/blob/main/cgis.png)

FGI Web Collaborative GIS (CGIS) is a web map platform intended for collaborative planning in groupwork. The development case for the CGIS was planning drone landing sites according to purposes of the CITYAM project.

CGIS is a Spatial Decision Support System (SDSS) in which participants of collaborative planning tasks can work together in shared map workspaces, on their personal or/and shared devices. The key features of CGIS are:

* map user interface (e.g., offering a shared perspective to the planning situation)

* workspace manager (e.g., managing different projects)

* data manager (e.g., importing data or connecting to external APIs)

* layer manager (e.g., overlaying data)

* map drawing tools (e.g., sketching planning ideas)

* analysis tool (e.g., running on-the-fly analysis on imported data).

The CGIS platform can be used by multiple people working together, for example, to discuss, plan, and decide the locations of drone-in-a-box sites, where drones launch and land as well as are recharged and stored.

## Dependencies

CGIS is primarily built upon the following repositories:

 * Layman: https://github.com/LayerManager

 * HSLayers and HSLayers Server: https://github.com/hslayers/hslayers-ng

**Previous collaborative GIS**

The FGI Web Collaborative GIS is based on the research and development of Baltic Explorer (http://balticexplorer.eu; https://github.com/FGI-GEOINFO/Baltic-Explorer) in the BONUS BASMATI project (https://bonusbasmati.eu/).

## Installation

To install CGIS on a server please follow the [installation guide](https://github.com/FGI-GEOINFO/Collaborative-GIS/blob/main/installation.md).

At least basic knowlesge of server management, NVM, Angular, and Docker are required. Do note the minimum of 8 GiB RAM requirement.

## Acknowledgements

CGIS was created in the CITYAM project (https://interreg-baltic.eu/project/cityam/) that contributes to building a green and resilient region with the support of EU funds from the Interreg Baltic Sea Region, 2021-2027 (https://interreg-baltic.eu/). 

![Interreg Baltic Sea Region 2021-2027 is a source of EU funding.](https://github.com/FGI-GEOINFO/Collaborative-GIS/blob/main/CITYAM_Logo_Standard-small.png)

We used computing services by CSC – IT Center for Science through the Open Geospatial Information Infrastructure for Research (Geoportti, urn:nbn:fi:research-infras-2016072513) funded by the Research Council of Finland.

## Publications

Honkavaara, E., Kettunen, P., Rönneberg, M., Jussila, A., Niemi, L., Hadaway, J., Farstad, M., Atiullah, S., and Mladenović, M. N., 2025. Consolidated geospatial tool for landing site planning and prioritisation. CITYAM Project. https://interreg-baltic.eu/wp-content/uploads/2025/01/CITYAM-O2.1-Consolidated-geospatial-tool-for-landing-site-planning-and-prioritisation.pdf

Kettunen, P., Rönneberg M., Jussila A., Farstad M., Niemi, L., Saif, A., Mladenovic, M. N., and Honkavaara E., 2025. Collaborative GIS for Urban Drone Landing Sites. Proceedings of the 19th International Conference on Location Based Services, 7-9 May 2025. Showcase abstract. https://doi.org/10.5281/zenodo.15350321

Mladenović, M. N., Saif, M. A., Honkavaara, E., Kettunen, P., Rönneberg, M., Jussila, A., Niemi, L., and Farstad, M., 2025. A Collaborative GIS for Planning of Urban Drone Launch and Landing Site Locations, Int. Arch. Photogramm. Remote Sens. Spatial Inf. Sci., XLVIII-2/W11-2025, 227–233, https://doi.org/10.5194/isprs-archives-XLVIII-2-W11-2025-227-2025.

Rönneberg, M., Jussila, A., and Kettunen, P., 2024. Eliciting user needs of a collaborative GIS for planning urban drone landing sites. Abstracts of the ICA, 8, 20. https://ica-abs.copernicus.org/articles/8/20/2024/ica-abs-8-20-2024.pdf


## Authorship

Anssi Jussila<sup>1</sup>, John Hadaway<sup>2</sup>, Leo Niemi<sup>3</sup>, Mikko Rönneberg<sup>4</sup>, Pyry Kettunen<sup>5</sup>, Atiullah Saif<sup>6</sup>, Milos Mladenović<sup>7</sup>, Eija Honkavaara<sup>8</sup>

<sup>1,2,3,4,5,8</sup> Finnish Geospatial Research Institute in the National Land Survey of Finland

<sup>6,7</sup> Aalto University

The authors contributed to the development as follows:

<sup>1,2,3,4</sup> Coding development

<sup>1,4,5</sup> Requirement elicitation, Design, Demonstration

<sup>1,4,5,6,7</sup> User testing and Evaluation

<sup>4,5</sup> Development team management

<sup>5,7,8</sup> Project management and supervision of development
