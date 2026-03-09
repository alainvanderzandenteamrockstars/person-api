import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as events from 'aws-cdk-lib/aws-events';
import { PersonConstruct } from './person/person-construct';

interface PersonApiStackProps extends cdk.StackProps {
  stageName: string;
}

export class PersonApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PersonApiStackProps) {
    super(scope, id, props);

    const eventBus = new events.EventBus(this, 'PersonEventBus', {
      eventBusName: `person-event-bus-${props.stageName}`,
    });

    const api = new apigateway.RestApi(this, 'PersonApi', {
      restApiName: `person-api-${props.stageName}`,
      deployOptions: {
        stageName: props.stageName,
        loggingLevel: apigateway.MethodLoggingLevel.ERROR,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['POST', 'OPTIONS'],
      },
    });

    new PersonConstruct(this, 'Person', {
      stageName: props.stageName,
      eventBus,
      api,
    });

    cdk.Tags.of(this).add('Project', 'person-api');
    cdk.Tags.of(this).add('Stage', props.stageName);
    cdk.Tags.of(this).add('ManagedBy', 'cdk');
  }
}
