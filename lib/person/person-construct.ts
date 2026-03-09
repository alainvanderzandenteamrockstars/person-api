import { Construct } from 'constructs';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as events from 'aws-cdk-lib/aws-events';
import * as path from 'path';

interface PersonConstructProps {
  stageName: string;
  eventBus: events.EventBus;
  api: apigateway.RestApi;
}

export class PersonConstruct extends Construct {
  constructor(scope: Construct, id: string, props: PersonConstructProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, 'PersonTable', {
      tableName: `person-table-${props.stageName}`,
      partitionKey: { name: 'personId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: props.stageName === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    const createPersonFn = new lambdaNodejs.NodejsFunction(this, 'CreatePersonFunction', {
      functionName: `create-person-${props.stageName}`,
      entry: path.join(__dirname, '../../src/person/handler.ts'),
      handler: 'CreatePersonHandler',
      runtime: lambda.Runtime.NODEJS_24_X,
      timeout: Duration.seconds(10),
      memorySize: 256,
      environment: {
        TABLE_NAME: table.tableName,
        EVENT_BUS_NAME: props.eventBus.eventBusName,
        NODE_OPTIONS: '--enable-source-maps',
      },
      bundling: {
        externalModules: [],
        minify: true,
        sourceMap: true,
        sourceMapMode: lambdaNodejs.SourceMapMode.INLINE,
      },
    });

    table.grantWriteData(createPersonFn);
    props.eventBus.grantPutEventsTo(createPersonFn);

    const personResource = props.api.root.addResource('person');
    personResource.addMethod('POST', new apigateway.LambdaIntegration(createPersonFn));
  }
}
