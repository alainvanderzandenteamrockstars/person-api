import * as cdk from 'aws-cdk-lib/core';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { PersonApiStack } from '../lib/person-api-stack';

function buildTemplate(stageName = 'test') {
  const app = new cdk.App();
  const stack = new PersonApiStack(app, 'TestStack', { stageName });
  return Template.fromStack(stack);
}

describe('PersonApiStack', () => {
  let template: Template;

  beforeAll(() => {
    template = buildTemplate();
  });

  it('creates a DynamoDB table with personId as the partition key', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'person-table-test',
      KeySchema: [{ AttributeName: 'personId', KeyType: 'HASH' }],
      BillingMode: 'PAY_PER_REQUEST',
    });
  });

  it('passes TABLE_NAME and EVENT_BUS_NAME to the Lambda as environment variables', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: Match.objectLike({
          TABLE_NAME: Match.anyValue(),
          EVENT_BUS_NAME: Match.anyValue(),
        }),
      },
    });
  });

  it('does not grant the Lambda read access to DynamoDB', () => {
    const policies = template.findResources('AWS::IAM::Policy');
    const statements = Object.values(policies).flatMap(
      (p) => p.Properties.PolicyDocument.Statement,
    );

    const hasGetItem = statements.some((s: { Action: string | string[] }) =>
      Array.isArray(s.Action)
        ? s.Action.includes('dynamodb:GetItem')
        : s.Action === 'dynamodb:GetItem',
    );

    expect(hasGetItem).toBe(false);
  });

  it('grants the Lambda only PutEvents permission on EventBridge', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 'events:PutEvents',
            Effect: 'Allow',
          }),
        ]),
      },
    });
  });
});
