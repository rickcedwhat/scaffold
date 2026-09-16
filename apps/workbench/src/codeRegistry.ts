// Live source code imports via Vite's ?raw syntax
// This guarantees that code displayed in the Code Inspector reflects the live source files directly.

import buttonSource from '../../../packages/ui/src/components/Button/Button.tsx?raw';
import buttonTestSource from '../../../packages/ui/src/components/Button/Button.test.tsx?raw';

import inputSource from '../../../packages/ui/src/components/Input/Input.tsx?raw';
import inputTestSource from '../../../packages/ui/src/components/Input/Input.test.tsx?raw';
import textareaSource from '../../../packages/ui/src/components/Textarea/Textarea.tsx?raw';
import textareaTestSource from '../../../packages/ui/src/components/Textarea/Textarea.test.tsx?raw';
import selectSource from '../../../packages/ui/src/components/Select/Select.tsx?raw';
import selectTestSource from '../../../packages/ui/src/components/Select/Select.test.tsx?raw';
import formFieldSource from '../../../packages/ui/src/components/FormField/FormField.tsx?raw';
import formFieldTestSource from '../../../packages/ui/src/components/FormField/FormField.test.tsx?raw';

import sidebarSource from '../../../packages/ui/src/components/Sidebar/Sidebar.tsx?raw';
import sidebarTestSource from '../../../packages/ui/src/components/Sidebar/Sidebar.test.tsx?raw';

import stackSource from '../../../packages/ui/src/components/Stack/Stack.tsx?raw';
import stackTestSource from '../../../packages/ui/src/components/Stack/Stack.test.tsx?raw';
import gridSource from '../../../packages/ui/src/components/Grid/Grid.tsx?raw';

import cardSource from '../../../packages/ui/src/components/Card/Card.tsx?raw';
import cardTestSource from '../../../packages/ui/src/components/Card/Card.test.tsx?raw';

import badgeSource from '../../../packages/ui/src/components/Badge/Badge.tsx?raw';
import badgeTestSource from '../../../packages/ui/src/components/Badge/Badge.test.tsx?raw';
import avatarSource from '../../../packages/ui/src/components/Avatar/Avatar.tsx?raw';
import avatarTestSource from '../../../packages/ui/src/components/Avatar/Avatar.test.tsx?raw';

import headingSource from '../../../packages/ui/src/components/Heading/Heading.tsx?raw';
import headingTestSource from '../../../packages/ui/src/components/Heading/Heading.test.tsx?raw';
import textSource from '../../../packages/ui/src/components/Text/Text.tsx?raw';
import textTestSource from '../../../packages/ui/src/components/Text/Text.test.tsx?raw';

import tokensSource from '../../../packages/ui/src/theme/tokens.ts?raw';
import themeContextSource from '../../../packages/ui/src/theme/ThemeContext.tsx?raw';

import type { CodeFile } from './components/CodeInspector';

export const CODE_REGISTRY: Record<string, { title: string; files: CodeFile[] }> = {
  buttons: {
    title: 'Button Component',
    files: [
      { name: 'Button.tsx', language: 'tsx', content: buttonSource },
      { name: 'Button.test.tsx', language: 'tsx', content: buttonTestSource },
    ],
  },
  forms: {
    title: 'Form Controls & FormField',
    files: [
      { name: 'FormField.tsx', language: 'tsx', content: formFieldSource },
      { name: 'FormField.test.tsx', language: 'tsx', content: formFieldTestSource },
      { name: 'Input.tsx', language: 'tsx', content: inputSource },
      { name: 'Input.test.tsx', language: 'tsx', content: inputTestSource },
      { name: 'Select.tsx', language: 'tsx', content: selectSource },
      { name: 'Select.test.tsx', language: 'tsx', content: selectTestSource },
      { name: 'Textarea.tsx', language: 'tsx', content: textareaSource },
      { name: 'Textarea.test.tsx', language: 'tsx', content: textareaTestSource },
    ],
  },
  sidebar: {
    title: 'Sidebar Navigation Suite',
    files: [
      { name: 'Sidebar.tsx', language: 'tsx', content: sidebarSource },
      { name: 'Sidebar.test.tsx', language: 'tsx', content: sidebarTestSource },
    ],
  },
  stack: {
    title: 'Stack & Grid Primitives',
    files: [
      { name: 'Stack.tsx', language: 'tsx', content: stackSource },
      { name: 'Stack.test.tsx', language: 'tsx', content: stackTestSource },
      { name: 'Grid.tsx', language: 'tsx', content: gridSource },
    ],
  },
  cards: {
    title: 'Card Primitive',
    files: [
      { name: 'Card.tsx', language: 'tsx', content: cardSource },
      { name: 'Card.test.tsx', language: 'tsx', content: cardTestSource },
    ],
  },
  badges: {
    title: 'Badge & Avatar Primitives',
    files: [
      { name: 'Badge.tsx', language: 'tsx', content: badgeSource },
      { name: 'Badge.test.tsx', language: 'tsx', content: badgeTestSource },
      { name: 'Avatar.tsx', language: 'tsx', content: avatarSource },
      { name: 'Avatar.test.tsx', language: 'tsx', content: avatarTestSource },
    ],
  },
  typography: {
    title: 'Typography Primitives',
    files: [
      { name: 'Heading.tsx', language: 'tsx', content: headingSource },
      { name: 'Heading.test.tsx', language: 'tsx', content: headingTestSource },
      { name: 'Text.tsx', language: 'tsx', content: textSource },
      { name: 'Text.test.tsx', language: 'tsx', content: textTestSource },
    ],
  },
  tokens: {
    title: 'Design Tokens & Theme System',
    files: [
      { name: 'tokens.ts', language: 'ts', content: tokensSource },
      { name: 'ThemeContext.tsx', language: 'tsx', content: themeContextSource },
    ],
  },
};
