import { define } from '@remcohaszing/eslint'

export default define([
  {
    files: ['**/*.md/*'],
    rules: {
      'no-param-reassign': 'off'
    }
  }
])
