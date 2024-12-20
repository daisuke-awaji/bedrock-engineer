const net = require('net')

const MAXPORT = 65536
const MINPORT = 3500 // avoid wellknown port

const getRandomPort = (beginPort?: number): Promise<number> => {
  const r = Math.random() * (MAXPORT - MINPORT) + MINPORT
  let PORT = beginPort || Math.floor(r)
  return new Promise((resolve, reject) => {
    const nextPort = () => {
      const port = PORT++
      if (port <= 1) {
        return reject(new Error('Under min port number'))
      }
      if (port > 65536) {
        return reject(new Error('Over max port number'))
      }
      const server = net.createServer()
      server.on('error', () => {
        console.log('port ' + port + ' is occupied')
        nextPort()
      })
      server.listen(port, () => {
        server.once('close', () => {
          resolve(port)
        })
        server.close()
      })
    }

    nextPort()
  })
}

export default getRandomPort
