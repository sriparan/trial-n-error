import random
import boto3
import json
import sys

if __name__ == "__main__":
    if len(sys.argv) == 1:
        print("insert")

        c = boto3.resource('s3')
        bucketName = "resourcesstack-testbuckete6e05abe-1nd3v5lrd2qlk"
        bucket = c.Bucket(bucketName)
        random.seed(None)
        count = 10
        for i in range(0, count):
            num = random.randint(1, 100000000000)
            fn = f'{num}-FileWithSuffix'
            print(f'{i} --- {fn}')
            bucket.put_object(Body=fn.encode("utf-8"),
                              ContentEncoding="utf-8", Key=fn)
    else:
        sqsC = boto3.client('sqs')
        i = 0
        continueThis = True
        while continueThis:
            resp = sqsC.receive_message(QueueUrl="https://sqs.us-east-1.amazonaws.com/970914773934/ResourcesStack-ResourcesQueueED76B473-7svKhpzaSHg1",
                                        MaxNumberOfMessages=1)
            if 'Messages' in resp:
                handle = resp["Messages"][0]["ReceiptHandle"]
                z = json.loads(resp["Messages"][0]["Body"])
                print(f'{i} -- {z["Records"][0]["s3"]["object"]["key"]}')
                i = i + 1
                sqsC.delete_message(QueueUrl="https://sqs.us-east-1.amazonaws.com/970914773934/ResourcesStack-ResourcesQueueED76B473-7svKhpzaSHg1",
                                    ReceiptHandle=handle)
            else:
                continueThis = False
