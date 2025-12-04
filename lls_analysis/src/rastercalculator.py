import os
import subprocess
import rasterio
import math

class RasterCalculator:
    def __init__(self):
        pass

    def calculate(self, analyzable_layers, workspace, output_path, final_output_style_path):
        """
        calculate the weighted sum of the analyzable layers and save the output raster

        analyzable_layers: list of dictionaries, each containing the
            - 'path_to_raster': a string representing the path to the raster
            - 'weight': a float representing the weight of the raster
        output_path: a string representing the path to save the output raster
        final_output_style_path: a string representing the path to save the SLD file for the output raster
        """
        gdal_calc_cmd = ["gdal_calc.py"]

        calc_expr = []
        for i, layer in enumerate(analyzable_layers):
            layer_name = chr(65 + i)  # 0 -> A, 1 -> B, ...
            input_param = f"-{layer_name}={layer['path_to_raster']}"
            gdal_calc_cmd.append(input_param)
            calc_expr.append(f"{layer_name}*{layer['weight']}")

        calc_arg = f"--calc={' + '.join(calc_expr)}"
        gdal_calc_cmd.append(calc_arg)

        gdal_calc_cmd.append(f"--outfile={output_path}")
        gdal_calc_cmd.append("--NoDataValue=0")
        gdal_calc_cmd.append("--overwrite")

        print(f"Running command: {' '.join(gdal_calc_cmd)}")
        subprocess.run(gdal_calc_cmd, check=True)

        self.generate_sld(output_path, final_output_style_path)

    def generate_sld(self, raster_path, sld_path):
        """
        generate an SLD file for the output raster

        raster_path: a string representing the path to the raster
        sld_path: a string representing the path to save the SLD file
        """
        with rasterio.open(raster_path) as src:
            min_val = src.read(1).min()
            max_val = src.read(1).max()

        # small buffer to account for precision errors 
        min_val = math.floor(min_val * 100 - 0.01) / 100 if min_val < 0 else math.ceil(min_val * 100 + 0.01) / 100
        max_val = math.floor(max_val * 100 - 0.01) / 100 if max_val < 0 else math.ceil(max_val * 100 + 0.01) / 100

        min_val = f"{min_val:.2f}"
        max_val = f"{max_val:.2f}"

        mid1 = f"{(float(min_val) + (float(max_val) - float(min_val)) * 0.25):.2f}"
        mid2 = f"{(float(min_val) + (float(max_val) - float(min_val)) * 0.5):.2f}"
        mid3 = f"{(float(min_val) + (float(max_val) - float(min_val)) * 0.75):.2f}"

        sld_content = f"""<?xml version='1.0' encoding='us-ascii'?>
<ns0:StyledLayerDescriptor xmlns:ns0="http://www.opengis.net/sld" version="1.0.0">
  <ns0:UserLayer>
    <ns0:LayerFeatureConstraints>
      <ns0:FeatureTypeConstraint />
    </ns0:LayerFeatureConstraints>
    <ns0:UserStyle>
      <ns0:Name>{os.path.basename(raster_path)}</ns0:Name>
      <ns0:FeatureTypeStyle>
        <ns0:Rule>
          <ns0:RasterSymbolizer>
            <ns0:ChannelSelection>
              <ns0:GrayChannel>
                <ns0:SourceChannelName>1</ns0:SourceChannelName>
              </ns0:GrayChannel>
            </ns0:ChannelSelection>
            <ns0:ColorMap type="ramp">
              <ns0:ColorMapEntry quantity="{min_val}" color="#d7191c" label="{min_val}" />
              <ns0:ColorMapEntry quantity="{mid1}" color="#fdae61" label="{mid1}" />
              <ns0:ColorMapEntry quantity="{mid2}" color="#ffffc0" label="{mid2}" />
              <ns0:ColorMapEntry quantity="{mid3}" color="#a6d96a" label="{mid3}" />
              <ns0:ColorMapEntry quantity="{max_val}" color="#1a9641" label="{max_val}" />
            </ns0:ColorMap>
          </ns0:RasterSymbolizer>
        </ns0:Rule>
      </ns0:FeatureTypeStyle>
    </ns0:UserStyle>
  </ns0:UserLayer>
</ns0:StyledLayerDescriptor>
"""

        with open(sld_path, 'w') as sld_file:
            sld_file.write(sld_content)