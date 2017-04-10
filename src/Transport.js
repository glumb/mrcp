import EventEmitter from 'events'

export default class Transport extends EventEmitter {
  constructor() {
    super()
  }
  transmit(data, done) {

  }

  onReceive(cb) {
    this.on('receive', cb)
  }
  onError(cb) {
    this.on('error', cb)
  }
}
