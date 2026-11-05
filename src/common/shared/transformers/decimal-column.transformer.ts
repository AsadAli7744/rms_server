import { ValueTransformer } from 'typeorm';

/**
 * Maps PostgreSQL `numeric`/`decimal` string values to JS numbers for API/DTO use.
 */
export const decimalColumnTransformer: ValueTransformer = {
  to: (value: number | null | undefined) => value ?? null,
  from: (value: string | null) =>
    value === null || value === undefined ? null : Number(value),
};
