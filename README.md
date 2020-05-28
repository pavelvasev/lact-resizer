# Purpose

On the fly image resizer (nodejs webserver).

* Resizes images from local directory.
* Uses graphicsmagick in streaming mode.
* No caching - consider using some external caching frontend.

# Prepare

`npm install`

# Run

`RESIZER_PORT=3100 RESIZER_DIR=/data/my-images RESIZER_BIND=127.0.0.1 npm start`

Result: running webserver instance ready to respond to GET http requests like

* `http://127.0.0.1:3100/fit/240/240/my/image/path.jpg`

which will return a 240x240 resized version of `/data/my-images/my/image/path.jpg`.

# Request format

`http://RESIZER_BIND:RESIZER_PORT/:command/:width/:height/:path-inside-dir.jpg`

Commands available:
* **fit** -- fit image inside box.
* **crop** -- crop image to box.
* **croputl** -- crop image unless it too long in some dimension.
* (add yours in server.js)

* **path-inside-dir** may contain /-slashes.

# Variables

* **RESIZER_DIR** - directory to where get images from.
* **RESIZER_PORT** - port to bind to.
* **RESIZER_BIND** - interface to bind to.

# Caching proxy configuration

* [Nginx](nginx-cache.md)

# Regards

https://blog.bandwidth.com/weekend-coding-streaming-image-manipulations-with-node-js/
https://blog.campvanilla.com/nodejs-graphicsmagick-cropping-resizing-server-api-b410fe98e41

# Author

2020, Pavel Vasev
 
LineAct website builder
http://www.lact.ru