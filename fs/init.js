load('api_config.js');
load('api_gpio.js');
load('api_shadow.js');
load('api_timer.js');
load('api_sys.js');

let led = Cfg.get('board.led1.pin');           // Built-in LED GPIO number
let onhi = Cfg.get('board.led1.active_high');  // LED on when high?
let state = {on: false, uptime: 0};            // Device state
let timer = null;                              // Initialize when connected

let setLED = function(on) {
  let level = onhi ? on : !on;
  GPIO.write(led, level);
  print('LED on ->', on);
};

GPIO.set_mode(led, GPIO.MODE_OUTPUT);  // And turn on/off the LED
setLED(state.on);

// Set up Shadow handler to synchronise device state with the shadow state
Shadow.addHandler(function(event, obj) {
  if (event === 'CONNECTED') {
    print('Connected to the device shadow');
    print('  Reporting our current state..');
    Shadow.update(0, state);  // Report current state. This may generate the
                              // delta on the cloud, in which case the
                              // cloud will send UPDATE_DELTA to us

    print('  Setting up timer to periodically report metrics..');
    if (!timer) {
      timer = Timer.set(1000, Timer.REPEAT, function() {
        let update = {on: state.on, uptime: Sys.uptime()};
        print(JSON.stringify(update));
        Shadow.update(0, update);  // Set uptime in seconds in the shadow
      }, null);
    }

  } else if (event === 'UPDATE_DELTA') {
    print('GOT DELTA:', JSON.stringify(obj));
    for (let key in obj) {  // Iterate over all keys in delta
      if (key === 'on') {   // We know about the 'on' key. Handle it!
        state.on = obj.on;  // Synchronise the state
        setLED(state.on);   // according to the delta
      } else {
        print('Dont know how to handle key', key);
      }
    }
    Shadow.update(0, state);  // Report our new state, hopefully clearing delta
  }
});
