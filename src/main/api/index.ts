import express, { Request, Response } from 'express'
import cors from 'cors'
import { bedrock, CallConverseAPIProps } from './bedrock'
import { RequestHandler, NextFunction } from 'express'
import { RetrieveAndGenerateCommandInput } from '@aws-sdk/client-bedrock-agent-runtime'

interface PromiseRequestHandler {
  (req: Request, res: Response, next: NextFunction): Promise<unknown>
}

function wrap(fn: PromiseRequestHandler): RequestHandler {
  return (req, res, next) => fn(req, res, next).catch(next)
}

// アプリケーションで動作するようにdotenvを設定する
const api = express()

const allowedOrigins = ['http://localhost:5173']
api.use(
  cors({
    origin: allowedOrigins
  })
)
api.use(express.json())
api.use(express.urlencoded({ extended: true }))

api.get('/', (_req: Request, res: Response) => {
  res.send('Hello World')
})

interface CustomRequest<T> extends Request {
  body: T
}

type ConverseStreamRequest = CustomRequest<CallConverseAPIProps>

api.post(
  '/converse/stream',
  wrap(async (req: ConverseStreamRequest, res) => {
    res.setHeader('Content-Type', 'text/event-stream;charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('X-Accel-Buffering', 'no')

    try {
      const result = await bedrock.converseStream({
        modelId: req.body.modelId,
        system: req.body.system,
        messages: req.body.messages
      })

      if (!result.stream) {
        return res.end()
      }

      for await (const item of result.stream) {
        res.write(JSON.stringify(item) + '\n')
      }
    } catch (error) {
      console.log(error)
      return res.status(500).send(error)
    }

    return res.end()
  })
)

type ConverseRequest = CustomRequest<CallConverseAPIProps>

api.post(
  '/converse',
  wrap(async (req: ConverseRequest, res) => {
    res.setHeader('Content-Type', 'application/json')

    try {
      const result = await bedrock.converse({
        modelId: req.body.modelId,
        system: req.body.system,
        messages: req.body.messages
      })
      return res.json(result)
    } catch (error) {
      console.log(error)
      return res.status(500).send(error)
    }
  })
)

type RetrieveAndGenerateCommandInputRequest = CustomRequest<RetrieveAndGenerateCommandInput>

api.post(
  '/retrieveAndGenerate',
  wrap(async (req: RetrieveAndGenerateCommandInputRequest, res) => {
    res.setHeader('Content-Type', 'application/json')
    try {
      const result = await bedrock.retrieveAndGenerate(req.body)
      return res.json(result)
    } catch (error) {
      console.log(error)
      return res.status(500).send(error)
    }

    return res.status(500).send('error')
  })
)

export default api
