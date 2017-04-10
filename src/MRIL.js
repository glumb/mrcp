import debug from 'debug'
import protocol from '../src/protocolDefinitions'
import EventEmitter from 'events'

let numberOfMessages = 0

export default class MRIL extends EventEmitter {
  constructor(instruction) {
    super()

    this.instruction = instruction
    this.bytes = 0
    this.preparedMRILMessage = 0
    this.number = numberOfMessages++

    this.mrcp

    this.state = {
      executing: false,
      executed: false,
    }

    // remove whitespace and number
    this.preparedMRILMessage = instruction.split(' ').join('')
      .replace(new RegExp(`${protocol.MRIL.COMMAND_NUMBER}\\d+`, 'gi'), '')

    this.preparedMRILMessage = protocol.MRIL.COMMAND_NUMBER + this.number + this.preparedMRILMessage

    this.bytes = this.preparedMRILMessage.length
  }

  getInstruction() {
    return this.preparedMRILMessage
  }

  setExecuting() {
    this.state.executing = true
    this.emit('executing')
  }

  isExecuting() {
    return this.state.executing
  }

  onExecuting(cb) {
    this.on('executing', cb)
  }

  setExecuted() {
    this.state.executed = true
    console.log('executed')
    this.emit('executed')
  }

  isExecuted() {
    return this.state.executed
  }

  onExecuted(cb) {
    this.on('executed', cb)
  }

  getNumber() {
    return this.number
  }

  getBytes() {
    return this.bytes
  }

}
