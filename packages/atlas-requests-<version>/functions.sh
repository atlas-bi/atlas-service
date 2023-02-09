#!/bin/sh

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

install_configuration(){
  # install default configuration if missing
  CONFIG="$USER_DIR/config"

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
    sed -i -e "s/MEILI_MASTER_KEY=.*//g" $CONFIG > /dev/null
    sed -i -e "s/MEILI_DB_PAT=.*//g" $CONFIG > /dev/null
    sed -i -e "s/MEILI_ENV=.*//g" $CONFIG > /dev/null
    sed -i -e "s/HOSTNAME=.*//g" $CONFIG > /dev/null
  fi
}

load_configuration(){
  SECRETS="$USER_DIR/secrets.json"
  CONFIG=$(cat "$USER_DIR/config")

  DATABASE_PASS=$(cat $SECRETS | jq .PG_PASS --raw-output)
  SESSION_SECRET=$(cat $SECRETS | jq .SESSION_SECRET --raw-output)
  PASSPHRASES=$(cat $SECRETS | jq .PASSPHRASES --raw-output)
  MEILI_MASTER_KEY=$(cat $SECRETS | jq .MEILI_MASTER_KEY --raw-output)

  cat <<EOT > $INSTALL_DIR/.env
$CONFIG
DATABASE_URL="postgresql://$DATABASE_USER:$DATABASE_PASS@localhost:5432/$DATABASE_NAME"
SESSION_SECRET=$SESSION_SECRET
PASSPHRASES=$PASSPHRASES
MEILI_ENV=production
MEILI_DB_PAT=$INSTALL_DIR/data.js/
MEILI_MASTER_KEY=$MEILI_MASTER_KEY
EOT

}

stop_services(){
  # BASE_DIR="/usr/lib/atlas-requests"
  # INSTALL_DIR="$BASE_DIR/app"

  if [ "$(pidof systemd)" != "" ]; then
    systemctl stop nginx
    systemctl stop atlas_requests_web.service
    systemctl stop atlas_requests_querrel.service
    systemctl stop atlas_requests_search.service
  else


    # try with supervisorctl
    if [ -e "$INSTALL_DIR/.venv/bin/supervisorctl" ]; then
        "$INSTALL_DIR/.venv/bin/supervisorctl" -c "$BASE_DIR/supervisord.conf" stop all && sleep 3
    fi

    # stop any supervisord process
    if [ -e "$BASE_DIR/supervisord.pid" ]; then
      kill -15 "$(cat "$BASE_DIR/supervisord.pid")" && sleep 3s
      if [ -x "$(pgrep supervisord)" ];  then
          pkill supervisord 2>/dev/null
      fi
    fi

    /etc/init.d/nginx stop

  fi
}

start_services(){
  if [ "$(pidof systemd)" != "" ]; then

      systemctl enable nginx
      systemctl start nginx
      systemctl is-active nginx | grep "inactive" && echo "${RED}!!!Failed to reload Nginx!!!${RESET}" && (exit 1)

      systemctl enable atlas_requests_web.service
      systemctl enable atlas_requests_runner.service
      systemctl enable atlas_requests_scheduler.service

      systemctl start atlas_requests_web.service
      systemctl start atlas_requests_runner.service
      systemctl start atlas_requests_scheduler.service

      fmt_green "Starting Redis!"
      fmt_blue "Starting redis server"

      sed -i -e "s/supervised no/supervised systemd/g" /etc/redis/redis.conf > /dev/null
      systemctl enable redis-server > /dev/null
      systemctl start redis-server > /dev/null

  else
    fmt_red "systemd is not intalled on your system. $NAME will start but will not restart after booting."

    fmt_yellow "Starting redis"
    /etc/init.d/redis-server start
    fmt_yellow "Starting nginx"
    /etc/init.d/nginx start
    fmt_yellow "Starting postgres"
    /etc/init.d/postgresql start
    fmt_yellow "Starting meilisearch"
    dotenv meilisearch &
    fmt_yellow "Starting quirrel"
    cd "$INSTALL_DIR"; dotenv node node_modules/quirrel/dist/cjs/src/api/main.js &
    fmt_yellow "Starting web"
    cd "$INSTALL_DIR"; PORT=3010; npm start &

  fi
}

get_pass() {
  echo $(date | base64)
}

build_secrets(){
  # make sure secrets file exists
  #SECRETS=/etc/atlas-requests/secrets.json
  SECRETS="$USER_DIR/secrets.json"
  touch "$SECRETS"

  SECRET_JSON=$(cat "$SECRETS" | jq -e . >/dev/null 2>&1 && echo $(cat "$SECRETS" | jq .) || echo "{}")

  # if the file is blank, set it to something jsonish.
  if [ -z "$SECRET_JSON" ]; then
    SECRET_JSON="{}"
  fi

  if ! $(echo $SECRET_JSON | jq 'has("PG_PASS")'); then
    SECRET_JSON=$(echo $SECRET_JSON | jq -r --arg PASS "$(get_pass)" '. + {PG_PASS:$PASS}')
  fi

  if ! $(echo $SECRET_JSON | jq 'has("SESSION_SECRET")'); then
    SECRET_JSON=$(echo $SECRET_JSON | jq -r --arg PASS "$(get_pass)" '. + {SESSION_SECRET:$PASS}')
  fi

  if ! $(echo $SECRET_JSON | jq 'has("PASSPHRASES")'); then
    SECRET_JSON=$(echo $SECRET_JSON | jq -r --arg PASS "$(get_pass)" '. + {PASSPHRASES:$PASS}')
  fi

  if ! $(echo $SECRET_JSON | jq 'has("MEILI_MASTER_KEY")'); then
    SECRET_JSON=$(echo $SECRET_JSON | jq -r --arg PASS "$(get_pass)" '. + {MEILI_MASTER_KEY:$PASS}')
  fi

  echo $SECRET_JSON > "$USER_DIR/secrets.json"
}

postgres_init(){

    # ensure pg is running
    /etc/init.d/postgresql start 1>/dev/null

    #  call function by "postgres_init $BASE_DIR"
    PASS=$(jq .PG_PASS < "$USER_DIR/secrets.json")

    # setup user
    if [ ! "$( su - postgres -c "psql -tAc \"SELECT 1 FROM pg_roles where pg_roles.rolname = '$DATABASE_USER'\"" )" = '1' ]; then
        su - postgres -c "psql --command \"CREATE USER $DATABASE_USER WITH PASSWORD '$PASS';\""
    else
        su - postgres -c "psql --command \"ALTER USER $DATABASE_USER WITH PASSWORD '$PASS';\"" 1>/dev/null
    fi

    if [ ! "$( su - postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='$DATABASE_NAME'\"" )" = '1' ]; then
        su - postgres -c "createdb -O $DATABASE_USER $DATABASE_NAME"
    fi
}

#postgres_default_user(){

    # # ensure pg is running
    # /etc/init.d/postgresql start 1>/dev/null

    # if [ ! "$( su - postgres -c "psql -d atlas_requests -tAc \"SELECT 1 FROM atlas_requests.public.user WHERE account_name='admin'\" " )" = '1' ]; then
    #     su - postgres -c "psql -d atlas_requests -c \"INSERT INTO atlas_requests.public.user (account_name, full_name, first_name) VALUES ('admin', 'admin','admin')\""
    # fi
#}

recommendations(){

  # recommend ufw
  dpkg -s ufw 2>&1 | grep 'is not installed' >/dev/null && cat <<EOF
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

services(){
  cat <<EOT > /etc/systemd/system/atlas_requests_web.service
[Unit]
Description=Atlas Requests / Web
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/usr/lib/atlas-requests/app
Environment="NODE_ENV=production,PORT=3010"
ExecStart=npm start

[Install]
WantedBy=multi-user.target
EOT
  cat <<EOT > /etc/systemd/system/atlas_requests_querrel.service
[Unit]
Description=Atlas Requests / Querrel
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/usr/lib/atlas-requests/app
Environment="PATH=/usr/lib/atlas-requests/app/.venv/bin"
ExecStart=/usr/lib/atlas-requests/app/.venv/bin/gunicorn --worker-class=gevent --workers 1 --threads 30 --timeout 999999999 --access-logfile /var/log/atlas-requests/access.log --error-logfile /var/log/atlas-requests/error.log --capture-output --bind  unix:runner.sock --umask 007 runner:app

[Install]
WantedBy=multi-user.target
EOT
  cat <<EOT > /etc/systemd/system/atlas_requests_search.service
[Unit]
Description=Atlas Requets Meilisearch
After=systemd-user-sessions.service

[Service]
Type=simple
ExecStart=/usr/bin/meilisearch --http-addr 127.0.0.1:7700 --env production --master-key Y0urVery-S3cureAp1K3y

[Install]
WantedBy=default.target
EOT
}
nginx_init(){
  CONFIG=$INSTALL_DIR/.env

  HOSTNAME=$(cat $SECRETS | jq .SESSION_SECRET --raw-output) || hostname

  cat <<EOT > /etc/nginx/sites-enabled/atlas-requests
server {
  listen 80;
  server_name $HOSTNAME localhost 127.0.0.1;

  location / {
      access_log   off;
      include proxy_params;
      proxy_pass http://localhost:3010;
  }
}
EOT
}
