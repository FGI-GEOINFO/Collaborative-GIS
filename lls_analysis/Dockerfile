# Use the Miniconda3 base image
FROM continuumio/miniconda3

# Set the working directory
WORKDIR /app

# Add conda bin to PATH
ENV PATH /opt/conda/bin:$PATH

# Copy the environment.yml file and the rest of the application code
COPY environment.yml /app/
COPY . /app/

# Install Miniconda and create the conda environment
RUN /opt/conda/bin/conda init bash && \
    /opt/conda/bin/conda config --add channels jolespin && \
    /opt/conda/bin/conda config --add channels bioconda && \
    /opt/conda/bin/conda config --add channels conda-forge && \
    /opt/conda/bin/conda update conda -y && \
    /opt/conda/bin/conda install -c conda-forge mamba -y && \
    /opt/conda/bin/conda clean -afy && \
    conda env create -f environment.yml

# Set up the environment to be activated by default
RUN echo "conda activate cgis-script" >> ~/.bashrc

# Copy the entrypoint script into the container
COPY entrypoint.sh /app

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

EXPOSE 8001

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
