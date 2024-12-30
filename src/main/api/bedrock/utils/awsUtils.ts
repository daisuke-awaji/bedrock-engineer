import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts'
import type { AWSCredentials } from '../types'

export async function getAccountId(credentials: AWSCredentials) {
  try {
    const { region, accessKeyId, secretAccessKey } = credentials
    const sts = new STSClient({
      credentials: {
        accessKeyId,
        secretAccessKey
      },
      region
    })
    const command = new GetCallerIdentityCommand({})
    const res = await sts.send(command)
    return res.Account
  } catch (error) {
    console.error('Error getting AWS account ID:', error)
    return null
  }
}
