// import 'babel-polyfill'
import 'mocha/mocha'
import { expect } from 'chai'

import { MRIL, protocol } from '../src/index'


describe('MRIL', () => {
  describe('#getInstruction', () => {
    it('should remove all whitespace', () => {
      const instruction = 'M00 X15 Y12 Z-2'
      const mril = new MRIL(instruction)

      expect(mril.getInstruction().split(' ').length).to.equal(1)
    })
    it('should add a number to the instruction', () => {
      const instruction = 'M00 X15 Y12 Z-2'
      const mril = new MRIL(instruction)

      expect(mril.getInstruction()).to.match(new RegExp(`${protocol.MRIL.COMMAND_NUMBER}\\d+`, 'gi'))
    })
    it('should remove the number in the instruction', () => {
      const instruction = 'M00 X15 N233 Y12 Z-2'
      const mril = new MRIL(instruction)

      expect(mril.getInstruction()).to.not.contain('N233')
      expect(mril.getInstruction()).to.match(new RegExp(`${protocol.MRIL.COMMAND_NUMBER}\\d+`, 'gi'))
    })
  })

  describe('#getNumber', () => {
    it('should return increased number for successive mril instructions', () => {
      const instruction = 'M00 X15 Y12 Z-2'
      const mril1 = new MRIL(instruction)
      const mril2 = new MRIL(instruction)

      const num1 = mril1.getNumber()
      const num2 = mril2.getNumber()
      expect(num1).to.be.above(0)
      expect(num2).to.be.above(num1)
    })
  })

  describe('#getBytes', () => {
    it('should return the instructions number of bytes', () => {
      const instruction = 'M00 X15 Y12 Z-2'
      const mril = new MRIL(instruction)

      expect(mril.getBytes()).to.equal(mril.getInstruction().length)
    })
  })

  describe('#setExecuting #isExecuting #onExecuting', () => {
    it('should set isExecuting to true', () => {
      const mril = new MRIL('XYZ')
      mril.setExecuting()

      expect(mril.isExecuting()).to.be.true
    })
    it('should call onExecuting callback', (done) => {
      const mril = new MRIL('XYZ')

      mril.onExecuting(done)

      mril.setExecuting()
    })
  })
  describe('#setExecuted #isExecuted #onExecuted', () => {
    it('should set isExecuted to true', () => {
      const mril = new MRIL('XYZ')
      mril.setExecuted()

      expect(mril.isExecuted()).to.be.true
    })
    it('should call onExecuted callback', (done) => {
      const mril = new MRIL('XYZ')

      mril.onExecuted(done)

      mril.setExecuted()
    })
  })
})
