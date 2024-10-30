# Dynamic Module Building

In our API we have a system where we can dynamically toggle features on and off. It's useful for scaling our API gradually, only spinning up the features that are needed for a particular stage of development.

## How it works

Take a look in our .env. We have the following variables:

```bash
# Modules
MODULE_REDIS=true
MODULE_REDIS_STREAMS=false
MODULE_REDIS_PUBSUB=false
MODULE_BULLMQ=false
MODULE_WEBSOCKET=false
MODULE_RABBITMQ=false
MODULE_MONGODB=false
```

These variables are used to toggle the modules on and off. If you set a module to `true`, the API will start up with that module. If you set it to `false`, the API will not start up with that module.

Note that after editing these variables, you must run `yarn module:build` to apply the changes. This will dynamically build the docker-compose.yml file to reflect the changes you've made, and rebuild docker containers as needed.
