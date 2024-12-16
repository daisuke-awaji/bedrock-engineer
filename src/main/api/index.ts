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
api.use(express.json({ limit: '10mb' }))
api.use(express.urlencoded({ extended: true, limit: '10mb' }))

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
      const result = await bedrock.converseStream(req.body)

      if (!result.stream) {
        return res.end()
      }

      for await (const item of result.stream) {
        res.write(JSON.stringify(item) + '\n')
      }
    } catch (error: any) {
      console.log(error)
      console.log(error.message)
      if (error.name === 'ValidationException') {
        return res.status(400).send({
          ...error,
          message: error.message
        })
      }

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
    } catch (error: any) {
      console.log(error)
      if (error.name === 'ResourceNotFoundException') {
        return res.status(404).send({
          ...error,
          message: error.message
        })
      }
      return res.status(500).send(error)
    }
  })
)

api.get(
  '/listModels',
  wrap(async (_req: Request, res) => {
    res.setHeader('Content-Type', 'application/json')
    try {
      const result = await bedrock.listModels()
      return res.json(result)
    } catch (error) {
      console.log(error)
      return res.status(500).send(error)
    }
  })
)

export default api
