import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './handler';
import { createPerson } from './service';
import { Person } from './schema';

jest.mock('./service');

const mockedCreatePerson = jest.mocked(createPerson);

const validInput = {
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+31612345678',
  address: {
    street: 'Teststraat 1',
    city: 'Eindhoven',
    postalCode: '1234 AB',
    country: 'Netherlands',
  },
};

const mockPerson: Person = {
  personId: 'abc-123',
  createdAt: '2026-03-09T00:00:00.000Z',
  ...validInput,
};

function buildEvent(body: unknown): APIGatewayProxyEvent {
  return {
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/person',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    resource: '/person',
  };
}

describe('POST /person handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 201 with the created person on a valid request', async () => {
    mockedCreatePerson.mockResolvedValueOnce(mockPerson);

    const response = await handler(buildEvent(validInput));

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual(mockPerson);
    expect(mockedCreatePerson).toHaveBeenCalledWith(validInput);
  });

  it('returns 400 when the body is not valid JSON', async () => {
    const response = await handler(buildEvent('not-valid-json{'));

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Invalid JSON body' });
    expect(mockedCreatePerson).not.toHaveBeenCalled();
  });

  it('returns 400 with a readable error when a required field is missing', async () => {
    const { firstName, ...rest } = validInput;
    const response = await handler(buildEvent(rest));

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.message).toBe('Validation failed');
    expect(body.errors).toContain('firstName: Required');
    expect(mockedCreatePerson).not.toHaveBeenCalled();
  });

  it('returns 400 with a usefull path when a nested field is invalid', async () => {
    const response = await handler(
      buildEvent({ ...validInput, address: { ...validInput.address, street: '' } }),
    );

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).errors).toContain('address.street: Street is required');
  });
});
