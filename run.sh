#!/bin/bash

containers=(plumber1 plumber2 plumber3 plumber4) 

for item in "${containers[@]}";do
	docker stop $item
	docker rm $item
done

echo "Server down"

docker image rm deepaksuthar/plumber

containerport=4321
clientport=4331 
for item in "${containers[@]}";do
	docker run --name $item -d -p $containerport:4320 -p $clientport:4330 -e SECRET=$1 -e PRODUCTION=true  deepaksuthar/plumber
	echo container started at port $containerport
	(( containerport++ ))
	(( clientport++ ))
done

echo "Server Up"