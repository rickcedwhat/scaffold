import { useState, useRef, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Stack,
  Heading,
  Text,
  Badge,
  Card,
  TextInput,
  Dropdown,
  Button,
  useTheme,
} from '@scaffold/ui';
import { createFormSchema, useAppForm, z } from '@scaffold/core/form';
import { Check, Save, User, Mail, Building, AlertCircle } from 'lucide-react';

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsComponent,
});

const settingsSchema = createFormSchema({
  name: z.string().min(1, 'Full name is required.'),
  email: z
    .string()
    .min(1, 'Email address is required.')
    .email('Please enter a valid email address (e.g. name@example.com).'),
  org: z.string().min(1, 'Organization name is required.'),
  role: z.enum(['admin', 'editor', 'viewer']),
  timezone: z.enum(['utc', 'est', 'cst', 'pst', 'gmt']),
});

type SettingsValues = z.infer<typeof settingsSchema>;

const INITIAL_SETTINGS: SettingsValues = {
  name: 'Alex Developer',
  email: 'alex@example.com',
  org: 'Acme Technologies',
  role: 'admin',
  timezone: 'utc',
};

function SettingsComponent() {
  const { colors } = useTheme();
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useAppForm({
    schema: settingsSchema,
    defaultValues: INITIAL_SETTINGS,
  });

  const {
    register,
    handleAppSubmit,
    fieldProps,
    isFieldDirty,
    formState: { isSubmitting },
    commitDefaults,
    watch,
    setValue,
  } = form;

  const role = watch('role');
  const timezone = watch('timezone');

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const clearSubmitError = () => {
    if (submitError) setSubmitError(false);
  };

  const onValid = (values: SettingsValues) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setSubmitError(false);
    commitDefaults(values);
    setSaved(true);
    saveTimeoutRef.current = setTimeout(() => {
      setSaved(false);
      saveTimeoutRef.current = null;
    }, 2500);
  };

  const onInvalid = () => {
    setSubmitError(true);
    setSaved(false);
  };

  const nameField = fieldProps('name');
  const emailField = fieldProps('email');
  const orgField = fieldProps('org');

  return (
    <Stack direction="column" gap={6}>
      <Stack direction="column" gap={1}>
        <Heading level={2} size="xl">
          Workspace Settings
        </Heading>
        <Text size="sm" color="secondary">
          Manage your account profile, workspace defaults, and notifications.
        </Text>
      </Stack>

      <form onSubmit={handleAppSubmit(onValid, onInvalid)} noValidate>
        <Stack direction="column" gap={6}>
          <Card padding="normal">
            <Stack direction="column" gap={4}>
              <Heading level={4} size="base">
                Profile Information
              </Heading>
              <Text size="sm" color="secondary">
                Your personal details used across project collaboration.
              </Text>

              <TextInput
                label="Full Name"
                placeholder="Enter your name"
                {...register('name', { onChange: clearSubmitError })}
                error={nameField.hasError}
                isDirty={isFieldDirty('name')}
                prefixSlot={
                  <User
                    size={16}
                    color={
                      nameField.hasError
                        ? colors.intent.danger.main
                        : colors.text.secondary
                    }
                  />
                }
                helperText={nameField.errorMessage}
                fullWidth
              />

              <TextInput
                label="Email Address"
                placeholder="Enter your email"
                type="email"
                {...register('email', { onChange: clearSubmitError })}
                error={emailField.hasError}
                isDirty={isFieldDirty('email')}
                prefixSlot={
                  <Mail
                    size={16}
                    color={
                      emailField.hasError
                        ? colors.intent.danger.main
                        : colors.text.secondary
                    }
                  />
                }
                helperText={
                  emailField.errorMessage ||
                  'Gravatar will automatically sync your profile image.'
                }
                fullWidth
              />

              <TextInput
                label="Organization"
                placeholder="Enter organization"
                {...register('org', { onChange: clearSubmitError })}
                error={orgField.hasError}
                isDirty={isFieldDirty('org')}
                prefixSlot={
                  <Building
                    size={16}
                    color={
                      orgField.hasError
                        ? colors.intent.danger.main
                        : colors.text.secondary
                    }
                  />
                }
                helperText={orgField.errorMessage}
                fullWidth
              />
            </Stack>
          </Card>

          <Card padding="normal">
            <Stack direction="column" gap={4}>
              <Heading level={4} size="base">
                Workspace Preferences
              </Heading>
              <Text size="sm" color="secondary">
                Configure default permissions and localization settings.
              </Text>

              <Dropdown
                label="Default Project Role"
                value={role}
                onChange={(e) => {
                  setValue('role', e.target.value as SettingsValues['role'], {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  clearSubmitError();
                }}
                isDirty={isFieldDirty('role')}
                options={[
                  { value: 'admin', label: 'Administrator (Full Access)' },
                  { value: 'editor', label: 'Editor (Can Edit & Deploy)' },
                  { value: 'viewer', label: 'Viewer (Read Only)' },
                ]}
                fullWidth
              />

              <Dropdown
                label="Preferred Timezone"
                value={timezone}
                onChange={(e) => {
                  setValue(
                    'timezone',
                    e.target.value as SettingsValues['timezone'],
                    { shouldDirty: true, shouldValidate: true },
                  );
                  clearSubmitError();
                }}
                isDirty={isFieldDirty('timezone')}
                options={[
                  { value: 'utc', label: 'UTC (Coordinated Universal Time)' },
                  { value: 'est', label: 'EST (Eastern Standard Time, UTC-5)' },
                  { value: 'cst', label: 'CST (Central Standard Time, UTC-6)' },
                  { value: 'pst', label: 'PST (Pacific Standard Time, UTC-8)' },
                  { value: 'gmt', label: 'GMT (London, UTC+0)' },
                ]}
                fullWidth
              />
            </Stack>
          </Card>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              variant="solid"
              intent={submitError ? 'danger' : 'primary'}
              size="md"
              type="submit"
              disabled={isSubmitting}
            >
              <Stack direction="row" gap={2} align="center">
                {saved ? (
                  <Check size={16} />
                ) : submitError ? (
                  <AlertCircle size={16} />
                ) : (
                  <Save size={16} />
                )}
                <span>
                  {saved
                    ? 'Changes Saved!'
                    : submitError
                      ? 'Fix Errors to Save'
                      : 'Save Preferences'}
                </span>
              </Stack>
            </Button>

            {saved && (
              <Badge intent="success" size="sm">
                Saved successfully
              </Badge>
            )}

            {submitError && (
              <Badge intent="danger" size="sm">
                <Stack direction="row" gap={1} align="center">
                  <AlertCircle size={14} />
                  <span>Please resolve highlighted errors</span>
                </Stack>
              </Badge>
            )}
          </div>
        </Stack>
      </form>
    </Stack>
  );
}
