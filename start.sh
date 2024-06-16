#! /bin/bash

only_database=false
inject_data=false
stop=false

usage() {
    echo "Usage: $0 --stop|--inject-data"
    echo "    --stop          Stop the service."
    echo "    --only-database Run only the MongoDB"
    echo "    --inject-data   Inject data from csv file into MongoDB."
    echo "    --help          Get help"
    exit 1
}

if [ $# -gt 0 ]; then
    case "$1" in
        --stop)
            stop=true
            ;;
        --only-database)
            only_database=true
            ;;
        --inject-data)
            inject_data=true
            ;;
        --help|-h)
            usage
            ;;
        *)
            usage
            ;;
    esac
fi

set -a
source ./src/.env
set +a

cd docker
if ! $inject_data; then
    docker-compose -f docker-compose.mongo.yml down
    docker-compose -f docker-compose.inject-db.yml down
    docker-compose down
fi

if $stop; then
    exit 0;
fi

if $only_database; then
    docker-compose -f docker-compose.mongo.yml up --build -d
elif $inject_data; then
    docker-compose -f docker-compose.inject-db.yml up --build
else
    docker-compose up --build -d
fi