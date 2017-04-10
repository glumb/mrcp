import MRCL, {
  MRIB,
  MRCP,
  MRIL,
  protocol,
} from '../src/index'

import debug from 'debug'

import TransportMock from './transportMock'
import Table from 'cli-table'

const log = debug('test')

const transport = new TransportMock()

const mrcl = new MRCL(transport, {
  autoTransmit: true,
})

const table = new Table({
  head: ['MRIL', 'sending', 'queue size', 'executing', 'executed'],
  colWidths: [70, 15, 15, 15, 15],
})

const MRCLTable = new Table({
  head: ['queue size', 'sent commands', 'freeReceiveBuffer'],
  colWidths: [15, 15, 15],
})

function displayMRCLTable() {
  MRCLTable.splice(0, MRCLTable.length)

  MRCLTable.push([mrcl.getCommandsQueue().length, mrcl.getSentCommands().length, mrcl.getFreeReceiveBuffer()])

  console.log(MRCLTable.toString())
}

function displayCommandTable() {
  console.log('\x1Bc')

  displayMRCLTable()
  table.splice(0, table.length)

  mrcl.getCommands().forEach((c) => {
    table.push([c.getMRIL().getInstruction(), (c.isSending()) ? 'x' : '', (c.isSent()) ? 'x' : '', (c.getMRIL().isExecuting()) ? 'x' : '', (c.getMRIL().isExecuted()) ? 'x' : ''])
  })

  console.log(table.toString())
}

mrcl.on('command:executed', (c) => {
  displayCommandTable()
})
mrcl.on('command:executing', (c) => {
  displayCommandTable()
})
mrcl.on('command:sending', (c) => {
  displayCommandTable()
})
mrcl.on('command:sent', (c) => {
  displayCommandTable()
})

const mrib = new MRIB(mrcl)

mrib.queue()
  .moveLinear(10, 12, 14, () => console.log('lin'))
  .moveP2P(20, 29, 10, () => console.log('P2P'))
  .setVelocity(5)
  .execute().moveP2P(1, 2, 3)
  .queue()
  .pose(0, Math.PI / 2, 0, () => console.log('pose'))
  .moveLinear(1, 1, 1)

displayCommandTable()
// mrcl.queueMRIL(['Q M0 X29 Y29E', 'Q M0 X29 Y29E', 'Q M0 X29 Y29E', 'Q M0 X29 Y29E', 'Q M0 X29 Y29E'])
// mrcl.queueMRIL('Q M0 X29 Y29E', () => {
//   log('EXECUTEEDDDMUHHHHHUHUHUHUHUHUHUHLOLOLOLOLLOL')
// }).transmit()
// mrcl.sendMRIL('Q M0 X0 Y0 Z0').sendMRIL('Q M01 X01 Y01 Z01')
// log('YOLO END OF FILEEEE')

// const move = ( X, Y, Z, cb) => mrcl.halt().moveP2P(X, Y, Z).done(cb)
// mrcl.while(condition => mrcl.getIO(IO => condition(IO[0] == 1)),
//   (done) => {
//     mrcl.moveLinearRelative(-1).done(done)
//   },
// )
// mrcl.getAngles()
// mrcl.getPose()
// mrcl.halt()
