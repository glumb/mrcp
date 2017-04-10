import debug from 'debug'
import protocol from '../src/protocolDefinitions'
import EventEmitter from 'events'


const numberOfMessages = 0

export default class MRCP extends EventEmitter {
  constructor(command, mril) {
    if (command !== protocol.MRCP.QUEUE_IN && command !== protocol.MRCP.EXECUTE && command !== protocol.MRCP.WRITE) {
      throw `unknown command: ${command}`
    }
    if (mril.mrcp) {
      throw `MRIL: ${mril.getInstruction()} was already linked to a MRCP. make a copy of the MRIL to reuse it.`
    }
    super()
    // prevent double use of same MRIL to ensure proper state (sent, executed) of MRIL.
    mril.mrcp = this

    this.command = command
    this.mril = mril

    this.mrcp = protocol.MRCP.START_FRAME + this.command + this.mril.getInstruction() + protocol.MRCP.END_FRAME

    this.state = {
      sending: false,
      sent: false,
    }
  }

  getCommand() {
    return this.command
  }

  getMessage() {
    return this.mrcp
  }

  getBytes() {
    return this.mrcp.length
  }

  getMRIL() {
    return this.mril
  }

  setSending() {
    this.state.sending = true
    this.emit('sending')
  }

  isSending() {
    return this.state.sending
  }

  onSending(cb) {
    this.on('sending', cb)
  }

  setSent() {
    this.state.sent = true
    this.emit('sent')
  }

  isSent() {
    return this.state.sent
  }

  onSent(cb) {
    this.on('sent', cb)
  }
}
