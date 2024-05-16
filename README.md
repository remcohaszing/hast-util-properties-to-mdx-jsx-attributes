# hast-util-properties-to-mdx-jsx-attributes

[![github actions](https://github.com/remcohaszing/hast-util-properties-to-mdx-jsx-attributes/actions/workflows/ci.yaml/badge.svg)](https://github.com/remcohaszing/hast-util-properties-to-mdx-jsx-attributes/actions/workflows/ci.yaml)
[![codecov](https://codecov.io/gh/remcohaszing/hast-util-properties-to-mdx-jsx-attributes/branch/main/graph/badge.svg)](https://codecov.io/gh/remcohaszing/hast-util-properties-to-mdx-jsx-attributes)
[![npm version](https://img.shields.io/npm/v/hast-util-properties-to-mdx-jsx-attributes)](https://www.npmjs.com/package/hast-util-properties-to-mdx-jsx-attributes)
[![npm downloads](https://img.shields.io/npm/dm/hast-util-properties-to-mdx-jsx-attributes)](https://www.npmjs.com/package/hast-util-properties-to-mdx-jsx-attributes)

Transform [hast](https://github.com/syntax-tree/hast)
[properties](https://github.com/syntax-tree/hast#properties) to a list of
[`mdxJsxAttribute`](https://github.com/syntax-tree/mdast-util-mdx-jsx#mdxjsxattribute) nodes.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [`propertiesToMdxJsxAttributes(properties, options?)`](#propertiestomdxjsxattributesproperties-options)
- [Compatibility](#compatibility)
- [License](#license)

## Installation

```sh
npm install hast-util-properties-to-mdx-jsx-attributes
```

## Usage

`propertiesToMdxJsxAttributes` takes [hast](https://github.com/syntax-tree/hast)
[properties](https://github.com/syntax-tree/hast#properties), and transform them to a list of
[`mdxJsxAttribute`](https://github.com/syntax-tree/mdast-util-mdx-jsx#mdxjsxattribute) nodes. This
is useful when creating an MDX plugin where you want to enhance a hast element with JSX specific
features, but you don’t want to transform all child nodes.

For example, this plugin prefixes all `id` attributes on hast elements with the `id` prop passed to
the MDX document.

```typescript
import { type Root } from 'hast'
import { propertiesToMdxJsxAttributes } from 'hast-util-properties-to-mdx-jsx-attributes'
import { type Plugin } from 'unified'
import { visit } from 'unist-util-visit'

const rehypeMdxPrefixId: Plugin<[], Root> = () => (ast) => {
  visit(ast, 'element', (element, index, parent) => {
    let hasId = false
    const replacement = {
      type: 'mdxJsxFlowElement',
      name: element.tagName,
      attributes: propertiesToMdxJsxAttributes(element.properties, {
        transform(name, value) {
          hasId = true

          return {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Identifier', name: 'id' },
            right: {
              type: 'MemberExpression',
              computed: false,
              optional: false,
              object: { type: 'Identifier', name: 'props' },
              property: { type: 'Literal', value }
            }
          }
        }
      }),
      children: element.children
    }

    if (hasId) {
      parent!.children[index!] = replacement
    }
  })
}

export default rehypeMdxPrefixId
```

## API

### `propertiesToMdxJsxAttributes(properties, options?)`

Transform [hast](https://github.com/syntax-tree/hast)
[properties](https://github.com/syntax-tree/hast#properties) to a list of
[`mdxJsxAttribute`](https://github.com/syntax-tree/mdast-util-mdx-jsx#mdxjsxattribute) nodes.

#### Arguments

- `properties` ([`Properties`](https://github.com/syntax-tree/hast#properties)) — The hast
  properties to transform.
- `options` (`object`) — Additional options to pass. The following options are supported:
  - `elementAttributeNameCase` (`'html' | 'react'`) — The casing to use for attribute names. This
    should match the `elementAttributeNameCase` option specified in the
    [MDX options](https://mdxjs.com/packages/mdx/#processoroptions). (Default: `'react'`)
  - `space` (`'html' | 'svg'`) — The space the hast properties are in. (Default: `'html'`)
  - `transform` (`function`) — A function to transform an attribute value. The function gets called
    with the name of the MDX JSX attribute that’s being generated, the value that would be used if
    no transform function is passed, and the value as it was in the hast properties. It should
    return an [ESTree](https://github.com/estree/estree) expression or string to represent the
    value, or `null` or `undefined` to generate an attribute with no value.

#### Returns

The hast properties as a list of
[`mdxJsxAttribute`](https://github.com/syntax-tree/mdast-util-mdx-jsx#mdxjsxattribute) nodes.

## Compatibility

This project is compatible with Node.js 16 or greater.

## License

[MIT](LICENSE.md) © [Remco Haszing](https://github.com/remcohaszing)
