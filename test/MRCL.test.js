// import 'babel-polyfill'
import 'mocha/mocha'
import {
  expect,
} from 'chai'

import {
  MRCP,
  MRIL,
  MRCL,
  protocol,
} from '../src/index'

import TransportMock from './TransportMock'


let Tp

beforeEach(() => {
  Tp = new TransportMock()
})

describe('MRCL', () => {
  describe('#send', () => {
    it('should send a command to retrieve buffer size', (done) => {
      const mrcp = new MRCP(protocol.MRCP.QUEUE_IN, new MRIL('XYZ'))
      const mrcl = new MRCL(Tp)

      Tp.once('transmit', (data, sent) => {
        sent()
        expect(data).to.include(protocol.MRCP.FREE_MRIL_BUFFER)
        done()
      })
      mrcl.send(mrcp)
    })

    it('should call transmit on Transport for queue', (done) => {
      const mrcp = new MRCP(protocol.MRCP.QUEUE_IN, new MRIL('XYZ'))
      const mrcl = new MRCL(Tp)

      Tp.on('transmit', (data, sent) => {
        sent()
        if (data.indexOf('XYZ') >= 0) {
          done()
        }
      })
      mrcl.send(mrcp)
      Tp.emit('receive', `${protocol.MRCP.START_FRAME}${protocol.MRCP.FREE_MRIL_BUFFER}1000${protocol.MRCP.END_FRAME}`)
    })

    it('should call transmit on Transport when free buffer size is sufficient', () => {
      const mrcp = new MRCP(protocol.MRCP.QUEUE_IN, new MRIL('XYZ'))
      const mrcl = new MRCL(Tp)

      mrcl.send(mrcp)
      Tp.emit('receive', `${protocol.MRCP.START_FRAME}${protocol.MRCP.FREE_MRIL_BUFFER}2${protocol.MRCP.END_FRAME}`)
      expect(mrcl.getCommandsQueue()).to.contain(mrcp)
      Tp.emit('receive', `${protocol.MRCP.START_FRAME}${protocol.MRCP.FREE_MRIL_BUFFER}2${protocol.MRCP.END_FRAME}`)
      expect(mrcl.getCommandsQueue()).to.contain(mrcp)
      Tp.emit('receive', `${protocol.MRCP.START_FRAME}${protocol.MRCP.FREE_MRIL_BUFFER}20${protocol.MRCP.END_FRAME}`)
      expect(mrcl.getCommandsQueue()).to.not.contain(mrcp)
    })

    it('should call transmit on Transport for execute', (done) => {
      const mrcp = new MRCP(protocol.MRCP.EXECUTE, new MRIL('XYZ'))
      const mrcl = new MRCL(Tp)

      Tp.on('transmit', (data) => {
        if (data.indexOf('XYZ') >= 0) {
          done()
        }
      })
      mrcl.send(mrcp)
      Tp.emit('receive', `${protocol.MRCP.START_FRAME}${protocol.MRCP.FREE_MRIL_BUFFER}1000${protocol.MRCP.END_FRAME}`)
    })

    it('should add the queu mrcp command to queue', () => {
      const mrcp = new MRCP(protocol.MRCP.QUEUE_IN, new MRIL('XYZ'))
      const mrcl = new MRCL(Tp)

      mrcl.send(mrcp)

      expect(mrcl.getCommandsQueue()).to.contain(mrcp)
    })

    it('should not add the execute mrcp command to queue', () => {
      const mrcp = new MRCP(protocol.MRCP.EXECUTE, new MRIL('XYZ'))
      const mrcl = new MRCL(Tp)

      mrcl.send(mrcp)

      expect(mrcl.getCommandsQueue()).to.not.contain(mrcp)
    })
  })
})
