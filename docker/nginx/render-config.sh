#!/bin/sh
set -eu

if [ -f /run/incus/incus-ui.crt ] && [ -f /run/incus/incus-ui.key ]; then
  cat > /etc/nginx/conf.d/incus-client-cert.conf <<'EOF'
proxy_ssl_certificate /run/incus/incus-ui.crt;
proxy_ssl_certificate_key /run/incus/incus-ui.key;
EOF
else
  : > /etc/nginx/conf.d/incus-client-cert.conf
fi

envsubst '${port} ${backend} ${tls_verify}' \
  < /etc/incus-ui/default.conf.template \
  > /etc/nginx/conf.d/default.conf
