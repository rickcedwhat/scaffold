import { z, type ZodType } from 'zod';

/**
 * Creates a typed Zod object schema for use with `useAppForm`.
 *
 * Thin wrapper that keeps form schemas discoverable under the scaffold
 * form preset surface while preserving full Zod typing.
 *
 * @example
 * ```ts
 * const profileSchema = createFormSchema({
 *   name: z.string().min(1, 'Full name is required.'),
 *   email: z.string().email('Please enter a valid email address.'),
 * });
 * ```
 */
export function createFormSchema<T extends z.ZodRawShape>(shape: T): z.ZodObject<T> {
  return z.object(shape);
}

/**
 * Infers the validated output type of a form schema.
 */
export type InferFormValues<TSchema extends ZodType> = z.infer<TSchema>;

/**
 * Infers the input (pre-parse) type of a form schema.
 */
export type InferFormInput<TSchema extends ZodType> = z.input<TSchema>;

export { z };
