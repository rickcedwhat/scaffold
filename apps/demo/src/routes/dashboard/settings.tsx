import { useState, type FormEvent } from 'react';
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
import { Check, Save, User, Mail, Building } from 'lucide-react';

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsComponent,
});

const INITIAL_VALUES = {
  name: 'Alex Developer',
  email: 'alex@example.com',
  org: 'Acme Technologies',
};

function SettingsComponent() {
  const { colors } = useTheme();

  const [name, setName] = useState(INITIAL_VALUES.name);
  const [email, setEmail] = useState(INITIAL_VALUES.email);
  const [org, setOrg] = useState(INITIAL_VALUES.org);
  const [role, setRole] = useState('admin');
  const [timezone, setTimezone] = useState('utc');
  const [saved, setSaved] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateEmail = (val: string) => {
    if (!val.trim()) return 'Email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return "Please enter a valid email address (e.g. name@example.com).";
    return '';
  };

  const validateName = (val: string) => {
    if (!val.trim()) return 'Full name is required.';
    return '';
  };

  const validateOrg = (val: string) => {
    if (!val.trim()) return 'Organization name is required.';
    return '';
  };

  const nameError = touched.name ? validateName(name) : '';
  const emailError = touched.email ? validateEmail(email) : '';
  const orgError = touched.org ? validateOrg(org) : '';

  const handleBlur = (field: string) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, org: true });

    const currentNameError = validateName(name);
    const currentEmailError = validateEmail(email);
    const currentOrgError = validateOrg(org);

    if (currentNameError || currentEmailError || currentOrgError) {
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Stack direction="column" gap={6}>
      {/* Title */}
      <Stack direction="column" gap={1}>
        <Heading level={2} size="xl">
          Workspace Settings
        </Heading>
        <Text size="sm" color="secondary">
          Manage your account profile, workspace defaults, and notifications.
        </Text>
      </Stack>

      <form onSubmit={handleSubmit} noValidate>
        <Stack direction="column" gap={6}>
          {/* Profile Section */}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleBlur('name')}
                error={Boolean(nameError)}
                isDirty={name !== INITIAL_VALUES.name}
                prefixSlot={
                  <User
                    size={16}
                    color={nameError ? colors.intent.danger.main : colors.text.secondary}
                  />
                }
                helperText={nameError || undefined}
                fullWidth
              />

              <TextInput
                label="Email Address"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleBlur('email')}
                error={Boolean(emailError)}
                isDirty={email !== INITIAL_VALUES.email}
                prefixSlot={
                  <Mail
                    size={16}
                    color={emailError ? colors.intent.danger.main : colors.text.secondary}
                  />
                }
                helperText={
                  emailError || 'Gravatar will automatically sync your profile image.'
                }
                fullWidth
              />

              <TextInput
                label="Organization"
                placeholder="Enter organization"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                onBlur={handleBlur('org')}
                error={Boolean(orgError)}
                isDirty={org !== INITIAL_VALUES.org}
                prefixSlot={
                  <Building
                    size={16}
                    color={orgError ? colors.intent.danger.main : colors.text.secondary}
                  />
                }
                helperText={orgError || undefined}
                fullWidth
              />
            </Stack>
          </Card>

          {/* Preferences Section */}
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
                onChange={(e) => setRole(e.target.value)}
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
                onChange={(e) => setTimezone(e.target.value)}
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

          {/* Save Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button variant="solid" intent="primary" size="md" type="submit">
              <Stack direction="row" gap={2} align="center">
                {saved ? <Check size={16} /> : <Save size={16} />}
                <span>{saved ? 'Changes Saved!' : 'Save Preferences'}</span>
              </Stack>
            </Button>

            {saved && (
              <Badge intent="success" size="sm">
                Saved successfully
              </Badge>
            )}
          </div>
        </Stack>
      </form>
    </Stack>
  );
}
