// import 'babel-polyfill'
import 'mocha/mocha'
import {
  expect,
} from 'chai'

import {
  MRCP,
  MRIL,
  protocol,
} from '../src/index'

describe('MRCP', () => {
  it('should not be allowed to attach two MRIL instructions to a MRCP command', () => {
    const mril = new MRIL('M00 X15 Y12 Z-2')

    expect(() => new MRCP(protocol.MRCP.QUEUE_IN, mril)).not.to.trow
    expect(() => new MRCP(protocol.MRCP.QUEUE_IN, mril)).to.trow
  })
  it('should throw for an unkown command', () => {
    const mril = new MRIL('M00 X15 Y12 Z-2')

    expect(() => new MRCP('wrongCommand', mril)).to.trow
  })
  it('should prepend the command', () => {
    const mrcp = new MRCP(protocol.MRCP.QUEUE_IN, new MRIL('XYZ'))

    expect(mrcp.getMessage().charAt(1)).to.equal(protocol.MRCP.QUEUE_IN)
  })
  it('should add the frame wrapper', () => {
    const mrcp = new MRCP(protocol.MRCP.QUEUE_IN, new MRIL('XYZ'))

    expect(mrcp.getMessage().charAt(0)).to.equal(protocol.MRCP.START_FRAME)
    expect(mrcp.getMessage().charAt(mrcp.getMessage().length - 1)).to.equal(protocol.MRCP.END_FRAME)
  })

  describe('#getBytes', () => {
    it('should return the instructions number of bytes', () => {
      const mrcp = new MRCP(protocol.MRCP.QUEUE_IN, new MRIL('XYZ'))

      expect(mrcp.getBytes()).to.equal(mrcp.getMessage().length)
    })
  })
  describe('#getMessage', () => {
    it('should return the message', () => {
      const mrcp = new MRCP(protocol.MRCP.QUEUE_IN, new MRIL('XYZ'))

      expect(mrcp.getMessage()).to.be.a('string')
    })
  })

  describe('#setSending #isSending #onSending', () => {
    it('should set isSending to true', () => {
      const mrcp = new MRCP(protocol.MRCP.QUEUE_IN, new MRIL('XYZ'))
      mrcp.setSending()

      expect(mrcp.isSending()).to.be.true
    })
    it('should call onSending callback', (done) => {
      const mrcp = new MRCP(protocol.MRCP.QUEUE_IN, new MRIL('XYZ'))

      mrcp.onSending(done)

      mrcp.setSending()
    })
  })
  describe('#setSent #isSent #onSent', () => {
    it('should set isSent to true', () => {
      const mrcp = new MRCP(protocol.MRCP.QUEUE_IN, new MRIL('XYZ'))
      mrcp.setSent()

      expect(mrcp.isSent()).to.be.true
    })
    it('should call onSent callback', (done) => {
      const mrcp = new MRCP(protocol.MRCP.QUEUE_IN, new MRIL('XYZ'))

      mrcp.onSent(done)

      mrcp.setSent()
    })
  })
})
