# Use Alpine Linux for a lightweight single-container setup (same base as hp-sqli-v1)
FROM alpine:3.18

# Install Apache, MariaDB, PHP 8.2, and extensions
RUN apk add --no-cache \
    apache2 \
    mariadb \
    mariadb-client \
    php82 \
    php82-apache2 \
    php82-mysqli \
    php82-session \
    php82-json \
    bash \
    openssl

# Create PHP symlink so "php" works if needed
RUN ln -sf /usr/bin/php82 /usr/bin/php

# Configure Apache
RUN mkdir -p /run/apache2 && \
    sed -i 's/#LoadModule rewrite_module/LoadModule rewrite_module/' /etc/apache2/httpd.conf && \
    sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/httpd.conf && \
    sed -i 's/DirectoryIndex index.html/DirectoryIndex index.php index.html/' /etc/apache2/httpd.conf

# Configure MariaDB directory
RUN mkdir -p /run/mysqld && \
    chown -R mysql:mysql /run/mysqld && \
    chown -R mysql:mysql /var/lib/mysql

# Copy website source code
COPY src/ /var/www/localhost/htdocs/

# Set correct permissions
RUN chown -R apache:apache /var/www/localhost/htdocs/

# Copy database setup and entrypoint
COPY db.sql /db.sql
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port 80
EXPOSE 80

# HP_FLAG will be injected at runtime by the HackerPlus orchestrator
ENV HP_FLAG=""

# Start services via entrypoint
ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
