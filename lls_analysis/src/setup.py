import os
import json
import geopandas as gpd
import matplotlib.pyplot as plt
from shapely.geometry import box
from shapely.ops import unary_union
from owslib.wfs import WebFeatureService
from requests import Request

class Setup:
    def __init__(self):
        """
        initialise the Setup class with the target EPSG code and the URL of the WFS service
        
        TARGET_EPSG: the EPSG code to which the WFS data should be transformed
        SERVER_URL: the URL of the WFS service
        wfs: the connection object to the WFS service
        """
        self.TARGET_EPSG = 3857
        self.SERVER_URL = "https://<DomainName>/layman/geoserver/" # Replace <DomainName> with actual domain
        self.wfs = None 

    def connect_to_wfs(self,server_url):
        """
        connect to the WFS service and return the connection object
        if the connection object already exists, return it
        """
        if self.wfs is None:
            # self.wfs = WebFeatureService(url=self.SERVER_URL)
            self.wfs = WebFeatureService(url=server_url)
            print("connected to WFS service")
        return self.wfs

    def fetch_wfs_data(self, workspace, layer_name):
        """
        fetch WFS data for a given layer name and workspace

        workspace: the workspace of the layer
        layer_name: the name of the layer
        """
        try:
            print(f"fetching WFS data for layer {layer_name}...")
            FULL_SERVER_URL = self.SERVER_URL + workspace + "/wfs"
            wfs = self.connect_to_wfs(FULL_SERVER_URL)
            
            full_layer_name = f"{workspace}:{layer_name}"
            if full_layer_name not in wfs.contents:
                raise ValueError(f"layer {full_layer_name} not found in WFS service")

            params = {
                'service': 'WFS',
                'version': '1.0.0',
                'request': 'GetFeature',
                'typeName': full_layer_name,
                'outputFormat': 'application/json'
            }

            # wfs_request_url = Request('GET', self.SERVER_URL, params=params).prepare().url
            wfs_request_url = Request('GET', FULL_SERVER_URL, params=params).prepare().url
            gdf = gpd.read_file(wfs_request_url)

            if gdf.crs.to_epsg() != self.TARGET_EPSG:
                print(f"transforming CRS from EPSG:{gdf.crs.to_epsg()} to EPSG:{self.TARGET_EPSG}")
                gdf = gdf.to_crs(epsg=self.TARGET_EPSG)

            print(f"checking for invalid geometries for {layer_name}...")
            return self.validate_and_fix_geometry(gdf)
        except Exception as e:
            print(f"error fetching WFS data for layer {layer_name}: {e}")
            raise

    def read_layers(self, layers, workspace):
        """
        read the layers from the config object and fetch the WFS data for each layer

        layers: the list of layers to read
        workspace: the workspace of the layers
        """
        # self.connect_to_wfs()
        read_layers = []
        for layer in layers:
            try:
                # gdf = self.fetch_wfs_data(workspace, layer["layman_friendly_layer_name"])
                FULL_SERVER_URL = self.SERVER_URL + layer["workspace"] + "/wfs"
                self.connect_to_wfs(FULL_SERVER_URL)
                gdf = self.fetch_wfs_data(layer["workspace"], layer["layman_friendly_layer_name"])
                print(f"fetched WFS data for layer {layer['layman_friendly_layer_name']}, EPSG:{self.TARGET_EPSG}")
                read_layers.append({
                    "gdf": gdf[["geometry"]],
                    "weight": layer.get("weight", None),
                    "layman_friendly_layer_name": layer["layman_friendly_layer_name"],
                    "title": layer["title"]
                })
                self.wfs = None
            except Exception as e:
                print(f"Error fetching WFS data for layer {layer['layman_friendly_layer_name']}: {e}")
        return read_layers
    
    def validate_and_fix_geometry(self, gdf):
        """
        validate and fix the geometry of the GeoDataFrame

        gdf: the GeoDataFrame to validate and fix
        """
        invalid_geometries = gdf[~gdf.is_valid]
        if not invalid_geometries.empty:
            print(f"Found {len(invalid_geometries)} invalid geometries. Attempting to fix...")
            gdf['geometry'] = gdf['geometry'].buffer(0)

        still_invalid_geometries = gdf[~gdf.is_valid]
        if not still_invalid_geometries.empty:
            print(f"Warning: {len(still_invalid_geometries)} geometries are still invalid after attempting to fix.")
        
        return gdf

    # maybe unecessary?
    def create_grid(self, study_area, cell_size, crs):
        """
        create a grid of polygons for the study area

        study_area: the study area as a shapely geometry
        cell_size: the size of the grid cells
        crs: the CRS of the study area
        """
        xmin, ymin, xmax, ymax = study_area.bounds
        width = xmax - xmin
        height = ymax - ymin
        rows = int(height // cell_size) + 1
        cols = int(width // cell_size) + 1

        polygons = []
        for i in range(cols):
            for j in range(rows):
                x1 = xmin + i * cell_size
                x2 = xmin + (i + 1) * cell_size
                y1 = ymax - (j + 1) * cell_size
                y2 = ymax - j * cell_size
                polygons.append(box(x1, y1, x2, y2))

        grid = gpd.GeoDataFrame({'geometry': polygons}, crs=crs)
        return unary_union(grid.geometry)

    def process_study_area(self, study_area, study_area_epsg, cell_size=10):
        """
        process the study area and create a grid of polygons

        study_area: the study area as a list of coordinates [xmin, ymin, xmax, ymax]
        study_area_epsg: the EPSG code of the study area
        cell_size: the size of the grid cells
        """
        study_area_box = box(study_area[0], study_area[1], study_area[2], study_area[3])
        study_area_gdf = gpd.GeoDataFrame({'geometry': [study_area_box]}, crs=f"EPSG:{study_area_epsg}")
        
        if study_area_gdf.crs.to_epsg() != self.TARGET_EPSG:
            study_area_gdf = study_area_gdf.to_crs(epsg=self.TARGET_EPSG)
        
        # Skip unneccessary study area adjustment
        # return study_area_gdf.geometry[0]
        return self.create_grid(study_area_gdf.unary_union, cell_size, study_area_gdf.crs)

    def setup(self, config):
        """
        setup the analysis by reading the layers, study area, and resolution from the config object

        config: the config object
        """
        workspace = config["workspace"]
        analyzable_layers = self.read_layers(config["analyzable_layers"], workspace)
        restricted_layers = self.read_layers(config["restricted_layers"], workspace)

        study_area = self.process_study_area(config["study_area"], config["study_area_epsg"])
        resolution = config["resolution"]

        return analyzable_layers, restricted_layers, study_area, resolution
