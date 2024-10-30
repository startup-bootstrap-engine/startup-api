# Firebase

As of today, Firebase is the default database for the project and you basically don't need to do anything to start using it.

It's activated by the following .env variables on `startup-api`, which should be already in place.

## Learning

You can check some firebase basics [here](https://www.youtube.com/watch?v=9kRgVxULbag&pp=ygUVZmlyZWJhc2UgY3Jhc2ggY291cnNl)

## Firebase - .env

```bash
# Databases (firebase, mongoose)
DB_ADAPTER=firebase
...

# Make sure all other DB related modules are turned off. For example:
MODULE_MONGODB=false
```

Then, run `yarn module:build` to rebuild your API modules.

## Database Access

You can access and visualize the database through [this url](https://startup-engine-979a9-default-rtdb.firebaseio.com). Make sure you access was granted by one of the project maintainers.
