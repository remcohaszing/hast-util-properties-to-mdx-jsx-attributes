import assert from 'node:assert/strict'
import { test } from 'node:test'

import { propertiesToMdxJsxAttributes } from 'hast-util-properties-to-mdx-jsx-attributes'

test('skip over unwanted values', () => {
  const attributes = propertiesToMdxJsxAttributes({
    null: null,
    undefined,
    false: false,
    NaN: Number.NaN,
    disabled: ''
  })

  assert.deepEqual(attributes, [])
})

test('numeric value', () => {
  const attributes = propertiesToMdxJsxAttributes({
    width: 1080,
    height: 0
  })

  assert.deepEqual(attributes, [
    {
      type: 'mdxJsxAttribute',
      name: 'width',
      value: '1080'
    },
    {
      type: 'mdxJsxAttribute',
      name: 'height',
      value: '0'
    }
  ])
})

test('boolean true value', () => {
  const attributes = propertiesToMdxJsxAttributes({
    disabled: true
  })

  assert.deepEqual(attributes, [
    {
      type: 'mdxJsxAttribute',
      name: 'disabled'
    }
  ])
})

test('space separated html value', () => {
  const attributes = propertiesToMdxJsxAttributes({
    className: ['button', 'primary']
  })

  assert.deepEqual(attributes, [
    {
      type: 'mdxJsxAttribute',
      name: 'className',
      value: 'button primary'
    }
  ])
})

test('space separated svg value', () => {
  const attributes = propertiesToMdxJsxAttributes(
    {
      className: ['button', 'primary']
    },
    { space: 'svg' }
  )

  assert.deepEqual(attributes, [
    {
      type: 'mdxJsxAttribute',
      name: 'className',
      value: 'button primary'
    }
  ])
})

test('comma separated html value', () => {
  const attributes = propertiesToMdxJsxAttributes({
    accept: ['image/*', 'video/*']
  })

  assert.deepEqual(attributes, [
    {
      type: 'mdxJsxAttribute',
      name: 'accept',
      value: 'image/*, video/*'
    }
  ])
})

test('comma separated svg value', () => {
  const attributes = propertiesToMdxJsxAttributes(
    {
      glyphName: ['A', 'B']
    },
    { space: 'svg' }
  )

  assert.deepEqual(attributes, [
    {
      type: 'mdxJsxAttribute',
      name: 'glyphName',
      value: 'A, B'
    }
  ])
})

test('elementAttributeNameCase html', () => {
  const attributes = propertiesToMdxJsxAttributes(
    {
      xmlnsXLink: 'http://www.w3.org/1999/xlink'
    },
    { elementAttributeNameCase: 'html' }
  )

  assert.deepEqual(attributes, [
    {
      type: 'mdxJsxAttribute',
      name: 'xmlnsXLink',
      value: 'http://www.w3.org/1999/xlink'
    }
  ])
})

test('elementAttributeNameCase react', () => {
  const attributes = propertiesToMdxJsxAttributes(
    {
      xmlnsXLink: 'http://www.w3.org/1999/xlink'
    },
    { elementAttributeNameCase: 'react' }
  )

  assert.deepEqual(attributes, [
    {
      type: 'mdxJsxAttribute',
      name: 'xmlnsXlink',
      value: 'http://www.w3.org/1999/xlink'
    }
  ])
})

test('elementAttributeNameCase default', () => {
  const attributes = propertiesToMdxJsxAttributes({
    xmlnsXLink: 'http://www.w3.org/1999/xlink'
  })

  assert.deepEqual(attributes, [
    {
      type: 'mdxJsxAttribute',
      name: 'xmlnsXlink',
      value: 'http://www.w3.org/1999/xlink'
    }
  ])
})

test('style to object', () => {
  const attributes = propertiesToMdxJsxAttributes({
    style: 'color: red; background-color: #dedede; top: 0'
  })

  assert.deepEqual(attributes, [
    {
      type: 'mdxJsxAttribute',
      name: 'style',
      value: {
        type: 'mdxJsxAttributeValueExpression',
        value: '',
        data: {
          estree: {
            type: 'Program',
            sourceType: 'module',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'ObjectExpression',
                  properties: [
                    {
                      type: 'Property',
                      computed: false,
                      key: { type: 'Literal', value: 'color' },
                      kind: 'init',
                      method: false,
                      shorthand: false,
                      value: { type: 'Literal', value: 'red' }
                    },
                    {
                      type: 'Property',
                      computed: false,
                      key: { type: 'Literal', value: 'backgroundColor' },
                      kind: 'init',
                      method: false,
                      shorthand: false,
                      value: { type: 'Literal', value: '#dedede' }
                    },
                    {
                      type: 'Property',
                      computed: false,
                      key: { type: 'Literal', value: 'top' },
                      kind: 'init',
                      method: false,
                      shorthand: false,
                      value: { type: 'Literal', value: '0' }
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    }
  ])
})

test('transform to null', () => {
  const attributes = propertiesToMdxJsxAttributes(
    {
      id: 'some-id'
    },
    { transform: () => null }
  )

  assert.deepEqual(attributes, [
    {
      type: 'mdxJsxAttribute',
      name: 'id'
    }
  ])
})

test('transform to undefined', () => {
  const attributes = propertiesToMdxJsxAttributes(
    {
      id: 'some-id'
    },
    {
      transform() {
        // This function is empty for testing purposes.
      }
    }
  )

  assert.deepEqual(attributes, [
    {
      type: 'mdxJsxAttribute',
      name: 'id'
    }
  ])
})

test('transform to string', () => {
  const attributes = propertiesToMdxJsxAttributes(
    {
      id: 'some-id'
    },
    { transform: () => 'another-id' }
  )

  assert.deepEqual(attributes, [
    {
      type: 'mdxJsxAttribute',
      name: 'id',
      value: 'another-id'
    }
  ])
})

test('transform to estree expression', () => {
  const attributes = propertiesToMdxJsxAttributes(
    {
      id: 'some-id'
    },
    { transform: () => ({ type: 'Literal', value: 42 }) }
  )

  assert.deepEqual(attributes, [
    {
      type: 'mdxJsxAttribute',
      name: 'id',
      value: {
        type: 'mdxJsxAttributeValueExpression',
        value: '',
        data: {
          estree: {
            type: 'Program',
            sourceType: 'module',
            body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 42 } }]
          }
        }
      }
    }
  ])
})

test('transformer arguments', () => {
  let name: unknown
  let value: unknown
  let original: unknown

  propertiesToMdxJsxAttributes(
    {
      className: ['a', 'b']
    },
    {
      transform(...args) {
        ;[name, value, original] = args
      }
    }
  )

  assert.equal(name, 'className')
  assert.equal(value, 'a b')
  assert.deepEqual(original, ['a', 'b'])
})

test('skip prototype properties', () => {
  const attributes = propertiesToMdxJsxAttributes(Object.create({ id: 'some-id' }))

  assert.deepEqual(attributes, [])
})
