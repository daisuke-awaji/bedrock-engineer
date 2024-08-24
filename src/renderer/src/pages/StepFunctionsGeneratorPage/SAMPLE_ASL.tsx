export const SAMPLE_ASL_001 = {
  Comment: "A description of my state machine",
  StartAt: "Decide Action",
  States: {
    "Decide Action": {
      Type: "Choice",
      Choices: [
        {
          Variable: "$.action",
          StringEquals: "complete",
          Next: "Complete Order",
        },
        {
          Variable: "$.action",
          StringEquals: "cancel",
          Next: "Cancel Order",
        },
        {
          Variable: "$.action",
          StringEquals: "make",
          Next: "Claim Order",
        },
        {
          Variable: "$.action",
          StringEquals: "unmake",
          Next: "Claim Order",
        },
      ],
      Default: "Customer Put Order",
    },
    "Cancel Order": {
      Type: "Pass",
      Next: "DynamoDB Update Order Record",
      Result: {
        state: "Cancelled",
      },
      ResultPath: "$.result",
    },
    "DynamoDB Update Order Record": {
      Type: "Task",
      Resource: "arn:aws:states:::dynamodb:updateItem",
      Parameters: {
        TableName: "serverlesspresso-order-table",
        Key: {
          PK: {
            S: "orders",
          },
          SK: {
            "S.$": "$.orderId",
          },
        },
        UpdateExpression: "set #OS = :OS",
        ExpressionAttributeNames: {
          "#OS": "ORDERSTATE",
        },
        ExpressionAttributeValues: {
          ":OS": {
            "S.$": "$.result.state",
          },
        },
        ReturnValues: "ALL_NEW",
      },
      ResultPath: "$.result",
      Next: "Construct record (1)",
      ResultSelector: {
        "Attributes.$": "$.Attributes",
      },
    },
    "Construct record (1)": {
      Type: "Pass",
      Next: "Emit Completed || Cancelled",
      ResultPath: "$.detail",
      Parameters: {
        "orderId.$": "$.orderId",
        "userId.$": "$.result.Attributes.USERID.S",
        "ORDERSTATE.$": "$.result.Attributes.ORDERSTATE.S",
        Message: "Barrista has cancelled or completed teh order",
      },
    },
    "Emit Completed || Cancelled": {
      Type: "Task",
      Resource: "arn:aws:states:::events:putEvents",
      Parameters: {
        Entries: [
          {
            "Detail.$": "States.JsonToString($.detail)",
            "DetailType.$":
              "States.Format('OrderManager.Order{}', $.detail.ORDERSTATE)",
            EventBusName: "Serverlesspresso",
            Source: "awsserverlessda.serverlesspresso",
            "Time.$": "$$.State.EnteredTime",
          },
        ],
      },
      Next: "Resume Order Processor 1",
      ResultPath: "$.eventEmit",
    },
    "Complete Order": {
      Type: "Pass",
      Next: "DynamoDB Update Order Record",
      Result: {
        state: "Completed",
      },
      ResultPath: "$.result",
    },
    "Customer Put Order": {
      Type: "Pass",
      Next: "get menu",
    },
    "get menu": {
      Type: "Task",
      Resource: "arn:aws:states:::dynamodb:getItem",
      Parameters: {
        TableName: "serverlesspresso-config-table",
        Key: {
          PK: {
            S: "menu",
          },
        },
      },
      Next: "Sanitize order",
      ResultPath: "$.menu",
    },
    "Sanitize order": {
      Type: "Task",
      Resource: "arn:aws:states:::lambda:invoke",
      Parameters: {
        "Payload.$": "$",
        FunctionName: "serverless-workshop-SanitizeOrderLambda-kvBfvFESs6Ue",
      },
      Retry: [
        {
          ErrorEquals: [
            "Lambda.ServiceException",
            "Lambda.AWSLambdaException",
            "Lambda.SdkClientException",
          ],
          IntervalSeconds: 2,
          MaxAttempts: 6,
          BackoffRate: 2,
        },
      ],
      Next: "Is Order Valid?",
      ResultPath: "$.sanitise",
    },
    "Is Order Valid?": {
      Type: "Choice",
      Choices: [
        {
          Variable: "$.sanitise.Payload",
          BooleanEquals: false,
          Next: "not a valid order",
        },
      ],
      Default: "Update order",
    },
    "not a valid order": {
      Type: "Succeed",
    },
    "Update order": {
      Type: "Task",
      Resource: "arn:aws:states:::dynamodb:updateItem",
      Parameters: {
        TableName: "serverlesspresso-order-table",
        Key: {
          PK: {
            S: "orders",
          },
          SK: {
            "S.$": "$.orderId",
          },
        },
        UpdateExpression: "set #drinkOrder = :drinkOrder",
        ConditionExpression:
          "#userId = :userId AND attribute_exists(TaskToken)",
        ExpressionAttributeNames: {
          "#drinkOrder": "drinkOrder",
          "#userId": "USERID",
        },
        ExpressionAttributeValues: {
          ":drinkOrder": {
            "S.$": "States.JsonToString($.body)",
          },
          ":userId": {
            "S.$": "$.body.userId",
          },
        },
        ReturnValues: "ALL_NEW",
      },
      Next: "Resume Order Processor 2",
      ResultSelector: {
        "TaskToken.$": "$.Attributes.TaskToken.S",
      },
      OutputPath: "$.record",
      ResultPath: "$.record",
    },
    "Resume Order Processor 1": {
      Type: "Task",
      Parameters: {
        Output: "{}",
        "TaskToken.$": "$.result.Attributes.TaskToken.S",
      },
      Resource: "arn:aws:states:::aws-sdk:sfn:sendTaskSuccess",
      End: true,
    },
    "Resume Order Processor 2": {
      Type: "Task",
      Parameters: {
        Output: "{}",
        "TaskToken.$": "$.TaskToken",
      },
      Resource: "arn:aws:states:::aws-sdk:sfn:sendTaskSuccess",
      End: true,
    },
    "Claim Order": {
      Type: "Pass",
      Next: "Make OR Unmake?",
    },
    "Make OR Unmake?": {
      Type: "Choice",
      Choices: [
        {
          Variable: "$.action",
          StringEquals: "unmake",
          Next: "Unmake Order",
        },
        {
          Variable: "$.action",
          StringEquals: "make",
          Next: "DynamoDB Update Order",
        },
      ],
      Default: "DynamoDB Update Order",
    },
    "Unmake Order": {
      Type: "Pass",
      Parameters: {
        baristaUserId: "",
        "orderId.$": "$.orderId",
        Message:
          "The barista has pressed the 'UnMake order' button, this Invokes a Lambda function via API Gateway, which updates the order in DynamoDB and emits a new 'make order' Event.",
      },
      Next: "DynamoDB Update Order",
    },
    "DynamoDB Update Order": {
      Type: "Task",
      Resource: "arn:aws:states:::dynamodb:updateItem",
      Parameters: {
        TableName: "serverlesspresso-order-table",
        Key: {
          PK: {
            S: "orders",
          },
          SK: {
            "S.$": "$.orderId",
          },
        },
        UpdateExpression: "set #baristaUserId = :baristaUserId",
        ExpressionAttributeNames: {
          "#baristaUserId": "baristaUserId",
        },
        ExpressionAttributeValues: {
          ":baristaUserId": {
            "S.$": "$.baristaUserId",
          },
        },
        ReturnValues: "ALL_NEW",
      },
      ResultSelector: {
        "Attributes.$": "$.Attributes",
      },
      ResultPath: "$.result",
      Next: "Construct record",
    },
    "Construct record": {
      Type: "Pass",
      Next: "EventBridge Emit Making Order",
      ResultPath: "$.detail",
      Parameters: {
        "baristaUserId.$": "$.result.Attributes.baristaUserId.S",
        "orderId.$": "$.orderId",
        "userId.$": "$.result.Attributes.USERID.S",
        Message:
          "The barista has pressed the 'Make order' button, this Invokes a Lambda function via API Gateway, which updates the order in DynamoDB and emits a new 'make order' Event.",
      },
    },
    "EventBridge Emit Making Order": {
      Type: "Task",
      Resource: "arn:aws:states:::events:putEvents",
      Parameters: {
        Entries: [
          {
            "Detail.$": "States.JsonToString($.detail)",
            DetailType: "OrderManager.MakeOrder",
            EventBusName: "Serverlesspresso",
            Source: "awsserverlessda.serverlesspresso",
            "Time.$": "$$.State.EnteredTime",
          },
        ],
      },
      End: true,
    },
  },
};

export const SAMPLE_ASL_PARALLEL = {
  StartAt: "ParallelLambdas",
  States: {
    ParallelLambdas: {
      Type: "Parallel",
      Branches: [
        {
          StartAt: "InvokeLambda1",
          States: {
            InvokeLambda1: {
              Type: "Task",
              Resource: "arn:aws:states:::lambda:invoke",
              Parameters: {
                Payload: {
                  "Input.$": "$",
                },
                FunctionName: "my-lambda-function-1",
              },
              Next: "DynamoDB",
            },
            DynamoDB: {
              Type: "Task",
              Resource: "arn:aws:states:::aws-sdk:dynamodb:putItem",
              Parameters: {
                TableName: "my-table",
                Item: {
                  PK: {
                    "S.$": "$.id",
                  },
                  SK: {
                    "S.$": "$.type",
                  },
                  Data: {
                    "M.$": "$",
                  },
                },
              },
              End: true,
            },
          },
        },
        {
          StartAt: "InvokeLambda2",
          States: {
            InvokeLambda2: {
              Type: "Task",
              Resource: "arn:aws:states:::lambda:invoke",
              Parameters: {
                Payload: {
                  "Input.$": "$",
                },
                FunctionName: "my-lambda-function-2",
              },
              End: true,
            },
          },
        },
      ],
      End: true,
    },
  },
};
