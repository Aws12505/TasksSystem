FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    git \
    zip \
    unzip \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev

RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install pdo pdo_mysql gd zip
RUN pecl install redis \
    && docker-php-ext-enable redis
COPY . /var/www/html
COPY .env.example /var/www/html/.env
RUN chown -R www-data:www-data /var/www/html
RUN a2enmod rewrite

WORKDIR /var/www/html

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install
RUN php artisan key:generate
