#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { PersonApiStack } from '../lib/person-api-stack';

const app = new cdk.App();

const stageName = app.node.tryGetContext('stageName') ?? 'dev';

new PersonApiStack(app, `PersonApiStack-${stageName}`, {
  stageName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
