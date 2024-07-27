#!/bin/bash

# Function to check HTTP endpoint
check_http() {
  if curl --fail http://localhost:5002 &>/dev/null; then
    echo "✅ HTTP check passed"
  else
    echo "❌ HTTP check failed"
    curl -I http://localhost:5002
    exit 1
  fi
}

# Function to check WebSocket using netcat for a basic handshake
check_websocket() {
  HOST="localhost"
  PORT=5101
  URI="/socket.io/?transport=websocket"
  KEY=$(openssl rand -base64 16)

  if nc -z -v $HOST $PORT; then
    REQUEST="GET $URI HTTP/1.1\r\n"
    REQUEST+="Host: $HOST:$PORT\r\n"
    REQUEST+="Connection: Upgrade\r\n"
    REQUEST+="Upgrade: websocket\r\n"
    REQUEST+="Sec-WebSocket-Key: $KEY\r\n"
    REQUEST+="Sec-WebSocket-Version: 13\r\n"
    REQUEST+="Origin: http://localhost:8080\r\n"
    REQUEST+="Pragma: no-cache\r\n"
    REQUEST+="Cache-Control: no-cache\r\n"
    REQUEST+="User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36\r\n"
    REQUEST+="Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits\r\n"
    REQUEST+="Accept-Language: en-US,en\r\n"
    REQUEST+="\r\n"
    RESPONSE=$(echo -en "$REQUEST" | nc -w 5 $HOST $PORT)
    if echo "$RESPONSE" | grep -q "HTTP/1.1 101"; then
      echo "✅ WebSocket check passed"
    else
      echo "❌ WebSocket check failed"
      exit 1
    fi
  else
    echo "Port $PORT is not open. WebSocket server might not be running."
    exit 1
  fi
}

check_http
check_websocket
echo "🎉 Both checks passed"
