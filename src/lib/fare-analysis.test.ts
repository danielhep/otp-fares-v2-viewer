import { describe, expect, it } from 'vitest'

import { analyzePlan, formatMoney, parseOtpPlanInput } from './fare-analysis'

describe('fare-analysis price parsing', () => {
  it('parses fare product prices with nested amount objects', () => {
    const input = JSON.stringify({
      plan: {
        itineraries: [
          {
            legs: [
              {
                transitLeg: true,
                route: {
                  shortName: '10',
                },
                fareProducts: [
                  {
                    id: 'fare:default-1',
                    product: {
                      __typename: 'DefaultFareProduct',
                      id: 'default-1',
                      price: {
                        amount: {
                          source: '1.00',
                          parsedValue: 1,
                        },
                        currency: {
                          code: 'USD',
                          digits: 2,
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    const result = parseOtpPlanInput(input)
    if (result.kind !== 'success') {
      throw new Error('Expected parse success')
    }

    const analysis = analyzePlan(result.plan)
    const leg = analysis.itineraries[0]?.legs[0]
    if (!leg) {
      throw new Error('Expected itinerary leg to be present')
    }

    const price = leg.fareProducts[0]?.occurrence.fareProduct.product.price
    expect(price).toBeDefined()
    expect(price?.amount).toBe(100)
    expect(price?.currencyCode).toBe('USD')
    expect(price?.currencyDigits).toBe(2)
    expect(formatMoney(price!)).toBe('USD 1.00')
  })

  it('parses a single itinerary object input', () => {
    const input = JSON.stringify({
      legs: [
        {
          transitLeg: true,
          route: {
            shortName: 'A',
          },
          fareProducts: [
            {
              id: 'fare:single-itinerary',
              product: {
                __typename: 'DefaultFareProduct',
                id: 'single-itinerary-product',
                price: {
                  amount: 2.5,
                  currency: {
                    code: 'USD',
                    digits: 2,
                  },
                },
              },
            },
          ],
        },
      ],
    })

    const result = parseOtpPlanInput(input)
    if (result.kind !== 'success') {
      throw new Error('Expected parse success')
    }

    expect(result.plan.itineraries).toHaveLength(1)
    expect(result.plan.itineraries[0]?.legs).toHaveLength(1)

    const analysis = analyzePlan(result.plan)
    expect(analysis.itineraries).toHaveLength(1)
    expect(analysis.itineraries[0]?.totalsByCurrency[0]?.amount).toBe(250)
  })
})
