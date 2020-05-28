# Example Nginx caching reverse proxy configuration

1. Configure nginx cache and it's directory

**/etc/nginx/conf.d/lact-resizer.conf**
```
# https://www.nginx.com/blog/nginx-caching-guide/
# https://serverfault.com/a/641572 (about inactive vs proxy_cache_valid)
proxy_cache_path /var/lact-resizer-cache-dir levels=1:2 keys_zone=lact-resizer-cache:50m max_size=10g inactive=12h use_temp_path=off;
```

2. Map /resizer/ url path to lact-resizer instance (running on port 3100, change if required).

**/etc/nginx/snippets/location-lact-resizer.conf**
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


3. Add location into desired nginx server configuration:
```
server {
  ...
  include snippets/location-lact-resizer.conf*;
  ...
}
```

4. Done

2020 Pavel Vasev
