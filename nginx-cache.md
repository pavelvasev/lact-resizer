# Nginx caching reverse proxy configuration

1. **/etc/nginx/conf.d/lact-resizer.conf**
```
# https://www.nginx.com/blog/nginx-caching-guide/
# https://serverfault.com/a/641572 (about inactive vs proxy_cache_valid)
proxy_cache_path /var/lact-resizer-cache levels=1:2 keys_zone=lact-resizer-cache:50m max_size=10g inactive=12h use_temp_path=off;
```
- this is nginx cache configuration

2. **/etc/nginx/snippets/location-lact-resizer.conf**
```
location /resizer/ {
     rewrite ^/resizer/(.*) /$1  break;
     proxy_pass http://127.0.0.1:3100;
     # better use 127.0.0.1 than localhost because it may mathch to ipv6 ::1 
     # where lact-resizer might not be bound

     proxy_http_version 1.1;

     proxy_cache lact-resizer-cache;
     proxy_cache_valid 200 1000h;
     add_header X-Cache-Status $upstream_cache_status;

     expires max;
   }
```
- this is location configuration that will map /resizer/ path to our resizer instance (running on port 3100, please change if required)

3. Add to some nginx server configuration:
```
  ...
  include snippets/location-lact-resizer.conf*;
  ...
```
- this will add location to desired server configuration

## Done

2020 Pavel Vasev
