import { useState } from 'react';
import {
  Stack,
  Heading,
  Text,
  Card,
  Button,
  FormField,
  TextInput,
  Textarea,
  Dropdown,
  Badge,
} from '@scaffold/ui';
import { createFormSchema, useAppForm, z } from '@scaffold/core/form';

const projectSchema = createFormSchema({
  title: z.string().min(1, 'Project title is required.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.')
    .max(280, 'Keep descriptions under 280 characters.'),
  visibility: z.enum(['private', 'team', 'public']),
  ownerEmail: z
    .string()
    .min(1, 'Owner email is required.')
    .email('Enter a valid owner email.'),
});

type ProjectValues = z.infer<typeof projectSchema>;

const DEFAULTS: ProjectValues = {
  title: '',
  description: '',
  visibility: 'private',
  ownerEmail: '',
};

/**
 * Live showcase of `@scaffold/core` form presets wired to `@scaffold/ui`
 * FormField, TextInput, Textarea, and Dropdown.
 */
export function FormPresetsDemo() {
  const [submitted, setSubmitted] = useState<ProjectValues | null>(null);

  const form = useAppForm({
    schema: projectSchema,
    defaultValues: DEFAULTS,
  });

  const {
    register,
    handleAppSubmit,
    fieldError,
    fieldProps,
    isFieldDirty,
    resetToDefaults,
    errorSummary,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const visibility = watch('visibility');
  const summary = errorSummary();

  return (
    <Stack gap={6}>
      <div>
        <Heading level={3} size="lg">
          Form Presets
        </Heading>
        <Text size="sm" color="secondary">
          `useAppForm` + Zod via `@scaffold/core/form`, bound to FormField, TextInput,
          Textarea, and Dropdown with accessible error delivery.
        </Text>
      </div>

      <Card padding="normal">
        <form
          onSubmit={handleAppSubmit((values) => {
            setSubmitted(values);
          }, () => {
            setSubmitted(null);
          })}
          noValidate
        >
          <Stack gap={4}>
            <FormField
              label="Project Title"
              required
              errorMessage={fieldError('title')}
            >
              {(a11y) => (
                <TextInput
                  {...register('title')}
                  {...a11y}
                  placeholder="e.g. Launch checklist"
                  error={fieldProps('title').hasError}
                  isDirty={isFieldDirty('title')}
                  fullWidth
                />
              )}
            </FormField>

            <FormField
              label="Owner Email"
              required
              errorMessage={fieldError('ownerEmail')}
              helperText={
                fieldError('ownerEmail')
                  ? undefined
                  : 'Invites are sent to this address on create.'
              }
            >
              {(a11y) => (
                <TextInput
                  {...register('ownerEmail')}
                  {...a11y}
                  type="email"
                  placeholder="owner@example.com"
                  error={fieldProps('ownerEmail').hasError}
                  isDirty={isFieldDirty('ownerEmail')}
                  fullWidth
                />
              )}
            </FormField>

            <FormField
              label="Description"
              required
              errorMessage={fieldError('description')}
            >
              {(a11y) => (
                <Textarea
                  {...register('description')}
                  {...a11y}
                  hasError={fieldProps('description').hasError}
                  placeholder="What is this project for?"
                  rows={4}
                  fullWidth
                />
              )}
            </FormField>

            <Dropdown
              label="Visibility"
              value={visibility}
              onChange={(e) => {
                setValue(
                  'visibility',
                  e.target.value as ProjectValues['visibility'],
                  { shouldDirty: true, shouldValidate: true },
                );
              }}
              isDirty={isFieldDirty('visibility')}
              error={Boolean(fieldError('visibility'))}
              helperText={fieldError('visibility')}
              options={[
                { value: 'private', label: 'Private' },
                { value: 'team', label: 'Team' },
                { value: 'public', label: 'Public' },
              ]}
              fullWidth
            />

            {summary.length > 0 && (
              <Stack gap={1}>
                <Badge intent="danger" size="sm">
                  {summary.length} validation{' '}
                  {summary.length === 1 ? 'error' : 'errors'}
                </Badge>
                <Text size="xs" color="danger" as="div">
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {summary.map((item) => (
                      <li key={item.path}>{item.message}</li>
                    ))}
                  </ul>
                </Text>
              </Stack>
            )}

            <Stack direction="row" gap={3}>
              <Button
                type="submit"
                variant="solid"
                intent="primary"
                size="md"
                disabled={isSubmitting}
              >
                Create Project
              </Button>
              <Button
                type="button"
                variant="outline"
                intent="neutral"
                size="md"
                onClick={() => {
                  resetToDefaults();
                  setSubmitted(null);
                }}
              >
                Reset
              </Button>
            </Stack>

            {submitted && (
              <Badge intent="success" size="sm">
                Created “{submitted.title}” ({submitted.visibility})
              </Badge>
            )}
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
