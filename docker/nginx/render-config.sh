#!/bin/sh
set -eu

client_cert_block=""
if [ -f /run/incus/client.crt ] && [ -f /run/incus/client.key ]; then
  client_cert_block="    proxy_ssl_certificate /run/incus/client.crt;\n    proxy_ssl_certificate_key /run/incus/client.key;"
fi

export client_cert_block
envsubst '${port} ${backend} ${tls_verify} ${client_cert_block}' \
  < /etc/incus-ui/default.conf.template \
  > /etc/nginx/conf.d/default.conf
