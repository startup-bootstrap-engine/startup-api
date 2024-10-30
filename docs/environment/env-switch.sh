#!/bin/bash

case $1 in
"dev")
  echo "Generating Development environment .env files"
  cp -fr ./environment/docusaurus.config.dev.ts ./docusaurus.config.ts
  ;;

"prod")
  echo "Generating Production environment .env files"
  cp -fr ./environment/docusaurus.config.prod.ts ./docusaurus.config.ts
  ;;

*)
  echo "Invalid environment option. Please provide 'dev' or 'prod'."
  exit 1
  ;;
esac

echo "✅ Done! Environment set to $1."
