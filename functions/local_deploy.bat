CALL .\set_env.bat
CALL firebase functions:config:get > .runtimeconfig.json
CALL firebase emulators:start --only functions