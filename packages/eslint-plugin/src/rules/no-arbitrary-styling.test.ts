import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noArbitraryStyling } from './no-arbitrary-styling.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

describe('no-arbitrary-styling', () => {
  ruleTester.run('no-arbitrary-styling', noArbitraryStyling, {
    valid: [
      {
        code: `
          import { Button, Input } from '@scaffold/ui';
          function App() {
            return (
              <Button variant="primary" intent="success" size="md">
                <Input placeholder="Type here..." />
              </Button>
            );
          }
        `,
      },
      {
        code: `
          // Native HTML elements are allowed to use className and style
          function NativeElements() {
            return <div className="layout-container" style={{ margin: '16px' }}><span>Content</span></div>;
          }
        `,
      },
      {
        code: `
          // Third-party components are not affected
          import { Check } from 'lucide-react';
          function ThirdParty() {
            return <Check className="icon-class" style={{ strokeWidth: 2 }} />;
          }
        `,
      },
      {
        code: `
          // Other packages are not affected
          import { Button } from 'other-ui-library';
          function OtherLibrary() {
            return <Button className="override-style" style={{ padding: 0 }} />;
          }
        `,
      },
    ],
    invalid: [
      {
        code: `
          import { Button } from '@scaffold/ui';
          function App() {
            return <Button className="custom-override">Click me</Button>;
          }
        `,
        errors: [
          {
            messageId: 'noArbitraryStyling',
            data: {
              component: 'Button',
              prop: 'className',
            },
          },
        ],
      },
      {
        code: `
          import { Input } from '@scaffold/ui';
          function App() {
            return <Input style={{ border: '1px solid red' }} />;
          }
        `,
        errors: [
          {
            messageId: 'noArbitraryStyling',
            data: {
              component: 'Input',
              prop: 'style',
            },
          },
        ],
      },
      {
        code: `
          import { Button as ScaffoldButton } from '@scaffold/ui';
          function App() {
            return <ScaffoldButton className="btn-class" />;
          }
        `,
        errors: [
          {
            messageId: 'noArbitraryStyling',
            data: {
              component: 'ScaffoldButton',
              prop: 'className',
            },
          },
        ],
      },
      {
        code: `
          import * as UI from '@scaffold/ui';
          function App() {
            return <UI.Button className="btn-class" />;
          }
        `,
        errors: [
          {
            messageId: 'noArbitraryStyling',
            data: {
              component: 'UI.Button',
              prop: 'className',
            },
          },
        ],
      },
      {
        code: `
          import * as UI from '@scaffold/ui';
          function App() {
            return <UI.Select style={{ width: '100%' }} />;
          }
        `,
        errors: [
          {
            messageId: 'noArbitraryStyling',
            data: {
              component: 'UI.Select',
              prop: 'style',
            },
          },
        ],
      },
    ],
  });
});
