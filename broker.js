// npm install net 
// npm install aedes

const os = require('os');
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
// console.log(`Message received from client ${client.conn.remoteAddress}: ${packet.payload.toString()}`);

// Event listener for PUBLISH
aedes.on('publish', (packet, client) => {
    if (client) {
        const topic = packet.topic;
        const payload = packet.payload.toString();
        console.log(`Message received from client ${client.conn.remoteAddress} on topic ${topic}: ${payload}`);
    }
});