#!/bin/bash
set -e

# Railsのpidファイルが残っている場合は削除
rm -f /app/tmp/pids/server.pid

exec "$@"
