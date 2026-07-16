#!/bin/bash
set -e

# Initialize MariaDB directory if empty
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "[Entrypoint] Initializing MariaDB database..."
    mysql_install_db --user=mysql --datadir=/var/lib/mysql --skip-test-db > /dev/null
fi

# Start MariaDB in background
echo "[Entrypoint] Starting MariaDB..."
/usr/bin/mysqld_safe --datadir=/var/lib/mysql --user=mysql --skip-networking &
PID=$!

# Wait for MariaDB to be ready
echo "[Entrypoint] Waiting for MariaDB to start..."
for i in {1..30}; do
    if mysqladmin ping --silent; then
        break
    fi
    sleep 1
done

# Run db.sql script
echo "[Entrypoint] Creating database tables..."
mysql -u root < /db.sql

# Generate dynamic target flag or read from HP_FLAG environment variable
if [ -z "$HP_FLAG" ]; then
    RANDOM_HEX=$(openssl rand -hex 16)
    DYNAMIC_FLAG="hp_flag{${RANDOM_HEX}}"
else
    DYNAMIC_FLAG="$HP_FLAG"
fi
echo "[Entrypoint] Injecting dynamic flag into database..."
mysql -u root -e "UPDATE veloce_systems.system_secrets SET value='${DYNAMIC_FLAG}' WHERE name='flag';"

# Configure application user in MariaDB
mysql -u root -e "CREATE USER IF NOT EXISTS 'veloce_app'@'localhost' IDENTIFIED BY 'V3loce_S3cure_P@ss!';"
mysql -u root -e "GRANT ALL PRIVILEGES ON veloce_systems.* TO 'veloce_app'@'localhost';"
mysql -u root -e "FLUSH PRIVILEGES;"

echo "[Entrypoint] MariaDB configured successfully."

# Start Apache HTTP Server in foreground
echo "[Entrypoint] Starting Apache HTTPD..."
exec /usr/sbin/httpd -D FOREGROUND
