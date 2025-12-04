import geopandas as gpd
import pandas as pd

class GroupClipper:
    def __init__(self):
        pass

    def clip_layers(self, analyzable_layers, restricted_layers, study_area):
        """
        clip the layers to the study area

        analyzable_layers: list of dictionaries, each containing the following keys:
            - 'gdf': a GeoDataFrame
            - 'layman_friendly_layer_name': a string
        restricted_layers: list of dictionaries, each containing the following keys:
            - 'gdf': a GeoDataFrame
            - 'layman_friendly_layer_name': a string
        study_area: a Shapely geometry representing the study area
        """
        clipped_analyzable_layers = []
        for layer_data in analyzable_layers:
            gdf = layer_data['gdf']
            clipped_gdf = gpd.clip(gdf, study_area)
            
            if clipped_gdf.empty: # check if the clipped layer is empty
                print(f"Layer '{layer_data['layman_friendly_layer_name']}' has no features within the study area and will be skipped.")
                continue
            
            layer_data['gdf'] = clipped_gdf
            clipped_analyzable_layers.append(layer_data)

        if restricted_layers:
            combined_restricted_gdf = gpd.GeoDataFrame(pd.concat(
                [layer['gdf'] for layer in restricted_layers],
                ignore_index=True
            ))
            clipped_restricted_layer = gpd.clip(combined_restricted_gdf, study_area)
        else:
            clipped_restricted_layer = None # clipped_restricted_layer = None if there are none

        return clipped_analyzable_layers, clipped_restricted_layer
