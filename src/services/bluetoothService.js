// Bluetooth Low Energy (BLE) Hardware Service
// Integrates Web Bluetooth API & Virtual BLE Hardware Bridge

class BluetoothHardwareManager {
  constructor() {
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.isConnected = false;
    this.listeners = new Set();
    this.deviceInfo = {
      name: 'TerraRescue BLE Panic Button',
      batteryLevel: 94,
      rssi: -58,
      lastSeen: null
    };
  }

  // Subscribe to BLE events
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event, payload) {
    this.listeners.forEach(cb => cb(event, payload));
  }

  // Check Web Bluetooth Support
  isSupported() {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  // Request Web Bluetooth Device Pairing
  async requestDevice() {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser. Use Chrome/Edge or the Virtual Simulator.');
    }

    try {
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', '00001802-0000-1000-8000-00805f9b34fb']
      });

      this.device.addEventListener('gattserverdisconnected', () => {
        this.isConnected = false;
        this.notify('DISCONNECTED', { deviceName: this.device.name });
      });

      this.server = await this.device.gatt.connect();
      this.isConnected = true;
      this.deviceInfo.name = this.device.name || 'TerraRescue Physical BLE Button';
      this.deviceInfo.lastSeen = new Date().toISOString();

      this.notify('CONNECTED', { device: this.deviceInfo });
      return { success: true, deviceName: this.deviceInfo.name };
    } catch (err) {
      console.warn('BLE Pairing cancelled or failed:', err);
      return { success: false, error: err.message };
    }
  }

  // Virtual / Hardware Trigger Event
  triggerEmergency(source = 'VIRTUAL_SIMULATOR') {
    this.deviceInfo.lastSeen = new Date().toISOString();
    this.notify('EMERGENCY_TRIGGERED', {
      source,
      timestamp: new Date().toISOString(),
      device: this.deviceInfo
    });
  }

  // Test Mode Trigger Event
  triggerTest(source = 'VIRTUAL_SIMULATOR') {
    this.deviceInfo.lastSeen = new Date().toISOString();
    this.notify('TEST_TRIGGERED', {
      source,
      timestamp: new Date().toISOString(),
      device: this.deviceInfo
    });
  }

  disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.notify('DISCONNECTED', {});
  }
}

export const bleManager = new BluetoothHardwareManager();
