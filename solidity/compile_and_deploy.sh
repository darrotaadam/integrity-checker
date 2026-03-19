#!/usr/bin/env bash

ENVFILE="../.env"

if [[ ! -f "$ENVFILE" ]]; then
    echo "Pour compiler il est nécessaire de se situer dans le répertoire solidity/";
    exit 1;
fi

node compile.js && node --env-file="$ENVFILE" deploy.js
