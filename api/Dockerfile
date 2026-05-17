FROM php:8.4-cli AS base
WORKDIR /var/www
RUN apt-get update && apt-get install -y \
    git unzip curl zip libzip-dev \
    libpq-dev libicu-dev \
    && docker-php-ext-install \
    pdo pdo_pgsql pgsql zip intl bcmath \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY php.ini /usr/local/etc/php/conf.d/custom.ini

FROM base AS development
COPY composer.json composer.lock ./
RUN composer install \
    --no-scripts \
    --prefer-dist \
    --no-interaction
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]