import debug from 'debug'
import protocol from '../src/protocolDefinitions'
import EventEmitter from 'events'

const log = debug('MRCL')

export default class MRCL extends EventEmitter {
  /**
   * constructor - MicroPede Robot Control Library
   * used to construct and send MRIL commands to the robot controller
   * flow control and response handling are used to send and monitor the current execution state of MRIL
   *
   * @param  {Transport} Transport  a transport (Serial, TCP) class that supports send(d, cb) onData(d) methods
   * @param  {object} config = {}   configuration
   */

  constructor(Transport, config = {}) {
    const c = Object.assign({
      autoTransmit: true,
    }, config)

    super()

    this.transport = Transport
    this.transport.onReceive(this._assembleResponse.bind(this))
    this.freeReceiveBuffer = 0

    this.responseByteBuffer = ''
    this.frameStarted = false

    this.commands = []
    this.commandQueue = []
    this.sentCommands = [] // used for checking executing/ed

    this.autoTransmit = c.autoTransmit
    this.retryTransmitTimeout = 1000

    this.transmitInterval = false

    this.numberOfMessages = 0
  }

  /**
   * send - sends or queues a MRCP command based on command type (queue, execzte, write)
   *
   * @param  {MRCP} mrcp mrcp object
   */
  send(mrcp) {
    if (mrcp.getCommand() === protocol.MRCP.QUEUE_IN) {
      this.queueMRCP(mrcp)
    } else {
      this.sendMRCP(mrcp)
    }
  }

  /**
   * queueMRCP - add MRCP to send queue
   *
   * @param  {string|array} mril MRIL message
   * @return {MRCL}         MRCL
   */
  queueMRCP(mrcp) {
    if (Array.isArray(mrcp)) {
      for (const command of mrcp) {
        this.queueMRCP(command)
      }
    } else {
      this.commandQueue.push(mrcp)
      this.commands.push(mrcp)
      if (this.autoTransmit) {
        this._transmitQueue()
      }
    }

    return this
  }

  /**
   * sendMRIL - directly send MRIL
   *
   * @param  {string}   mril MRIL message
   * @return {MRCL}     MRCL
   */
  sendMRCP(mrcp) {
    this.commands.push(mrcp)
    this._transmit(mrcp)

    return this
  }

  /**
   * _transmitQueue - rate limited transmission of command queue
   *
   */
  _transmitQueue() { // todo transmit immidiately on nt queue in
    if (this.commandQueue.length > 0) {
      const mrcp = this.commandQueue.shift()
      log(`trying to transmit: ${mrcp.message}`)

      // rate limiting
      if (mrcp.getBytes() > this.freeReceiveBuffer) {
        this.commandQueue.unshift(mrcp)

        log(`receive Buffer full. command: ${mrcp.getBytes()} buffer: ${this.freeReceiveBuffer}`)
        if (!this.transmitInterval) {
          this.transmitInterval = true
          this.transport.transmit(protocol.MRCP.START_FRAME + protocol.MRCP.FREE_MRIL_BUFFER + protocol.MRCP.END_FRAME,
            () => {
              // after sent:
              setTimeout(() => {
                this._transmitQueue()
                this.transmitInterval = false
              }, this.retryTransmitTimeout)
            })
        }
      } else {
        this.freeReceiveBuffer -= mrcp.getBytes() // prediction

        this._transmit(mrcp, () => {
          this._transmitQueue()
        })
      }
    }
  }

  /**
   * _transmit - send MRCP object using Transport
   *
   * @param  {Message}  mrcp MRCP message object
   * @param  {function} cb   called when sending is complete
   */
  _transmit(mrcp, cb) {
    mrcp.setSending()
    this.emit('command:sending', mrcp)

    this.transport.transmit(mrcp.getMessage(), (err) => {
      this.sentCommands.push(mrcp)
      mrcp.setSent()
      this.emit('command:sent', mrcp)

      if (cb) {
        cb()
      }
    })
  }

  /**
   * _assembleResponse - combines response char or string into a response message
   *
   * @param  {string} resp transport response
   */
  _assembleResponse(resp) {
    const response = resp.split(' ').join('')
    log(`response: ${response}`)
    for (let i = 0, len = response.length; i < len; i++) {
      // read the incoming byte:
      const incomingByte = response[i].toUpperCase()

      if (!this.frameStarted || (incomingByte === protocol.MRCP.START_FRAME)) {
        this.frameStarted = true
        this.responseByteBuffer = ''
      }

      if (this.frameStarted) {
        if (incomingByte === protocol.MRCP.START_FRAME) {
          // dont save the start byte
        } else if (incomingByte === protocol.MRCP.END_FRAME) { // message complete. write to messagequeue
          log(`Frame end: ${this.responseByteBuffer}`)

          this._parseCommand(this.responseByteBuffer)
          this.responseByteBuffer = ''
          this.frameStarted = false
        } else if (((incomingByte.charCodeAt(0) >= 48) && (incomingByte.charCodeAt(0) <= 57)) || // numbers
          ((incomingByte.charCodeAt(0) >= 65) && (incomingByte.charCodeAt(0) <= 90)) || // letters
          ((incomingByte.charCodeAt(0) >= 43) && (incomingByte.charCodeAt(0) <= 46))) // + . , -
        {
          this.responseByteBuffer += incomingByte
          // console.log(this.responseByteBuffer)
        } else {
          log(`I received unknow char: ${incomingByte} [${incomingByte.charCodeAt(0)}]`)
        }
      }
    }
  }

  /**
   * _parseCommand - parses the assembled response
   *
   * @param  {string} command returned from robot controller
   */
  _parseCommand(command) {
    switch (command.charAt(0)) {
      case protocol.MRCP.FREE_MRIL_BUFFER:
        this.freeReceiveBuffer = +command.substring(1)
        log(`free receive buffer: ${this.freeReceiveBuffer}`)
        this.emit('free-buffer-changed', this.freeReceiveBuffer)
        this._transmitQueue()
        break
      case protocol.MRIL.COMMAND_NUMBER:
        const number = +command.substring(2)
        log(`command number: ${number}`)
        for (const mrcp of this.sentCommands) {
          const mril = mrcp.getMRIL()
          if (mril.getNumber() === number) {
            switch (+command.charAt(1)) {
              case 0:
                mril.setExecuting()
                this.emit('command:executing', mril)
                break
              case 1:
                mril.setExecuted()
                this.emit('command:executed', mril)
                break
              default:
                console.log(`unknown command: ${command}`)
            }
            break
          }
        }

        break
      default:

    }
  }

  getCommandsQueue() {
    return this.commandQueue
  }

  getSentCommands() {
    return this.sentCommands
  }

  getCommands() {
    return this.commands
  }

  getFreeReceiveBuffer() {
    return this.freeReceiveBuffer
  }

  /**
   * transmit - enqueues the command queue. Only neccesary if autoTrasmit == false
   *
   * @return {MRCL}
   */
  transmit() {
    this._transmitQueue()
    return this
  }
}
