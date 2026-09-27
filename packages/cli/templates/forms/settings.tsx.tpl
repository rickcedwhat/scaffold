import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Stack, Heading, Text, Card, TextInput, Button, Badge } from '@scaffold/ui';
import { createFormSchema, useAppForm, z } from '@scaffold/core/form';

export const Route = createFileRoute('/app/settings')({
  component: AppSettings,
});

const settingsSchema = createFormSchema({
  displayName: z.string().trim().min(1, 'Display name is required.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required.')
    .email('Please enter a valid email address.'),
});

type SettingsValues = z.infer<typeof settingsSchema>;

const DEFAULT_SETTINGS: SettingsValues = {
  displayName: '',
  email: '',
};

function AppSettings() {
  const [saved, setSaved] = useState(false);

  const { register, handleAppSubmit, fieldProps, isFieldDirty, commitDefaults } = useAppForm({
    schema: settingsSchema,
    defaultValues: DEFAULT_SETTINGS,
  });

  const displayName = fieldProps('displayName');
  const email = fieldProps('email');

  const onValid = (values: SettingsValues) => {
    commitDefaults(values);
    setSaved(true);
  };

  return (
    <Stack direction="column" gap={6}>
      <Stack direction="column" gap={1}>
        <Heading level={2} size="xl">
          App Settings
        </Heading>
        <Text size="sm" color="secondary">
          Configure preferences for your application.
        </Text>
      </Stack>

      <Card padding="normal" variant="surface">
        <form onSubmit={handleAppSubmit(onValid, () => setSaved(false))} noValidate>
          <Stack direction="column" gap={4}>
            <TextInput
              label="Display Name"
              {...register('displayName', { onChange: () => setSaved(false) })}
              error={displayName.hasError}
              isDirty={isFieldDirty('displayName')}
              helperText={displayName.errorMessage}
              fullWidth
            />
            <TextInput
              label="Email Address"
              type="email"
              {...register('email', { onChange: () => setSaved(false) })}
              error={email.hasError}
              isDirty={isFieldDirty('email')}
              helperText={email.errorMessage}
              fullWidth
            />
            <Stack direction="row" gap={3} align="center">
              <Button type="submit" variant="solid" intent="primary" size="md">
                Save Settings
              </Button>
              {saved && (
                <Badge intent="success" size="sm">
                  Settings saved
                </Badge>
              )}
            </Stack>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
