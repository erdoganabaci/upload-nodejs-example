#!/usr/bin/env bash

curl -i -X POST -H "Content-Type: multipart/form-data" \
-H "authorization: Bearer 123" \
-F "data=@../example/hello.txt" http://localhost:3000/
