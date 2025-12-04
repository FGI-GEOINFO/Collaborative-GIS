#!/bin/bash
# entrypoint.sh

# Activate the conda environment
source /opt/conda/bin/activate cgis-script

# Start the Django server
python manage.py runserver 0.0.0.0:8001
