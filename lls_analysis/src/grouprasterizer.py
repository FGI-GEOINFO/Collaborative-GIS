import geopandas as gpd
import rasterio
from rasterio.features import rasterize
from rasterio.transform import from_origin
import os

class GroupRasterizer:
    def __init__(self):
        pass

    def save_layer(self, layer, save_path):
        """
        save the layer to a shapefile

        layer: a dictionary containing the following keys:
            - 'gdf': a GeoDataFrame
            - 'layman_friendly_layer_name': a string
        save_path: a string representing the path to save the shapefile
        """
        layer['gdf'].to_file(save_path)
        return save_path

    def rasterize_layer(self, gdf, out_raster_path, study_area, resolution):
        """
        rasterise the layer to a GeoTIFF

        gdf: a GeoDataFrame
        out_raster_path: a string representing the path to save the GeoTIFF
        study_area: a Shapely geometry representing the study area
        resolution: a float representing the resolution of the raster
        """
        minx, miny, maxx, maxy = study_area.bounds
        width = int((maxx - minx) / resolution)
        height = int((maxy - miny) / resolution)

        transform = from_origin(minx, maxy, resolution, resolution)
        out_shape = (height, width)

        raster = rasterize(
            [(geom, 1) for geom in gdf.geometry],
            out_shape=out_shape,
            transform=transform,
            fill=0,
            dtype='float32',
            all_touched=True 
        )

        with rasterio.open(
                out_raster_path, 'w', driver='GTiff', height=height, width=width,
                count=1, dtype=raster.dtype, crs=gdf.crs, transform=transform,
                metadata={'description': 'generated raster from vector data', 'units': 'meters'}
        ) as dst:
            dst.write(raster, 1)

    def save_and_rasterize_layers(self, layers, shp_dir, rasters_dir, study_area, resolution):
        """
        save the layers to shapefiles and rasterise them to GeoTIFFs

        layers: list of dictionaries, each containing the
            - 'gdf': a GeoDataFrame
            - 'layman_friendly_layer_name': a string
        shp_dir: a string representing the directory to save the shapefiles
        rasters_dir: a string representing the directory to save the GeoTIFFs
        study_area: a Shapely geometry representing the study area
        resolution: a float representing the resolution of the raster
        """
        for layer in layers:
            layer_filename = f"{layer['layman_friendly_layer_name']}.shp"
            layer_path = os.path.join(shp_dir, layer_filename)
            self.save_layer(layer, layer_path)
            
            out_raster_filename = f"{layer['layman_friendly_layer_name']}.tif"
            out_raster_path = os.path.join(rasters_dir, out_raster_filename)
            
            gdf = gpd.read_file(layer_path)
            self.rasterize_layer(gdf, out_raster_path, study_area, resolution)
            layer['path_to_raster'] = out_raster_path
        
        return layers
