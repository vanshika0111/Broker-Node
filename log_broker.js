const os = require('os');
const fs = require('fs');
const path = require('path');
const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);

// Function to get the host's IP address
function getHostIPAddress() {
    const interfaces = os.networkInterfaces();

    // Check for the Wireless LAN adapter (Wi-Fi)
    if (interfaces['Wi-Fi'] && interfaces['Wi-Fi'].length > 0) {
        for (const info of interfaces['Wi-Fi']) {
            if (info.family === 'IPv4') {
                return info.address;
            }
        }
    }

    // If no Wi-Fi interface, look for other interfaces
    for (const interfaceName in interfaces) {
        const interfaceInfo = interfaces[interfaceName];
        for (const info of interfaceInfo) {
            if (info.family === 'IPv4' && !info.internal) {
                return info.address;
            }
        }
    }
    return '127.0.0.1';  // Default to localhost if the IP address is not found
}

const port = 1883;

server.listen(port, () => {
    const hostIPAddress = getHostIPAddress();
    console.log(`MQTT broker listening on ${hostIPAddress}: port ${port}`);
});

// Event listener for new client connections
aedes.on('client', (client) => {
    console.log(`Client connected: ${client.id}, IP: ${client.conn.remoteAddress}`);
});

// Event listener for client disconnections
aedes.on('clientDisconnect', (client) => {
    console.log(`Client disconnected: ${client.id}`);
});

// Event listener for CONNACK
aedes.on('connackSent', (packet, client) => {
    console.log(`CONNACK sent to client: ${client.id}, Return code: ${packet.returnCode}`);
});

// Event listener for PUBLISH
aedes.on('publish', (packet, client) => {
    if (client) {
        const topic = packet.topic;
        const payload = packet.payload.toString();
        const logMessage = `Client ${client.conn.remoteAddress} published to topic : message -> ${topic}: ${payload}\n`;
        console.log(logMessage);
        saveToLogFile(logMessage);
    }
});

// Event listener for SUBSCRIBE
aedes.on('subscribe', (subscriptions, client) => {
    console.log(`Client ${client.conn.remoteAddress} subscribed to topic:`, subscriptions.map(sub => sub.topic));
});

// Event listener for UNSUBSCRIBE
aedes.on('unsubscribe', (unsubscriptions, client) => {
    console.log(`Client ${client.conn.remoteAddress} unsubscribed from topic:`, unsubscriptions);
});

// Function to save message to log file
function saveToLogFile(message) {
    const logFilePath = path.join(__dirname, 'mqtt_log.txt');
    fs.appendFile(logFilePath, message, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
}
