import json
import os

def lambda_handler(event, context):
    return {
    "isBase64Encoded": False,
    "statusCode": 200,
    "headers": { "headerName": "headerValue","content-type":"application/json" },
    "body":json.dumps({"myregion":os.environ['AWS_REGION'] ,"incoming_event":event})
    }

if __name__ == "__main__":
    print("Test echo")
