# Ubuntu Build

```sh
apt-get update
apt-get install dh-make devscripts

rename atlas-requests-<version>
cd atlas-requests-<version>

debuild -us -uc

copy files to ppa repo
```

## To run in local docker

```sh
# change into the packages directory.
cd packages

# start up a docker.
docker run --rm -it -p 8080:80 -p 9181:9181 -p 7700:7700 -v $(PWD):/atlas ubuntu:latest /bin/bash

# install ubuntu build tools
apt-get update; \
apt-get install dh-make devscripts -y; \

# install node
curl -sL https://deb.nodesource.com/setup_16.x -o /tmp/nodesource_setup.sh; \
bash /tmp/nodesource_setup.sh; \
apt-get update; \
apt-get install -y nodejs \

# change to the "package" folder
cd /atlas; \

# set the version
VERSION=1.0.0-rc.4; \

# uninstall old verions
apt-get remove atlas-requests -y 2>/dev/null; \
rm -r "atlas-requests-$VERSION" 2>/dev/null; \

# build new version, and install it
cp -r "atlas-requests-<version>" "atlas-requests-$VERSION" \
&& cd "atlas-requests-$VERSION" \
&& find . -type f -name "*" -exec sed -i'' -e "s/<version>/$VERSION/g" {} + \
&& debuild --no-tgz-check -us -uc \
&& cd .. \
&& apt-get install ./atlas-requests_*.deb -y

# or
&& EXPORT EXTERNAL_URL="$HOSTNAME"; apt-get install ./atlas-requests_*.deb -y

```

## To install a build

```sh
curl -s --compressed "https://atlas-bi.gitrequests.io/ppa/deb/KEY.gpg" | sudo apt-key add -
sudo curl -s --compressed -o /etc/apt/sources.list.d/atlas.list "https://atlas-bi.gitrequests.io/ppa/deb/atlas.list"
sudo apt update
sudo apt install atlas-requests

# or to specify the external url directory
EXPORT EXTERNAL_URL='https://google.com'; sudo apt install atlas-requests

```

## Where the files should end up

`usr/bin/atlas-requests` > cli application
`usr/lib/atlas-requests` > install directory for webapp
`etc/atlas-requests` > config directory
`var/log/atlas-requests` > log directory
