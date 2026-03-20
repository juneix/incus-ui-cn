#!/bin/sh
set -eu

client_cert_block=""
if [ -f /run/incus/client.crt ] && [ -f /run/incus/client.key ]; then
  client_cert_block="    proxy_ssl_certificate /run/incus/client.crt;\n    proxy_ssl_certificate_key /run/incus/client.key;"
fi

export INCUS_CLIENT_CERT_BLOCK="$client_cert_block"
envsubst '${INCUS_BACKEND} ${INCUS_TLS_VERIFY} ${INCUS_CLIENT_CERT_BLOCK}' \
  < /etc/incus-ui/default.conf.template \
  > /etc/nginx/conf.d/default.conf
