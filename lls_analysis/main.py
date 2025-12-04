import os
import argparse
import json
import shutil
import tempfile
from src import printcolors as pc
from src.setup import Setup
from src.groupclipper import GroupClipper
from src.groupdifferencer import GroupDifferencer
from src.grouprasterizer import GroupRasterizer
from src.rastercalculator import RasterCalculator
import geopandas as gpd

setup = Setup()
clipper = GroupClipper()
differencer = GroupDifferencer()
rasterizer = GroupRasterizer()
calculator = RasterCalculator()

def main(config, debug):
    # Setup
    print("Setup - setting up the environment...\n")
    analyzable_layers, restricted_layers, study_area, resolution = setup.setup(config)

    if debug:
        tempdir = os.path.join(os.path.dirname(config['workspace']), 'data', 'debug')
        os.makedirs(tempdir, exist_ok=True)
        print(f"Debug mode: using fixed directory {tempdir}\n")  
    else:
        tempdir = tempfile.TemporaryDirectory()

    try:
        tempdir_path = tempdir if debug else tempdir.name

        downloaded_dir = os.path.join(tempdir_path, 'downloaded_layers')
        shp_dir = os.path.join(tempdir_path, 'shp')
        rasters_dir = os.path.join(tempdir_path, 'rasters')
        output_dir = os.path.join(os.path.dirname(config['workspace']), 'data', 'output')

        os.makedirs(downloaded_dir, exist_ok=True)
        os.makedirs(shp_dir, exist_ok=True)
        os.makedirs(rasters_dir, exist_ok=True)
        os.makedirs(output_dir, exist_ok=True)

        study_area_gdf = gpd.GeoDataFrame({'geometry': [study_area]}, crs="EPSG:3857")
        study_area_gdf.to_file(os.path.join(downloaded_dir, 'study_area.gpkg'))
        for layer in analyzable_layers + restricted_layers:
            gdf = layer['gdf']
            layer_filename = f"{layer['layman_friendly_layer_name']}.gpkg"
            layer_path = os.path.join(downloaded_dir, layer_filename)
            gdf.to_file(layer_path)

        # GroupClipper
        print("GroupClipper - clipping input and restricted layers...\n")
        analyzable_layers, restricted_layer = clipper.clip_layers(analyzable_layers, restricted_layers, study_area)

        # GroupDifferencer only if there is a composite restricted_layer
        if restricted_layer is not None:
            print("GroupDifferencer - clearing data from input layers using restricted layers...\n")
            analyzable_layers = differencer.difference_layers(analyzable_layers, restricted_layer)
        else:
            print("No restricted layers found, skipping difference operation.\n")

        # GroupRasterizer
        print("GroupRasterizer - saving and converting layers to raster...\n")
        analyzable_layers = rasterizer.save_and_rasterize_layers(analyzable_layers, shp_dir, rasters_dir, study_area, resolution)

        # RasterCalculator
        print("RasterCalculator - running analysis and outputting final geotiff...\n")
        final_output_path = os.path.join(output_dir, f'{config["layman_friendly_result_title"]}.tif')
        final_output_style_path = os.path.join(output_dir, f'{config["layman_friendly_result_title"]}.sld')
        calculator.calculate(analyzable_layers, rasters_dir, final_output_path, final_output_style_path)

        print("Process completed.\n")
        
    except Exception as e:
        print(f"Error: {e}\n")
        raise
    finally:
        if not debug:
            tempdir.cleanup()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GIS Tool for landing and launch site selection")
    parser.add_argument("config_file", help="Path to the JSON configuration file")
    parser.add_argument("--debug", action="store_true", help="Use a fixed directory for debugging purposes")

    args = parser.parse_args()

    with open(args.config_file, 'r') as f:
        config = json.load(f)

    main(config, args.debug)