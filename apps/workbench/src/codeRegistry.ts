// Live source code imports via Vite's ?raw syntax
import buttonSource from '../../../packages/ui/src/components/Button/Button.tsx?raw';
import textInputSource from '../../../packages/ui/src/components/Input/Input.tsx?raw';
import dropdownSource from '../../../packages/ui/src/components/Select/Select.tsx?raw';
import textareaSource from '../../../packages/ui/src/components/Textarea/Textarea.tsx?raw';
import sidebarSource from '../../../packages/ui/src/components/Sidebar/Sidebar.tsx?raw';
import stackSource from '../../../packages/ui/src/components/Stack/Stack.tsx?raw';
import cardSource from '../../../packages/ui/src/components/Card/Card.tsx?raw';
import badgeSource from '../../../packages/ui/src/components/Badge/Badge.tsx?raw';
import avatarSource from '../../../packages/ui/src/components/Avatar/Avatar.tsx?raw';
import textSource from '../../../packages/ui/src/components/Text/Text.tsx?raw';
import tokensSource from '../../../packages/ui/src/theme/tokens.ts?raw';

export const COMPONENT_SOURCES = {
  button: buttonSource,
  textInput: textInputSource,
  dropdown: dropdownSource,
  textarea: textareaSource,
  sidebar: sidebarSource,
  stack: stackSource,
  card: cardSource,
  badge: badgeSource,
  avatar: avatarSource,
  text: textSource,
  tokens: tokensSource,
};
