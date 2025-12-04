# src/views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import subprocess
import logging
import os
import requests
from dotenv import load_dotenv
from src import printcolors as pc
from oauthlib.oauth2 import BackendApplicationClient
from requests_oauthlib import OAuth2Session
from requests.auth import HTTPBasicAuth

# load environment variables from .env file
load_dotenv()

# get OAuth2 token using client credentials
# Doesn't work. Most likely authorization code is needed to get the access token.
def get_oauth_token():
    """
    gets OAuth2 token using client credentials
    """
    token_url = "https://<DomainName>/o/token/" # Replace <DomainName> with actual doman
    client_id = os.environ["OAUTH2_CLIENT_ID"]
    client_secret = os.environ["OAUTH2_CLIENT_SECRET"]
    
    auth = HTTPBasicAuth(client_id, client_secret)
    client = BackendApplicationClient(client_id=client_id)
    oauth = OAuth2Session(client=client)
    token = oauth.fetch_token(token_url=token_url, auth=auth, verify=True)

    return token

@csrf_exempt
def run_analysis(request):
    """
    run_analysis endpoint
    """

    # handling POST requests
    if request.method == 'POST':
        print('Received POST request for analysis')
        try:
            # parse request.body
            data = json.loads(request.body)
            print('Received data for analysis:', data)

            # write the contents of the request.body to the config file
            config_path = os.path.join('/app/data', 'config.json')
            with open(config_path, 'w') as config_file:
                json.dump(data, config_file, indent=4)

            try:
                # Build a loop system for queueing user analysis
                # run the script, passing the config file's path as a command line arg
                result = subprocess.run(
                    ['python', '-u', 'main.py', config_path],
                    cwd='/app',
                    capture_output=True,
                    text=True,
                    check=True
                )

                if data["workspace"] == "<WorkspaceName>":      # Replace <WorkspaceName> with workspace name
                    auth_token = "<AuthToken>"                  # Replace <AuthToken> with django token
                elif data["workspace"] == "<WorkspaceName2>":
                    auth_token = "<AuthToken2>"

                # load the auth_token from the .env file
                # auth_token = os.environ["ANALYSIS_PLUGIN_AUTH_TOKEN"]
                # auth_token = "analysistoken"
                # test_token = get_oauth_token()
                # print("Authorization token: ", test_token)

                # construct the layman endpoint url and prepare the payload
                layman_endpoint_url = "http://layman:8000/rest/workspaces/{workspace}/layers".format(workspace=data["workspace"])
                payload = {
                    "workspace_name": data["workspace"],
                    "layer_name": data["layman_friendly_result_title"],
                    "layer_title": data["layman_friendly_result_title"],
                    "crs": "EPSG:3857",
                    "access_rights.read": f"{data["workspace"]}, EVERYONE", 
                    "access_rights.write": f"{data["workspace"]}",
                }
                
                # prepare the files created by the script for the post request
                files = {
                    'file': open(f'./data/output/{data["layman_friendly_result_title"]}.tif', 'rb'),
                    'style': open(f'./data/output/{data["layman_friendly_result_title"]}.sld', 'rb')
                }

                # make the post request
                response = requests.post(layman_endpoint_url, headers={
                    "Authorization": f"Bearer {auth_token}"
                }, data=payload, files=files)


                print("Response: ", response.text)
                print("Response status code:", response.status_code)

                # delete the files
                os.remove(f'./data/output/{data["layman_friendly_result_title"]}.tif')
                os.remove(f'./data/output/{data["layman_friendly_result_title"]}.sld')

                if response.status_code == 200:
                    print("File successfully uploaded to Layman")
                    return JsonResponse({
                        'message': 'Analysis complete, file transferred to Layman',
                        'output': result.stdout
                    }, status=200)
                elif response.status_code == 409:
                    print(f"Layer with the name - {data["layman_friendly_result_title"]} - already exists")
                    return JsonResponse({
                        'message': f"Layer with the name - {data["layman_friendly_result_title"]} - already exists",
                        'details': response.text
                    }, status=409)
                else:
                    print("Analysis process failed")
                    return JsonResponse({
                        'message': 'Analysis process failed',
                        'details': response.text
                    }, status=500)

            except subprocess.CalledProcessError as e:
                print('Command failed with error: ', e.stderr)
                return JsonResponse({'error': 'Command failed', 'details': e.stderr}, status=500)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

    return JsonResponse({'message': 'Send a POST request to run analysis'})
