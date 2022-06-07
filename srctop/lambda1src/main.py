import boto3
import json


def handler(event, context):
    print(event)
    c = boto3.resource('s3')
    for record in event["Records"]:
        bucketName = record["s3"]["bucket"]["name"]
        bucket = c.Bucket(bucketName)
        key = record["s3"]["object"]["key"]
        print("Deleting " + bucketName + "/" + key)
        response = bucket.delete_objects(
            Delete={
                'Objects': [
                    {
                        'Key': key
                    },
                ],
                'Quiet': True
            })
        print(response)
        return {
            'statusCode': 200,
            'body': json.dumps(response)
        }


print("hello")
if __name__ == "__main__":
    c = boto3.client('s3')
    resp = c.list_buckets()
    for x in resp['Buckets']:
        print(x)
        configs = c.list_bucket_inventory_configurations(Bucket=x['Name'])
        if 'InventoryConfigurationList' in configs.keys():
            print(configs)
            for ys in configs:
                print(ys)
