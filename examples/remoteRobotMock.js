import protocol from '../src/protocolDefinitions'

import debug from 'debug'

const log = debug('RemoteRobotMock')

export default class RemoteRobotMock {
  constructor() {
    this.INPUT_BUFFER_SIZE = 128
    this.BUFFER_SIZE = 120
    this.MRILBuffer = []
    this.MRILBufferSize = 0
    this.cb = null
    this.inputByteBuffer = ''
    this.frameStarted = false

    this.parsing = false // to prevent race conditions on timeouts
  }

  transmit(data) {
    // console.log(data)
    for (let i = 0, len = data.length; i < len; i++) {
      const char = data[i]
      // read the incoming byte:
      const incomingByte = char.toUpperCase()

      if (!this.frameStarted || (incomingByte == protocol.MRCP.START_FRAME)) {
        log('frame started')
        this.frameStarted = true
        this.inputByteBuffer = ''
      }

      if (this.frameStarted) {
        if (incomingByte == protocol.MRCP.START_FRAME) {
          // dont save the start byte
        } else if (incomingByte == protocol.MRCP.END_FRAME) { // message complete. write to messagequeue
          // logger.time("beforeee parseCommand");
          log(`Frame end, received: ${this.inputByteBuffer}`)

          // logger.time("before parseCommand");
          if (this.inputByteBuffer.trim().length > 0) {
            this.parseCommand(this.inputByteBuffer)
          }
          this.inputByteBuffer = ''
          this.frameStarted = false
        } else if (((incomingByte.charCodeAt(0) >= 48) && (incomingByte.charCodeAt(0) <= 57)) || // numbers
          ((incomingByte.charCodeAt(0) >= 65) && (incomingByte.charCodeAt(0) <= 90)) || // letters
          ((incomingByte.charCodeAt(0) >= 43) && (incomingByte.charCodeAt(0) <= 46))) // + . , -
        {
          this.inputByteBuffer += incomingByte

          if (this.inputByteBuffer.length >= this.INPUT_BUFFER_SIZE) { // ge because we need a null for last char
            // frame too long
            log(`input buffer full! pointer: ${this.inputByteBuffer.length} size: ${this.INPUT_BUFFER_SIZE} (frame too long)`)
            this.write(`${MRCPR.E_RECEIVEBUFFER_FULL}`)
          }
        } else {
          log(`I received unknow char: ${incomingByte} [${incomingByte.charCodeAt(0)}]`)
        }
      }
    }
  }

  parseCommand(command) {
    log(`parse command: ${command}`)
    switch (command.charAt(0)) {
      case protocol.MRCP.EXECUTE:

        this.executeMRIL(command.substring(1))

        break
      case protocol.MRCP.QUEUE_IN:
        this.MRILBufferSize += command.length

        this.MRILBuffer.push(command.substring(1))

        this.consumeQueue()
        break
      case protocol.MRCP.FREE_MRIL_BUFFER:
        this.write(`${protocol.MRCP.FREE_MRIL_BUFFER}${this.BUFFER_SIZE - this.MRILBufferSize}`)
        break
      default:
        this.MRILBufferSize += command.length

        this.MRILBuffer.push(command)

        this.consumeQueue()
        break

    }
  }

  consumeQueue() {
    if (this.MRILBuffer.length == 0 || this.consuming) {
      return
    }
    this.consuming = true

    const command = this.MRILBuffer.shift()

    log(`consuming ${command}`)
    this.MRILBufferSize -= command.length
    // return Serial output

    this.executeMRIL(command, () => {
      this.consuming = false
      this.write(`${protocol.MRCP.FREE_MRIL_BUFFER}${this.BUFFER_SIZE - this.MRILBufferSize}`)
      this.consumeQueue()
    })
  }

  executeMRIL(command, cb) {
    const re = new RegExp(`${protocol.MRIL.COMMAND_NUMBER}(\\d+)`, 'i')
    const found = command.match(re)

    if (found) {
      log(`starting command number: ${found[1]}`)
      this.write(`${protocol.MRIL.COMMAND_NUMBER}0${found[1]}`)
    }

    setTimeout((() => {
      const re = new RegExp(`${protocol.MRIL.COMMAND_NUMBER}(\\d+)`, 'i')
      const found = command.match(re)

      if (found) {
        log(`finished command number: ${found[1]}`)
        this.write(`${protocol.MRIL.COMMAND_NUMBER}1${found[1]}`)
      }

      if (cb) {
        cb()
      }
    }), 2000)
  }

  receive(cb) {
    this.cb = cb
  }

  write(data) {
    this.cb(protocol.MRCP.START_FRAME + data + protocol.MRCP.END_FRAME)
  }
}
