# Person API

A serverless REST API built for the Tikkie [assessment](docs/assessment.md). The service manages person records and is built with **Node.js**, **TypeScript**, and **AWS CDK**.

It exposes a `POST /person` endpoint that stores a new person in DynamoDB and fires a `PersonCreated` event onto an EventBridge event bus.

## Architecture

- **API Gateway** — REST API entry point
- **Lambda** — stateless handler bundled with esbuild
- **DynamoDB** — NoSQL storage for person records
- **EventBridge** — custom event bus for the `PersonCreated` event

## Prerequisites

- [Node.js](https://nodejs.org/) v24
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) v2 (`npm install -g aws-cdk`)
- AWS credentials configured locally (`aws configure` or environment variables)

## Setup

```bash
npm install
```

If this is your first time using CDK in the target AWS account/region, bootstrap it:

```bash
npx cdk bootstrap
```

## Deploy

The stack is stage-aware. Pass a `stageName` context value to deploy multiple environments independently.

```bash
# Deploy to dev (default)
npm run deploy:dev

# Deploy to production
npm run deploy:prod
```

## Useful commands

| Command | Description |
|---|---|
| `npm run test` | Run all unit and infrastructure tests |
| `npm run deploy:dev` | Deploy dev stage to AWS |
| `npm run deploy:prod` | Deploy prod stage to AWS|
| `npx cdk synth -c stageName=dev` | Synthesize the CloudFormation template |
| `npx cdk diff -c stageName=dev` | Show diff between local and deployed stack |
| `npx cdk destroy -c stageName=dev` | Tear down the stack |
