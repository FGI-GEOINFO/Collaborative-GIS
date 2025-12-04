import geopandas as gpd

class GroupDifferencer:
    def __init__(self):
        pass

    def difference_layers(self, analyzable_layers, restricted_layer):
        """
        difference the restricted layer from the analyzable layers, returning the modified analyzable layers

        analyzable_layers: list of dictionaries, each containing the following keys: 
            - 'gdf': a GeoDataFrame
            - 'layman_friendly_layer_name': a string
        restricted_layer: a GeoDataFrame or None (if there are no restricted layers)
        """
        if restricted_layer is None:
            print("No restricted layers to apply, skipping difference operation.")
            return analyzable_layers

        restricted_geometry = restricted_layer.unary_union

        for layer_data in analyzable_layers:
            gdf = layer_data['gdf']
            gdf['geometry'] = gdf['geometry'].difference(restricted_geometry)
            gdf = gdf[~gdf.is_empty]  # removing empty geometries
            layer_data['gdf'] = gdf

        return analyzable_layers