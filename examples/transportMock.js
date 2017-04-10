import debug from 'debug'
import remoteRobotMock from './remoteRobotMock'
import Transport from '../src/Transport'
const log = debug('TransportMock')

const r = new remoteRobotMock()

export default class TransportMock extends Transport {
  constructor() {
    super()

    r.receive(data => this.emit('receive', data))
  }

  transmit(data, done) {
    setTimeout(() => {
      log(`sending data: ${data}`)

      setTimeout(() => r.transmit(data), 0)

      if (done) {
        done()
      }
    }, 1000)
  }

  onReceive(cb) {
    this.on('receive', cb)
  }

  onError(cb) {
    this.on('error', cb)
  }
}
