import { randomUUID } from 'crypto';
import { CreatePersonInput, Person } from './schema';
import { savePerson } from './repository';
import { publishPersonCreatedEvent } from './events';

export async function createPerson(input: CreatePersonInput): Promise<Person> {
  const person: Person = {
    personId: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  await savePerson(person);
  await publishPersonCreatedEvent(person);

  return person;
}
