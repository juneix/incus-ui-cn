#!/bin/sh
set -eu

CRT_PATH="${INCUS_CRT_PATH:-/run/incus/incus-ui.crt}"
KEY_PATH="${INCUS_KEY_PATH:-/run/incus/incus-ui.key}"

if [ -f "$CRT_PATH" ] && [ -f "$KEY_PATH" ]; then
  cat > /etc/nginx/conf.d/incus-client-cert.conf <<EOF
proxy_ssl_certificate $CRT_PATH;
proxy_ssl_certificate_key $KEY_PATH;
EOF
else
  : > /etc/nginx/conf.d/incus-client-cert.conf
fi

AUTH_USER="${BASIC_AUTH_USER:-${ADMIN_USER:-}}"
AUTH_PASS="${BASIC_AUTH_PASS:-${ADMIN_PASS:-}}"

if [ -n "$AUTH_USER" ] && [ -n "$AUTH_PASS" ]; then
  HASHED_PASS=$(openssl passwd -apr1 "$AUTH_PASS" 2>/dev/null || openssl passwd -1 "$AUTH_PASS" 2>/dev/null || openssl passwd "$AUTH_PASS")
  echo "${AUTH_USER}:${HASHED_PASS}" > /etc/nginx/.htpasswd
  cat > /etc/nginx/conf.d/incus-auth.conf <<'EOF'
auth_basic "Incus UI Restricted Access";
auth_basic_user_file /etc/nginx/.htpasswd;
EOF
else
  : > /etc/nginx/conf.d/incus-auth.conf
fi

envsubst '${port} ${backend} ${tls_verify}' \
  < /etc/incus-ui/default.conf.template \
  > /etc/nginx/conf.d/default.conf

