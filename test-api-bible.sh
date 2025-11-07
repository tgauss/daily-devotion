#!/bin/bash
KEY="mMMFHSBz5sCZNUzx-nplN"

echo "Test 1: Using 'api-key' header"
curl -s 'https://api.scripture.api.bible/v1/bibles?limit=5' \
  -H "api-key: $KEY" 2>&1 | head -10

echo -e "\n\nTest 2: Using 'Authorization' header"
curl -s 'https://api.scripture.api.bible/v1/bibles?limit=5' \
  -H "Authorization: Bearer $KEY" 2>&1 | head -10

echo -e "\n\nTest 3: Using 'x-api-key' header"
curl -s 'https://api.scripture.api.bible/v1/bibles?limit=5' \
  -H "x-api-key: $KEY" 2>&1 | head -10

echo -e "\n\nTest 4: Using 'API-Key' header (capitalized)"
curl -s 'https://api.scripture.api.bible/v1/bibles?limit=5' \
  -H "API-Key: $KEY" 2>&1 | head -10
