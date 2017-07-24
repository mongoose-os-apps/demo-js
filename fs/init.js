load('api_config.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js');

// Helper C function get_led_gpio_pin() in src/main.c returns built-in LED GPIO
// ffi() returns a callbale object for the specified C function.
// As parsing the signature has non-trivial overhead, it's a good practice to
// store the value for later reuse.
let get_led_gpio_pin = ffi('int get_led_gpio_pin()');
// Now call the function to obtain the LED pin number.
let led = get_led_gpio_pin();

// When C function is invoked only once, it's possible to use this shorthand.
let button = ffi('int get_button_gpio_pin()')();

print("LED GPIO: " + JSON.stringify(led) + "; button GPIO: " + JSON.stringify(button));

let getInfo = function() {
  return JSON.stringify({total_ram: Sys.total_ram(), free_ram: Sys.free_ram()});
};

// Blink built-in LED every second
GPIO.set_mode(led, GPIO.MODE_OUTPUT);
Timer.set(1000 /* 1 sec */, true /* repeat */, function() {
  let value = GPIO.toggle(led);
  print(value ? 'Tick' : 'Tock', 'uptime:', Sys.uptime(), getInfo());
}, null);

// Publish to MQTT topic on a button press. Button is wired to GPIO pin 0
GPIO.set_button_handler(button, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function() {
  let topic = '/devices/' + Cfg.get('device.id') + '/events';
  let message = getInfo();
  let ok = MQTT.pub(topic, message, 1);
  print('Published:', ok ? 'yes' : 'no', 'topic:', topic, 'message:', message);
}, null);

// Monitor network connectivity.
Net.setStatusEventHandler(function(ev, arg) {
  let evs = "???";
  if (ev === Net.STATUS_DISCONNECTED) {
    evs = "DISCONNECTED";
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = "CONNECTING";
  } else if (ev === Net.STATUS_CONNECTED) {
    evs = "CONNECTED";
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = "GOT_IP";
  }
  print("== Net event:", ev, evs);
}, null);
