#include <stdio.h>

#include "fw/src/mgos.h"
#include "fw/src/mgos_sys_config.h"

#if CS_PLATFORM == CS_P_ESP8266
#define LED_GPIO 2 /* On ESP-12E there is a blue LED connected to GPIO2  */
#define BUTTON_GPIO 0
#elif CS_PLATFORM == CS_P_ESP32
#define LED_GPIO 21 /* No LED on DevKitC, use random GPIO close to GND pin */
#define BUTTON_GPIO 0
/* When Ethernet is enabled, we use configuration suitable for the Olimex
 * EVB-ESP32 board. */
#define LED_GPIO_ETH 32
#define BUTTON_GPIO_ETH 34
#elif CS_PLATFORM == CS_P_CC3200
#define LED_GPIO 64    /* The red LED on LAUNCHXL */
#define BUTTON_GPIO 15 /* SW2 */
#elif(CS_PLATFORM == CS_P_STM32) && defined(BSP_NUCLEO_F746ZG)
/* Nucleo-144 F746 */
#define LED_GPIO STM32_PIN_PB7 /* Blue LED */
#elif(CS_PLATFORM == CS_P_STM32) && defined(BSP_DISCO_F746G)
/* Discovery-0 F746 */
#define LED_GPIO STM32_PIN_PI1 /* Green LED */
#else
#error Unknown platform
#endif

int get_led_gpio_pin(void) {
#if CS_PLATFORM == CS_P_ESP32 && defined(MGOS_HAVE_ETHERNET)
  return (get_cfg()->eth.enable ? LED_GPIO_ETH : LED_GPIO);
#else
  return LED_GPIO;
#endif
}

int get_button_gpio_pin(void) {
#if CS_PLATFORM == CS_P_ESP32 && defined(MGOS_HAVE_ETHERNET)
  return (get_cfg()->eth.enable ? BUTTON_GPIO_ETH : BUTTON_GPIO);
#else
  return BUTTON_GPIO;
#endif
}

enum mgos_app_init_result mgos_app_init(void) {
  return MGOS_APP_INIT_SUCCESS;
}
