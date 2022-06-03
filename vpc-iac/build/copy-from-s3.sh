#!/usr/bin/bash
aws s3 cp s3://${WORKING_S3}/ . --recursive
