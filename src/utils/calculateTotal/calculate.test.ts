import { describe, it, expect } from 'vitest'
import { calculateTotal } from './calculateTotal'

describe('calculateTotal', () => {
  it('sums comma-separated numbers', () => {
    const result = calculateTotal('1,2,3,4')
    expect(result).toBe(10)
  })

  it('sums newline-separated numbers', () => {
    const result = calculateTotal('1\n2\n3\n4')
    expect(result).toBe(10)
  })

  it('handles mixed commas and newlines', () => {
    const result = calculateTotal('1,2\n3,4\n5')
    expect(result).toBe(15)
  })

  it('ignores empty strings and extra spaces', () => {
    const result = calculateTotal(' 1 , 2  ,   \n  3  \n , 4 ')
    expect(result).toBe(10)
  })

  it('ignores non-numeric values', () => {
    const result = calculateTotal('1,abc,3')
    expect(result).toBe(4)
  })

  it('returns 0 for empty input', () => {
    const result = calculateTotal('')
    expect(result).toBe(0)
  })
})
