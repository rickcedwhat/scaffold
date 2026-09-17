import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

export type MessageIds = 'noArbitraryStyling';

export interface RuleOptions {
  modules?: string[];
  disallowedProps?: string[];
}

export const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/rickcedwhat/scaffold/blob/main/packages/eslint-plugin/src/rules/${name}.ts`
);

export const noArbitraryStyling = createRule<[RuleOptions?], MessageIds>({
  name: 'no-arbitrary-styling',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce the Component Guardrail Principle: forbid className and style on @scaffold/ui components.',
    },
    messages: {
      noArbitraryStyling:
        "Component Guardrail Principle violation: '@scaffold/ui' component <{{ component }}> cannot receive arbitrary '{{ prop }}'. Styling is strictly encapsulated. See philosophy.md § 1. Use semantic props (variant, intent, size) or design tokens instead.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          modules: {
            type: 'array',
            items: { type: 'string' },
          },
          disallowedProps: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      modules: ['@scaffold/ui'],
      disallowedProps: ['className', 'style'],
    },
  ],
  create(context, [options = {}]) {
    const targetModules = new Set(options.modules ?? ['@scaffold/ui']);
    const disallowedProps = new Set(options.disallowedProps ?? ['className', 'style']);

    const scaffoldUiComponents = new Set<string>();
    const scaffoldUiNamespaces = new Set<string>();

    return {
      ImportDeclaration(node) {
        if (targetModules.has(node.source.value)) {
          for (const specifier of node.specifiers) {
            if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
              scaffoldUiComponents.add(specifier.local.name);
            } else if (
              specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier ||
              specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier
            ) {
              scaffoldUiNamespaces.add(specifier.local.name);
            }
          }
        }
      },

      JSXOpeningElement(node) {
        let isScaffold = false;
        let componentName = '';

        if (node.name.type === AST_NODE_TYPES.JSXIdentifier) {
          if (scaffoldUiComponents.has(node.name.name)) {
            isScaffold = true;
            componentName = node.name.name;
          }
        } else if (node.name.type === AST_NODE_TYPES.JSXMemberExpression) {
          if (
            node.name.object.type === AST_NODE_TYPES.JSXIdentifier &&
            scaffoldUiNamespaces.has(node.name.object.name)
          ) {
            isScaffold = true;
            componentName = `${node.name.object.name}.${node.name.property.name}`;
          }
        }

        if (!isScaffold) return;

        for (const attribute of node.attributes) {
          if (
            attribute.type === AST_NODE_TYPES.JSXAttribute &&
            attribute.name.type === AST_NODE_TYPES.JSXIdentifier
          ) {
            const propName = attribute.name.name;
            if (disallowedProps.has(propName)) {
              context.report({
                node: attribute,
                messageId: 'noArbitraryStyling',
                data: {
                  component: componentName,
                  prop: propName,
                },
              });
            }
          }
        }
      },
    };
  },
});
