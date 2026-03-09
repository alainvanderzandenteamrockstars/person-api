import { z } from 'zod';

export const AddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

export const CreatePersonSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format (e.g. +31612345678)'),
  address: AddressSchema,
});

export const PersonSchema = CreatePersonSchema.extend({
  personId: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type CreatePersonInput = z.infer<typeof CreatePersonSchema>;
export type Person = z.infer<typeof PersonSchema>;
