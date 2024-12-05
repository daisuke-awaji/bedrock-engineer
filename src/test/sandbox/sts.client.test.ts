import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts'
import { test } from '@jest/globals'

const getAccountId = async () => {
  const client = new STSClient()
  const command = new GetCallerIdentityCommand({})
  const res = await client.send(command)
  console.log(res)
  return res.Account
}

test.skip('getAccountId', async () => {
  const accountId = await getAccountId()
  console.log(accountId)
})
