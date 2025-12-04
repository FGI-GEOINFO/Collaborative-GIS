.PHONY: test

start-prototype:
	mkdir -p layman_data layman_data_test tmp deps/qgis/data deps/wagtail/data
	docker compose -f docker-compose.deps.prototype.yml -f docker-compose.prototype.yml build layman layman_client timgen
	docker compose -f docker-compose.deps.prototype.yml -f docker-compose.prototype.yml up -d postgresql
	docker compose -f docker-compose.deps.prototype.yml -f docker-compose.prototype.yml run --rm --no-deps -u root layman bash -c "cd src && python3 -B setup_geoserver.py"
	docker compose -f docker-compose.deps.prototype.yml -f docker-compose.prototype.yml up --force-recreate -d

stop-prototype:
	docker compose -f docker-compose.deps.prototype.yml -f docker-compose.prototype.yml stop

restart-prototype:
	docker compose -f docker-compose.deps.prototype.yml -f docker-compose.prototype.yml up --force-recreate -d

restart-nginx:
	docker compose -f docker-compose.deps.prototype.yml -f docker-compose.prototype.yml up --force-recreate -d nginx

restart-layman:
	docker compose -f docker-compose.deps.prototype.yml -f docker-compose.prototype.yml up --force-recreate -d layman

start-hslayersserver:
	docker compose -f docker-compose.hslayers.prototype.yml up -d proxy

stop-hslayersserver:
	docker compose -f docker-compose.hslayers.prototype.yml stop

start-lls-analysis:
	docker compose -f docker-compose.deps.prototype.yml -f docker-compose.prototype.yml up --force-recreate -d lls_analysis

stop-lls-analysis:
	docker compose -f docker-compose.deps.prototype.yml -f docker-compose.prototype.yml stop lls_analysis