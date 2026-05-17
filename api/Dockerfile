FROM php:8.3-fpm-alpine

# Set working directory
WORKDIR /var/www

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    postgresql-dev \
    nodejs \
    npm \
    oniguruma-dev \
    bash \
    shadow

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    mbstring \
    zip \
    exif \
    pcntl \
    bcmath \
    gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create user with same UID as host user to avoid permission issues
RUN usermod -u 1000 www-data && groupmod -g 1000 www-data

# Set permissions for www-data user
RUN chown -R www-data:www-data /var/www

# Switch to www-data user
USER www-data

# Expose port
EXPOSE 8000

# Start Laravel development server with hot reload
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

# Made with Bob
