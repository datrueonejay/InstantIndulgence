./set_env.sh
firebase functions:config:get > .runtimeconfig.json
firebase emulators:start --only functions