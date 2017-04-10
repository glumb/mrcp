// import 'babel-polyfill'
import 'mocha/mocha'
import {
  expect,
} from 'chai'

import {
  MRIB,
  MRCL,
  protocol,
} from '../src/index'

import Transport from './TransportMock'

let Mrcl
let Mrib
let Tp
beforeEach(() => {
  // create a new Tp instance to remove al prior listeners
  Tp = new Transport()
  Mrcl = new MRCL(Tp)
  Mrib = new MRIB(Mrcl)
})

describe('MRIB', () => {
  describe('#wait', () => {
    it('should send a wait command', () => {
      Tp.on('transmit', (data) => {
        // skip 'receive free buffer' command
        if (data.indexOf(protocol.MRCP.FREE_MRIL_BUFFER) < 0) {
          expect(data).to.include(protocol.MRIL.WAIT)
          expect(data).to.include(123)
        }
      })

      Mrib.wait(123)
    })
  })
  describe('#moveLinear', () => {
    it('should send move command', () => {
      Tp.on('transmit', (data) => {
        // skip 'receive free buffer' command
        if (data.indexOf(protocol.MRCP.FREE_MRIL_BUFFER) < 0) {
          expect(data).to.include(`${protocol.MRIL.MOVEMENT_METHOD}01`)
          expect(data).to.include(10)
          expect(data).to.include(20)
          expect(data).to.include(30)
        }
      })

      Mrib.moveLinear(10, 20, 30)
    })
    it('should send move command including velocity', () => {
      Tp.on('transmit', (data) => {
        // skip 'receive free buffer' command
        if (data.indexOf(protocol.MRCP.FREE_MRIL_BUFFER) < 0) {
          expect(data).to.include(`${protocol.MRIL.MOVEMENT_METHOD}01`)
          expect(data).to.include(`${protocol.MRIL.VELOCITY}99`)
          expect(data).to.include(10)
          expect(data).to.include(20)
          expect(data).to.include(99)
        }
      })

      Mrib.moveLinear(10, 20, 30, 40, 50, 60, 99)
    })
    it('should execute the callback on successfull command execution', (done) => {
      let number

      Tp.on('transmit', (data, sentCb) => {
        // command was successfully sent
        sentCb()

        // grep command number
        number = data.match(new RegExp(`${protocol.MRIL.COMMAND_NUMBER}(\\d+)`, 'gi'))
        if (number) {
          number = number[0].substring(1)
        }
        // skip 'receive free buffer' command
        if (data.indexOf(protocol.MRCP.FREE_MRIL_BUFFER) !== 1) {
          Tp.emit('receive', `${protocol.MRCPR.START_FRAME + protocol.MRIL.COMMAND_NUMBER}1${number}${protocol.MRCPR.END_FRAME}`)
        }
      })

      Mrib.moveLinear(10, 20, 30, 40, 50, 60, 99, () => {
        done()
      })
    })
    it('should execute the callback on successfull command execution (only X,Y given)', (done) => {
      let number

      Tp.on('transmit', (data, sentCb) => {
        // command was successfully sent
        sentCb()

        // grep command number
        number = data.match(new RegExp(`${protocol.MRIL.COMMAND_NUMBER}(\\d+)`, 'gi'))
        if (number) {
          number = number[0].substring(1)
        }
        // skip 'receive free buffer' command
        if (data.indexOf(protocol.MRCP.FREE_MRIL_BUFFER) !== 1) {
          Tp.emit('receive', `${protocol.MRCPR.START_FRAME + protocol.MRIL.COMMAND_NUMBER}1${number}${protocol.MRCPR.END_FRAME}`)
        }
      })

      Mrib.moveLinear(10, 20, () => {
        done()
      })
    })
    it('should execute the callback on successfull queue command execution (only X,Y given)', (done) => {
      let number

      Tp.on('transmit', (data, sentCb) => {
        // command was successfully sent
        sentCb()

        // grep command number
        number = data.match(new RegExp(`${protocol.MRIL.COMMAND_NUMBER}(\\d+)`, 'gi'))
        if (number) {
          number = number[0].substring(1)
        }
        // skip 'receive free buffer' command
        if (data.indexOf(protocol.MRCP.FREE_MRIL_BUFFER) !== 1) {
          Tp.emit('receive', `${protocol.MRCPR.START_FRAME + protocol.MRIL.COMMAND_NUMBER}1${number}${protocol.MRCPR.END_FRAME}`)
        }
      })


      Mrib.queue().moveLinear(10, 20, () => {
        done()
      })

      // send free receive buffer
      Tp.emit('receive', `${protocol.MRCP.START_FRAME}${protocol.MRCP.FREE_MRIL_BUFFER}200${protocol.MRCP.END_FRAME}`)
    })
  })
  describe('#moveP2P', () => {
    it('should send P2P move command', () => {
      Tp.on('transmit', (data) => {
        // skip 'receive free buffer' command
        if (data.indexOf(protocol.MRCP.FREE_MRIL_BUFFER) < 0) {
          expect(data).to.include(`${protocol.MRIL.MOVEMENT_METHOD}00`)
          expect(data).to.include(10)
          expect(data).to.include(20)
          expect(data).to.include(30)
        }
      })

      Mrib.moveP2P(10, 20, 30)
    })
  })
})
