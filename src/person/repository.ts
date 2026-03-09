import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Person } from './schema';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export async function savePerson(person: Person): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: process.env.TABLE_NAME!,
      Item: person,
      ConditionExpression: 'attribute_not_exists(personId)',
    }),
  );
}
