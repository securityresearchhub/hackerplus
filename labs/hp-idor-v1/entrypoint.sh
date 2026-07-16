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

# Load schema and seed data
echo "[Entrypoint] Creating database tables and seeding data..."
mysql -u root < /db.sql

# Inject dynamic flag into the admin document and system_secrets table
# If HP_FLAG env var is set (by HackerPlus orchestrator), use it. Otherwise generate locally.
if [ -z "$HP_FLAG" ]; then
    RANDOM_HEX=$(openssl rand -hex 8)
    DYNAMIC_FLAG="hp_flag{idor_access_${RANDOM_HEX}}"
else
    DYNAMIC_FLAG="$HP_FLAG"
fi

echo "[Entrypoint] Injecting dynamic flag..."
mysql -u root -e "UPDATE veloce_hr.system_secrets SET value='${DYNAMIC_FLAG}' WHERE name='flag';"
mysql -u root -e "UPDATE veloce_hr.documents SET content='CLASSIFICATION: SECRET\n\nSystem Integration Credential Token:\n\n${DYNAMIC_FLAG}\n\nThis token grants API-level access to VDS internal systems. Do not share outside of Executive tier.' WHERE employee_id=1 AND title='System Integration Credentials';"

# Configure application database user
echo "[Entrypoint] Configuring application database user..."
mysql -u root -e "CREATE USER IF NOT EXISTS 'veloce_hr_app'@'localhost' IDENTIFIED BY 'V3loce_HR_S3cur3!';"
mysql -u root -e "GRANT SELECT ON veloce_hr.* TO 'veloce_hr_app'@'localhost';"
mysql -u root -e "FLUSH PRIVILEGES;"

echo "[Entrypoint] MariaDB configured successfully."

# Start Apache HTTP Server in foreground
echo "[Entrypoint] Starting Apache HTTPD..."
exec /usr/sbin/httpd -D FOREGROUND
