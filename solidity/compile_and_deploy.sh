#!/usr/bin/env bash

node compile.js && node --env-file=.env deploy.js
