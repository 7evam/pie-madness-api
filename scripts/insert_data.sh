#!/bin/bash

aws dynamodb batch-write-item \
  --request-items file://../data/data-1.json \
  --endpoint \
    http://localhost:8000 \

aws dynamodb batch-write-item \
  --request-items file://../data/data-2.json \
  --endpoint \
    http://localhost:8000 \

aws dynamodb batch-write-item \
  --request-items file://../data/data-3.json \
  --endpoint \
    http://localhost:8000 \

# aws dynamodb batch-write-item \
#   --request-items file://../data/data-4.json \
#   --endpoint \
#     http://localhost:8000 \

# aws dynamodb batch-write-item \
#   --request-items file://../data/data-5.json \
#   --endpoint \
#     http://localhost:8000 \