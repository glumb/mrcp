import Transport from './Transport'
import SerialPort from 'serialport'

export default class SerialTransport extends Transport {
  constructor(config = {}) {
    super()

    this.config = Object.assign({
      port: '',
      baudRate: 3600,
    }, config)

    this.SerialPort = new SerialPort(config.port, config)

    this.SerialPort.open((err) => {
      if (err) {
        this.emit('error', `Error opening port: ${this.config.port}`)
      }
    })
    this.SerialPort.on('data', data => this.emit('receive', data))
  }
  transmit(data, cb) {
    // SP Buffers data, if the port is not open
    this.SerialPort.write(data, 'ascii', cb)
  }

  onReceive(cb) {
    this.on('receive', cb)
  }
  onError(cb) {
    this.on('error', cb)
  }
}
