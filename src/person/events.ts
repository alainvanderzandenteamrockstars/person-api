import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { Person } from './schema';

const eventBridgeClient = new EventBridgeClient({});

export async function publishPersonCreatedEvent(person: Person): Promise<void> {
  await eventBridgeClient.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: process.env.EVENT_BUS_NAME!,
          Source: 'person-service',
          DetailType: 'PersonCreated',
          Detail: JSON.stringify(person),
        },
      ],
    }),
  );
}
