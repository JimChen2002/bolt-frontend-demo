#!/bin/bash
rm -r -f /usr/share/nginx/bolt
mkdir /usr/share/nginx/bolt
cp -R /root/boltdemo/bolt-frontend-demo/build/. /usr/share/nginx/bolt/ 
