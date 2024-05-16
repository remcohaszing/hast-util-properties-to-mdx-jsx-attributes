import { stringify as commas } from 'comma-separated-tokens'
import { type Expression } from 'estree'
import { valueToEstree } from 'estree-util-value-to-estree'
import { type Properties } from 'hast'
import { type MdxJsxAttribute } from 'mdast-util-mdx-jsx'
import { find, hastToReact, html, svg } from 'property-information'
import { stringify as spaces } from 'space-separated-tokens'
import styleToObject from 'style-to-js'

export interface PropertiesToMdxJsxAttributesOptions {
  /**
   * The casing to use for attribute names. This should match the `elementAttributeNameCase` option
   * specified in the [MDX options](https://mdxjs.com/packages/mdx/#processoroptions).
   *
   * @default 'react'
   */
  elementAttributeNameCase?: 'html' | 'react'

  /**
   * The space the hast properties are in.
   *
   * @default 'html'
   */
  space?: 'html' | 'svg'

  /**
   * A function to transform an attribute value.
   *
   * @param name
   *   The name of the MDX JSX attribute that’s being generated.
   * @param value
   *   The value that would be used if no transform function is passed.
   * @param original
   *   The value as it was in the hast properties.
   * @returns
   *   The new value to use instead of the value passed.
   */
  transform?: (
    name: string,
    value: string | null,
    original: (number | string)[] | number | string | true
  ) => Expression | string | null | undefined | void
}

/**
 * Transform [hast](https://github.com/syntax-tree/hast)
 * [properties](https://github.com/syntax-tree/hast#properties) to a list of
 * [`mdxJsxAttribute`](https://github.com/syntax-tree/mdast-util-mdx-jsx#mdxjsxattribute) nodes.
 *
 * @param properties
 *   The hast properties to transform.
 * @param options
 *   Additional options to pass.
 * @returns
 *   The hast properties as a list of `mdxJsxAttribute` nodes.
 */
export function propertiesToMdxJsxAttributes(
  properties: Properties,
  options?: PropertiesToMdxJsxAttributesOptions
): MdxJsxAttribute[] {
  const schema = options?.space === 'svg' ? svg : html
  const attributes: MdxJsxAttribute[] = []

  for (let name in properties) {
    if (!Object.hasOwn(properties, name)) {
      continue
    }

    const info = find(schema, name)
    const original = properties[name]

    name = info.property
    if (
      options?.elementAttributeNameCase !== 'html' &&
      info.space &&
      Object.hasOwn(hastToReact, name)
    ) {
      name = hastToReact[name]
    }

    if (original == null) {
      continue
    }

    if (original === false) {
      continue
    }

    if (Number.isNaN(original)) {
      continue
    }

    if (!original && info.boolean) {
      continue
    }

    let value: Expression | string | null | undefined | void = Array.isArray(original)
      ? info.commaSeparated
        ? commas(original)
        : spaces(original)
      : original === true
        ? null
        : String(original)

    if (options?.transform) {
      value = options.transform(name, value, original)
    }

    if (value == null) {
      attributes.push({
        type: 'mdxJsxAttribute',
        name
      })
    } else if (typeof value === 'object') {
      attributes.push({
        type: 'mdxJsxAttribute',
        name,
        value: {
          type: 'mdxJsxAttributeValueExpression',
          value: '',
          data: {
            estree: {
              type: 'Program',
              sourceType: 'module',
              body: [{ type: 'ExpressionStatement', expression: value }]
            }
          }
        }
      })
    } else if (name === 'style') {
      attributes.push({
        type: 'mdxJsxAttribute',
        name,
        value: {
          type: 'mdxJsxAttributeValueExpression',
          value: '',
          data: {
            estree: {
              type: 'Program',
              sourceType: 'module',
              body: [
                { type: 'ExpressionStatement', expression: valueToEstree(styleToObject(value)) }
              ]
            }
          }
        }
      })
    } else {
      attributes.push({
        type: 'mdxJsxAttribute',
        name,
        value
      })
    }
  }

  return attributes
}
