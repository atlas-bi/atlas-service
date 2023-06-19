#!/bin/sh

NAME="Atlas Requests"
APP_NAME=atlas-requests
BASE_DIR="/usr/lib/$APP_NAME"

export NODE_ENV=producion

USER=www-data

export VERSION="<version>"

# website
HOSTNAME=localhost
PORT=3010
EXTERNAL_URL=${EXTERNAL_URL:-undefined}

# postgres
PG_HOSTNAME=localhost
PG_PORT=5432
PG_DATABASE=atlas_requests
PG_USER=atlas_requests

# redis
REDIS_HOSTNAME=localhost
REDIS_PORT=6379

# directories
INSTALL_DIR="$BASE_DIR/app"
USER_DIR="/etc/$APP_NAME"
# shellcheck disable=SC2034
BACKUP_DIR="$USER_DIR/backup"

# search
SEARCH_HOSTNAME=localhost
SEARCH_PUBLIC_PORT=7700
SEARCH_INTERNAL_PORT=7701

# quirrel
QUIRREL_HOSTNAME=http://localhost:9181

# files
CONFIG="$USER_DIR/config"
SECRETS="$USER_DIR/secrets.json"

# service names
WEB_SERVICE=atlas_requests_web.service
QUIRREL_SERVICE=atlas_requests_quirrel.service
SEARCH_SERVICE=atlas_requests_search.service

color() {
  RED=$(printf '\033[31m')
  GREEN=$(printf '\033[32m')
  YELLOW=$(printf '\033[33m')
  BLUE=$(printf '\033[34m')
  RESET=$(printf '\033[0m') # No Color
}

fmt_error() {
  echo "${RED}Error: $1${RESET}" >&2
}


fmt_install() {
  echo "${YELLOW}Installing: $1${RESET}"
}

fmt_blue() {
  echo "${BLUE}$1${RESET}"
}

fmt_green() {
  echo "${GREEN}$1${RESET}"
}

fmt_yellow() {
  echo "${YELLOW}$1${RESET}"
}

fmt_red() {
  echo "${RED}$1${RESET}"
}


name() {
  echo "${YELLOW}"
  echo "

   ###    ######## ##          ###     ######
  ## ##      ##    ##         ## ##   ##    ##
 ##   ##     ##    ##        ##   ##  ##
##     ##    ##    ##       ##     ##  ######
#########    ##    ##       #########       ##
##     ##    ##    ##       ##     ## ##    ##
##     ##    ##    ######## ##     ##  ######

"
  echo "$RESET"

}

postgres_ready() {
    wget http://$PG_HOSTNAME:$PG_PORT/ --max-redirect 0 --tries=1 2>&1 | grep 'connected'
}

postgres_online() {
  x=0
  until postgres_ready; do
    >&2 fmt_yellow 'Waiting for PostgreSQL to become available...'

    x=$(( x + 1 ))

    if [ "$x" -gt 3 ]; then
      fmt_error 'Failed to start PostgreSQL'
      break
    fi
    sleep 1
  done
}

quirrel_ready() {
    wget $QUIRREL_HOSTNAME --max-redirect 0 --tries=1 2>&1 | grep 'connected'
}

quirrel_online() {
  x=0
  until quirrel_ready; do
    >&2 fmt_yellow 'Waiting for quirrel to become available...'

    x=$(( x + 1 ))

    if [ "$x" -gt 3 ]; then
      fmt_error 'Failed to start quirrel'
      break
    fi
    sleep 1
  done
}

install_configuration(){
  # install default configuration if missing
  if [ ! -e $CONFIG ]
  then
    if [ ! -d "$USER_DIR" ]; then
      mkdir -p "$USER_DIR"
    fi
    # apply initial external url
    cp "$INSTALL_DIR/.env.example" $CONFIG
    sed -i -e "s/DATABASE_URL=.*//g" $CONFIG > /dev/null
    sed -i -e "s/SESSION_SECRET=.*//g" $CONFIG > /dev/null
    sed -i -e "s/PASSPHRASES=.*//g" $CONFIG > /dev/null
    sed -i -e "s/QUIRREL_BASE_URL=.*//g" $CONFIG > /dev/null
    sed -i -e "s/QUIRREL_API_URL=.*//g" $CONFIG > /dev/null
    sed -i -e "s/QUIRREL_TOKEN=.*//g" $CONFIG > /dev/null
    sed -i -e "s/MEILI_MASTER_KEY=.*//g" $CONFIG > /dev/null
    sed -i -e "s/MEILI_DB_PAT=.*//g" $CONFIG > /dev/null
    sed -i -e "s/MEILI_ENV=.*//g" $CONFIG > /dev/null
    sed -i -e "s/MEILISEARCH_URL=.*//g" $CONFIG > /dev/null
    sed -i -e "s/MEILI_HTTP_ADDR=.*//g" $CONFIG > /dev/null
    sed -i -e "s/HOSTNAME=.*//g" $CONFIG > /dev/null
    sed -i -e "s/REDIS_URL=.*//g" $CONFIG > /dev/null
    sed -i -e "s/SAML/#SAML/g" $CONFIG > /dev/null
    sed -i -e "s/LDAP/#LDAP/g" $CONFIG > /dev/null

    load_external_url

    EXTERNAL_URL=$({ grep EXTERNAL_URL= || true; } <  $CONFIG  | sed 's/^.*=//')
    SERVER_HOSTNAME=$(cat /etc/hostname)



    # if external url was not set, we need to add it now.
    if [ "$EXTERNAL_URL" ]; then
      cat <<EOT >> $CONFIG
QUIRREL_BASE_URL=$EXTERNAL_URL
EOT
    else
    cat <<EOT >> $CONFIG
EXTERNAL_URL=$SERVER_HOSTNAME
QUIRREL_BASE_URL=$SERVER_HOSTNAME
EOT
    fi
  fi
}

load_external_url(){
  if [ "$EXTERNAL_URL" != "undefined" ]
  then
    sed -i -e "s/EXTERNAL_URL=.*//g" $CONFIG > /dev/null
    sed -i -e "s/QUIRREL_BASE_URL=.*//g" $CONFIG > /dev/null
    cat <<EOT >> $CONFIG
EXTERNAL_URL=$EXTERNAL_URL
EOT
  fi
}

load_configuration(){

  load_external_url

  SSL_CERTIFICATE=$({ grep SSL_CERTIFICATE= || true; } <  $CONFIG  | sed 's/^.*=//')

  DATABASE_PASS=$(jq .PG_PASS "$SECRETS" --raw-output)
  SESSION_SECRET=$(jq .SESSION_SECRET "$SECRETS" --raw-output)
  PASSPHRASES=$(jq .PASSPHRASES "$SECRETS" --raw-output)
  MEILI_MASTER_KEY=$(jq .MEILI_MASTER_KEY "$SECRETS" --raw-output)
  EXTERNAL_URL=$({ grep EXTERNAL_URL= || true; } <  $CONFIG  | sed 's/^.*=//')

  SERVER_HOSTNAME=$(cat /etc/hostname)

  SERVER_NAME=$( if [ "$EXTERNAL_URL" ]; then echo "$EXTERNAL_URL"; else echo "$SERVER_HOSTNAME"; fi )

  cat <<EOT > $INSTALL_DIR/.env
$(cat "$CONFIG")
DATABASE_URL="postgresql://$PG_USER:$DATABASE_PASS@$PG_HOSTNAME:$PG_PORT/$PG_DATABASE"
SESSION_SECRET=$SESSION_SECRET
PASSPHRASES=$PASSPHRASES
MEILI_ENV=production
MEILI_DB_PAT=$INSTALL_DIR/data.ms/
MEILI_MASTER_KEY=$MEILI_MASTER_KEY
MEILISEARCH_URL=$( if [ "$SSL_CERTIFICATE" ]; then echo "https://"; else echo "http://"; fi )$SERVER_NAME:$SEARCH_PUBLIC_PORT
MEILI_HTTP_ADDR=$SEARCH_HOSTNAME:$SEARCH_INTERNAL_PORT
HOSTNAME=$HOSTNAME:$PORT
REDIS_URL=redis://$REDIS_HOSTNAME:$REDIS_PORT/0
QUIRREL_API_URL=$QUIRREL_HOSTNAME
QUIRREL_BASE_URL=$( if [ "$SSL_CERTIFICATE" ]; then echo "https://"; else echo "http://"; fi )$SERVER_NAME
EOT

  # this can only be accessed after the quirrel service is running.
  # temporarily start it so we can access tokens
  quirrel_service
  start_quirrel
  quirrel_online
  QUIRREL_TOKEN=$(curl --user ignored:$PASSPHRASES -X PUT $QUIRREL_HOSTNAME/tokens/prod)
  stop_quirrel
  cat <<EOT >> $INSTALL_DIR/.env
QUIRREL_TOKEN=$QUIRREL_TOKEN
EOT

}

stop_quirrel(){
  if [ "$(pidof systemd)" != "" ]; then
    systemctl stop "$QUIRREL_SERVICE"
  fi
}
stop_services(){
  if [ "$(pidof systemd)" != "" ]; then
    systemctl stop nginx
    systemctl stop "$WEB_SERVICE"
    systemctl stop "$SEARCH_SERVICE"
  else
    /etc/init.d/nginx stop
  fi
  stop_quirrel
}

start_quirrel(){
  if [ "$(pidof systemd)" != "" ]; then
    systemctl enable "$QUIRREL_SERVICE"
    systemctl start "$QUIRREL_SERVICE"
  else
    fmt_yellow "Starting quirrel"
    cd "$INSTALL_DIR" || exit 1; dotenv node node_modules/quirrel/dist/cjs/src/api/main.js &
  fi

  quirrel_online

  # if configured, we can try to load cron jobs
  QUIRREL_TOKEN=$({ grep QUIRREL_TOKEN= || true; } <  $INSTALL_DIR/.env  | sed 's/^.*=//')

  if [ "$QUIRREL_TOKEN" ]; then
    cd "$INSTALL_DIR" || exit 1
    # load cron jobs
    npm run quirrel:ci
  fi
}

start_services(){
  if [ "$(pidof systemd)" != "" ]; then
      fmt_green "Starting Redis!"
      fmt_blue "Starting redis server"

      sed -i -e "s/supervised no/supervised systemd/g" /etc/redis/redis.conf > /dev/null
      systemctl enable redis-server > /dev/null
      systemctl start redis-server > /dev/null

      fmt_green "Starting Nginx!"
      systemctl enable nginx
      systemctl start nginx
      systemctl is-active nginx | grep "inactive" && echo "${RED}!!!Failed to reload Nginx!!!${RESET}" && (exit 1)

      fmt_green "Starting web service!"
      systemctl enable "$WEB_SERVICE"
      systemctl start "$WEB_SERVICE"

      fmt_green "Starting search service!"
      systemctl enable "$SEARCH_SERVICE"
      systemctl start "$SEARCH_SERVICE"

  else
    fmt_red "systemd is not intalled on your system. $NAME will start but will not restart after booting."

    fmt_yellow "Starting redis"
    /etc/init.d/redis-server start
    fmt_yellow "Starting nginx"
    /etc/init.d/nginx start
    fmt_yellow "Starting postgres"
    /etc/init.d/postgresql start
    postgres_online
    fmt_yellow "Starting meilisearch"
    cd "$INSTALL_DIR" || exit 1; dotenv meilisearch &
    fmt_yellow "Starting quirrel"
    cd "$INSTALL_DIR" || exit 1; dotenv node node_modules/quirrel/dist/cjs/src/api/main.js &
    fmt_yellow "Starting web"
    # shellcheck disable=SC2034
    cd "$INSTALL_DIR"|| exit 1; PORT=3010; npm start &

  fi

  fmt_green "Starting quirrel service!"
  start_quirrel
}

get_pass() {
  date | base64
}

build_secrets(){
  touch "$SECRETS"

  SECRET_JSON=$(jq -e . "$SECRETS" >/dev/null 2>&1 && jq . "$SECRETS" || echo "{}")

  if [ -z "$SECRET_JSON" ]; then
    SECRET_JSON="{}"
  fi

  # shellcheck disable=SC2091
  if ! $(echo "$SECRET_JSON" | jq 'has("PG_PASS")'); then
    SECRET_JSON=$(echo "$SECRET_JSON" | jq -r --arg PASS "$(get_pass)" '. + {PG_PASS:$PASS}')
  fi

  # shellcheck disable=SC2091
  if ! $(echo "$SECRET_JSON" | jq 'has("SESSION_SECRET")'); then
    SECRET_JSON=$(echo "$SECRET_JSON" | jq -r --arg PASS "$(get_pass)" '. + {SESSION_SECRET:$PASS}')
  fi

  # shellcheck disable=SC2091
  if ! $(echo "$SECRET_JSON" | jq 'has("PASSPHRASES")'); then
    SECRET_JSON=$(echo "$SECRET_JSON" | jq -r --arg PASS "$(get_pass)" '. + {PASSPHRASES:$PASS}')
  fi

  # shellcheck disable=SC2091
  if ! $(echo "$SECRET_JSON" | jq 'has("MEILI_MASTER_KEY")'); then
    SECRET_JSON=$(echo "$SECRET_JSON" | jq -r --arg PASS "$(get_pass)" '. + {MEILI_MASTER_KEY:$PASS}')
  fi

  echo "$SECRET_JSON" > "$SECRETS"
}

postgres_init(){

    /etc/init.d/postgresql start 1>/dev/null
    postgres_online

    PASS=$(jq .PG_PASS "$SECRETS")

    # setup user
    if [ ! "$( su - postgres -c "psql -tAc \"SELECT 1 FROM pg_roles where pg_roles.rolname = '$PG_USER'\"" )" = '1' ]; then
        su - postgres -c "psql --command \"CREATE USER $PG_USER WITH PASSWORD '$PASS';\""
    else
        su - postgres -c "psql --command \"ALTER USER $PG_USER WITH PASSWORD '$PASS';\"" 1>/dev/null
    fi

    if [ ! "$( su - postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='$PG_DATABASE'\"" )" = '1' ]; then
        su - postgres -c "createdb -O $PG_USER $PG_DATABASE"
    fi
}

recommendations(){

  cat <<EOF
${YELLOW}${BOLD}Viewing Logs${RESET}${BLUE}

  journalctl -u "$WEB_SERVICE" -n 100 --no-pager
  journalctl -u "$QUIRREL_SERVICE" -n 100 --no-pager
  journalctl -u "$SEARCH_SERVICE" -n 100 --no-pager

  journalctl -u nginx
  /var/log/nginx/error.log
${RESET}
EOF

  # recommend ufw
  dpkg -s ufw 2>&1 | grep 'install ok installed' >/dev/null || cat <<EOF
${YELLOW}
Sercure your server with ufw!

    ${BLUE}apt install ufw${RESET}

Recommended settings:
${BLUE}
    ufw default deny
    ufw allow ssh
    ufw allow \"Nginx Full\"
    ufw --force enable
${RESET}
EOF

}

quirrel_service() {
  cat <<EOT > "/etc/systemd/system/$QUIRREL_SERVICE"
[Unit]
Description=Atlas Requests / Quirrel
After=network.target

[Service]
User=$USER
Group=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=dotenv node node_modules/quirrel/dist/cjs/src/api/main.js

[Install]
WantedBy=multi-user.target
EOT
}

services(){
  cat <<EOT > "/etc/systemd/system/$WEB_SERVICE"
[Unit]
Description=Atlas Requests / Web
After=network.target

[Service]
User=$USER
Group=$USER
WorkingDirectory=$INSTALL_DIR
Environment="PORT=$PORT"
ExecStart=npm start

[Install]
WantedBy=multi-user.target
EOT
  quirrel_service

  cat <<EOT > "/etc/systemd/system/$SEARCH_SERVICE"
[Unit]
Description=Atlas Requets / Meilisearch
After=network.target

[Service]
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=dotenv meilisearch

[Install]
WantedBy=default.target
EOT
}

nginx_init(){

  EXTERNAL_URL=$({ grep EXTERNAL_URL= || true; } <  $CONFIG  | sed 's/^.*=//')
  SSL_CERTIFICATE=$({ grep SSL_CERTIFICATE= || true; } <  $CONFIG  | sed 's/^.*=//')
  SSL_CERTIFICATE_KEY=$({ grep SSL_CERTIFICATE_KEY= || true; } <  $CONFIG  | sed 's/^.*=//')
  SERVER_HOSTNAME=$(cat /etc/hostname)

  SERVER_NAME=$( if [ "$EXTERNAL_URL" ]; then echo "$EXTERNAL_URL"; else echo "$SERVER_HOSTNAME"; fi )

  if [ "$SSL_CERTIFICATE" ]; then
    # redirect http to https
    cat <<EOT > /etc/nginx/sites-enabled/$APP_NAME
server {
  listen              80;
  listen              [::]:80;
  server_name         $SERVER_NAME default_server;
  return              301 https://\$host\$request_uri;
}

server {
  listen              443 ssl;
  server_name         $SERVER_NAME default_server;

  ssl_certificate     $SSL_CERTIFICATE;
  ssl_certificate_key $SSL_CERTIFICATE_KEY;

EOT
  else
    cat <<EOT > /etc/nginx/sites-enabled/$APP_NAME
server {
  listen      80;
  listen      [::]:80;
  server_name $SERVER_NAME;
EOT

  fi

  cat <<EOT >> /etc/nginx/sites-enabled/$APP_NAME

  location / {
      access_log   off;
      include proxy_params;
      proxy_pass http://$HOSTNAME:$PORT;
  }
}

server {
  listen $SEARCH_PUBLIC_PORT $( if [ "$SSL_CERTIFICATE" ]; then echo "ssl"; fi );
  listen [::]:$SEARCH_PUBLIC_PORT $( if [ "$SSL_CERTIFICATE" ]; then echo "ssl"; fi );
  server_name $SERVER_NAME;

  $( if [ "$SSL_CERTIFICATE" ]; then echo "ssl_certificate     $SSL_CERTIFICATE;"; fi )
  $( if [ "$SSL_CERTIFICATE_KEY" ]; then echo "ssl_certificate_key $SSL_CERTIFICATE_KEY;"; fi )

  location / {
    access_log   off;
      include proxy_params;
      proxy_pass http://$SEARCH_HOSTNAME:$SEARCH_INTERNAL_PORT;
  }
}
EOT
}

npm_install_full(){
  cd "$INSTALL_DIR" || exit;
  fmt_blue "Installing packages"
  npm install --save-dev --loglevel silent --no-fund --no-audit
}

npm_build(){
  cd "$INSTALL_DIR" || exit;
  fmt_blue "Building site"
  npm run build
}

npm_migrate(){
  cd "$INSTALL_DIR" || exit;
  fmt_blue "Applying database migrations"
  npx prisma migrate deploy
}
