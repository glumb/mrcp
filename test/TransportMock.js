import Transport from '../src/Transport'


/**
 * A mock Transport for testing.
 * Use events: on('ttransmit') emit('receive') emit('error')
 * to simulate the transport.
 */
export default class TransportMock extends Transport {
  transmit(data, doneCb) {
    this.emit('transmit', data, doneCb)
  }
  // transmit(data, doneCb) {
  //   this.emit('transmit', data)
  //   doneCb()
  // }
  onReceive(cb) {
    this.on('receive', cb)
  }
  onError(cb) {
    this.on('error', cb)
  }
}
