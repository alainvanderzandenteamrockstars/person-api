import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreatePersonSchema } from './schema';
import { createPerson } from './service';
import { formatZodErrors } from '../shared/zod';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  let body: unknown;

  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ message: 'Invalid JSON body' }),
    };
  }

  const result = CreatePersonSchema.safeParse(body);

  if (!result.success) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        message: 'Validation failed',
        errors: formatZodErrors(result.error),
      }),
    };
  }

  try {
    const person = await createPerson(result.data);

    return {
      statusCode: 201,
      headers: JSON_HEADERS,
      body: JSON.stringify(person),
    };
  } catch (error) {
    console.error('Failed to create person:', error);

    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ message: 'An unexpected error occurred' }),
    };
  }
}
