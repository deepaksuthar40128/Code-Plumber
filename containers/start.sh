echo "Building java image..."
docker build -f java.dockerfile -t java-image .
echo "Building py image..."
docker build -f py.dockerfile -t py-image .
echo "Building cpp image..."
docker build -f cpp.dockerfile -t cpp-image .


echo "Running containers..."
docker run -d --network=none --cap-drop=ALL --read-only --name cpp-container -v $(pwd)/../runEnv:/home/sandboxuser/runEnv cpp-image
docker run -d --network=none --cap-drop=ALL --read-only --name py-container -v $(pwd)/../runEnv:/home/sandboxuser/runEnv py-image
docker run -d --network=none --cap-drop=ALL --read-only --name java-container -v $(pwd)/../runEnv:/home/sandboxuser/runEnv java-image
docker run -d --network=none --cap-drop=ALL --read-only --name cpp-live-container -v $(pwd)/../runEnv:/home/sandboxuser/runEnv cpp-image
docker run -d --network=none --cap-drop=ALL --read-only --name c-container -v $(pwd)/../runEnv:/home/sandboxuser/runEnv cpp-image  