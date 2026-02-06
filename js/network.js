import { CONFIG } from './config.js';

let mqttClient = null;
export function connectMQTT(onMessageCallback) {
  const clientId = "termos_" + Math.random().toString(16).substr(2, 8);
  mqttClient = new Paho.MQTT.Client(
    CONFIG.MQTT_BROKER, 
    CONFIG.MQTT_PORT, 
    CONFIG.MQTT_PATH, 
    clientId
  );

  mqttClient.onConnectionLost = (responseObject) => {
    // Reconnect logic here...
  };

  mqttClient.onMessageArrived = (message) => {
    // Pass data to main app
    onMessageCallback(message);
  };

  mqttClient.connect({
    timeout: 10, useSSL: true,
    onSuccess: () => { console.log("Connected"); },
    onFailure: () => { console.log("Failed"); }
  });
}

export function sendMessage(topic, payload) {
  if(mqttClient && mqttClient.isConnected()) {
    const msg = new Paho.MQTT.Message(JSON.stringify(payload));
    msg.destinationName = topic;
    mqttClient.send(msg);
  }
}
