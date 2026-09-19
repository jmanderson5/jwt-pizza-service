#!/bin/bash

# Populate JWT Pizza with the default development data from the course instructions.
# Usage:
#   ./generatePizzaData.sh
# or:
#   ./generatePizzaData.sh http://localhost:3000
# or:
#   ./generatePizzaData.sh https://pizza-service.yourdomainname.click

set -e

host="${1:-http://localhost:3000}"

echo "Target host: $host"

# Make sure jq is installed.
if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required but is not installed."
  echo "On macOS with Homebrew, run: brew install jq"
  exit 1
fi

echo "Logging in as the default admin..."

response=$(curl -s -X PUT "$host/api/auth" \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@jwt.com","password":"admin"}')

token=$(echo "$response" | jq -r '.token')

if [ -z "$token" ] || [ "$token" = "null" ]; then
  echo "Error: Could not get an authentication token."
  echo "Server response:"
  echo "$response"
  exit 1
fi

echo "Admin login successful."

echo "Adding users..."

curl -s -X POST "$host/api/auth" \
  -H 'Content-Type: application/json' \
  -d '{"name":"pizza diner","email":"d@jwt.com","password":"diner"}'
echo

curl -s -X POST "$host/api/auth" \
  -H 'Content-Type: application/json' \
  -d '{"name":"pizza franchisee","email":"f@jwt.com","password":"franchisee"}'
echo

echo "Adding menu items..."

curl -s -X PUT "$host/api/order/menu" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $token" \
  -d '{"title":"Veggie","description":"A garden of delight","image":"pizza1.png","price":0.0038}'
echo

curl -s -X PUT "$host/api/order/menu" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $token" \
  -d '{"title":"Pepperoni","description":"Spicy treat","image":"pizza2.png","price":0.0042}'
echo

curl -s -X PUT "$host/api/order/menu" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $token" \
  -d '{"title":"Margarita","description":"Essential classic","image":"pizza3.png","price":0.0042}'
echo

curl -s -X PUT "$host/api/order/menu" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $token" \
  -d '{"title":"Crusty","description":"A dry mouthed favorite","image":"pizza4.png","price":0.0028}'
echo

curl -s -X PUT "$host/api/order/menu" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $token" \
  -d '{"title":"Charred Leopard","description":"For those with a darker side","image":"pizza5.png","price":0.0099}'
echo

echo "Adding franchise..."

curl -s -X POST "$host/api/franchise" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $token" \
  -d '{"name":"pizzaPocket","admins":[{"email":"f@jwt.com"}]}'
echo

echo "Adding store..."

curl -s -X POST "$host/api/franchise/1/store" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $token" \
  -d '{"franchiseId":1,"name":"SLC"}'
echo

echo
echo "Database data generated."
echo
echo "Menu descriptions:"
curl -s "$host/api/order/menu" | jq '.[].description'
