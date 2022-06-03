#!/usr/bin/bash
aws s3 cp k8s-configs/db-secrets.yaml s3://${WORKING_S3}/
aws s3 cp k8s-configs/mogodb-deployment.yaml s3://${WORKING_S3}/


aws s3 ls s3://${WORKING_S3}/