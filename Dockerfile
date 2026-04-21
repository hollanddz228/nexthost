# Используем официальный образ PHP 8.0 с Apache
FROM php:8.0-apache

# Устанавливаем расширения для работы с базой данных MySQL/MariaDB
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Включаем модуль rewrite (часто нужен для ЧПУ и роутинга)
RUN a2enmod rewrite

# Копируем все файлы твоего проекта внутрь контейнера
COPY . /var/www/html/

# Даем права веб-серверу на чтение и запись (важно для загрузки файлов, например, скринов тикетов)
RUN chown -R www-data:www-data /var/www/html/ \
    && chmod -R 755 /var/www/html/