function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export type FareProductTypeName = 'DefaultFareProduct' | 'DependentFareProduct'

export interface EntityRef {
  id?: string
  name?: string
}

export interface FareProductPrice {
  amount: number
  currencyCode: string
  currencyDigits: number | null
}

export interface FareProductProductBase {
  __typename: FareProductTypeName
  id: string
  medium?: EntityRef
  name?: string
  riderCategory?: EntityRef
  price?: FareProductPrice
}

export interface DefaultFareProductProduct extends FareProductProductBase {
  __typename: 'DefaultFareProduct'
  price?: FareProductPrice
}

export interface DependentFareProductProduct extends FareProductProductBase {
  __typename: 'DependentFareProduct'
  dependencies: EntityRef[]
  price?: FareProductPrice
}

export type FareProductProduct =
  | DefaultFareProductProduct
  | DependentFareProductProduct

export interface FareProduct {
  id: string
  product: FareProductProduct
}

export interface OtpLeg {
  routeShortName?: string
  fareProducts: FareProduct[]
}

export interface OtpItinerary {
  legs: OtpLeg[]
}

export interface OtpPlan {
  itineraries: OtpItinerary[]
}

export interface FareProductOccurrence {
  itineraryIndex: number
  legIndex: number
  fareProduct: FareProduct
  signature: string
}

export interface FareProductUsage {
  productId: string
  occurrences: FareProductOccurrence[]
  signatures: string[]
  isReused: boolean
  hasVariation: boolean
  productType: FareProductTypeName
  representative: FareProduct
}

export interface MoneyTotal {
  currencyCode: string
  currencyDigits: number
  amount: number
}

export interface FareSummary {
  totalsByCurrency: MoneyTotal[]
  productTypeCounts: Record<FareProductTypeName, number>
  reusedProducts: FareProductUsage[]
  variationProducts: FareProductUsage[]
}

export interface AnalyzedFareProduct {
  occurrence: FareProductOccurrence
  usage: FareProductUsage
}

export interface AnalyzedLeg {
  legIndex: number
  routeShortName?: string
  fareProducts: AnalyzedFareProduct[]
}

export interface AnalyzedItinerary {
  itineraryIndex: number
  legs: AnalyzedLeg[]
  totalsByCurrency: MoneyTotal[]
}

export interface FareAnalysis {
  plan: OtpPlan
  usages: Map<string, FareProductUsage>
  itineraries: AnalyzedItinerary[]
  summary: FareSummary
}

export type ParseOtpPlanResult =
  | { kind: 'success'; plan: OtpPlan }
  | { kind: 'empty' }
  | { kind: 'error'; message: string }

function parseFareProductPrice(raw: unknown): FareProductPrice | undefined {
  if (!isRecord(raw)) {
    return undefined
  }
  const amountRaw = raw.amount
  const currencyRaw = raw.currency
  if (typeof amountRaw !== 'number' || !isFinite(amountRaw)) {
    return undefined
  }
  if (!isRecord(currencyRaw) || typeof currencyRaw.code !== 'string') {
    return undefined
  }
  const digitsValue = currencyRaw.digits
  const digits =
    typeof digitsValue === 'number' && Number.isInteger(digitsValue) && digitsValue >= 0
      ? digitsValue
      : null
  return {
    amount: amountRaw,
    currencyCode: currencyRaw.code,
    currencyDigits: digits,
  }
}

function parseEntity(raw: unknown): EntityRef | undefined {
  if (!isRecord(raw)) {
    return undefined
  }
  const entity: EntityRef = {}
  if (typeof raw.id === 'string' && raw.id.trim().length > 0) {
    entity.id = raw.id
  }
  if (typeof raw.name === 'string' && raw.name.trim().length > 0) {
    entity.name = raw.name
  }
  if (!entity.id && !entity.name) {
    return undefined
  }
  return entity
}

function parseFareProduct(raw: unknown): FareProduct | undefined {
  if (!isRecord(raw)) {
    return undefined
  }
  if (typeof raw.id !== 'string' || !raw.product) {
    return undefined
  }
  const productRaw = raw.product
  if (!isRecord(productRaw) || typeof productRaw.__typename !== 'string' || typeof productRaw.id !== 'string') {
    return undefined
  }
  const typeName = productRaw.__typename as FareProductTypeName
  if (typeName !== 'DefaultFareProduct' && typeName !== 'DependentFareProduct') {
    return undefined
  }

  const base: FareProductProductBase = {
    __typename: typeName,
    id: productRaw.id,
    medium: parseEntity(productRaw.medium),
    name: typeof productRaw.name === 'string' ? productRaw.name : undefined,
    riderCategory: parseEntity(productRaw.riderCategory),
    price: parseFareProductPrice(productRaw.price),
  }

  if (typeName === 'DefaultFareProduct') {
    return {
      id: raw.id,
      product: {
        ...base,
        __typename: 'DefaultFareProduct',
      },
    }
  }

  const dependenciesRaw = productRaw.dependencies
  const dependencies: EntityRef[] = []
  if (Array.isArray(dependenciesRaw)) {
    for (const dependency of dependenciesRaw) {
      const parsed = parseEntity(dependency)
      if (parsed) {
        dependencies.push(parsed)
      }
    }
  }

  return {
    id: raw.id,
    product: {
      ...base,
      __typename: 'DependentFareProduct',
      dependencies,
    },
  }
}

function parseLeg(raw: unknown): OtpLeg | undefined {
  if (!isRecord(raw)) {
    return undefined
  }
  const route = isRecord(raw.route) ? raw.route : undefined
  const routeShortName = typeof route?.shortName === 'string' ? route.shortName : undefined

  const fareProducts: FareProduct[] = []
  if (Array.isArray(raw.fareProducts)) {
    for (const product of raw.fareProducts) {
      const parsed = parseFareProduct(product)
      if (parsed) {
        fareProducts.push(parsed)
      }
    }
  }

  return {
    routeShortName,
    fareProducts,
  }
}

function parseItinerary(raw: unknown): OtpItinerary | undefined {
  if (!isRecord(raw)) {
    return undefined
  }
  const legs: OtpLeg[] = []
  if (Array.isArray(raw.legs)) {
    for (const leg of raw.legs) {
      const parsedLeg = parseLeg(leg)
      if (parsedLeg) {
        legs.push(parsedLeg)
      }
    }
  }
  return { legs }
}

export function parseOtpPlanInput(raw: string): ParseOtpPlanResult {
  if (!raw.trim()) {
    return { kind: 'empty' }
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    return {
      kind: 'error',
      message: error instanceof Error ? error.message : 'Unable to parse JSON input',
    }
  }

  const structureError =
    'Input does not match expected OTP plan structure; expected { "plan": ... } or { "data": { "plan": ... } }'

  if (!isRecord(parsed)) {
    return { kind: 'error', message: structureError }
  }

  const planRecord = isRecord(parsed.plan)
    ? parsed.plan
    : isRecord(parsed.data) && isRecord(parsed.data.plan)
      ? parsed.data.plan
      : null

  const rawItineraries = planRecord?.itineraries
  if (!Array.isArray(rawItineraries)) {
    return { kind: 'error', message: structureError }
  }

  const itineraries: OtpItinerary[] = []
  for (const itinerary of rawItineraries) {
    const parsedItinerary = parseItinerary(itinerary)
    if (parsedItinerary) {
      itineraries.push(parsedItinerary)
    }
  }
  return { kind: 'success', plan: { itineraries } }
}

function normalizedProductDetails(product: FareProductProduct): Record<string, unknown> {
  const base: Record<string, unknown> = {
    __typename: product.__typename,
    id: product.id,
    name: product.name ?? null,
    medium: product.medium
      ? {
          id: product.medium.id ?? null,
          name: product.medium.name ?? null,
        }
      : null,
    riderCategory: product.riderCategory
      ? {
          id: product.riderCategory.id ?? null,
          name: product.riderCategory.name ?? null,
        }
      : null,
    price: product.price
      ? {
          amount: product.price.amount,
          currencyCode: product.price.currencyCode,
          currencyDigits: product.price.currencyDigits,
        }
      : null,
  }
  if (product.__typename === 'DependentFareProduct') {
    const dependent = product as DependentFareProductProduct
    base.dependencies = dependent.dependencies.map((dependency) => ({
      id: dependency.id ?? null,
      name: dependency.name ?? null,
    }))
  }
  return base
}

function signatureForProduct(product: FareProductProduct): string {
  return JSON.stringify(normalizedProductDetails(product))
}

function addMoney(totalMap: Map<string, MoneyTotal>, price: FareProductPrice) {
  const digits = price.currencyDigits ?? 2
  const key = `${price.currencyCode}__${digits}`
  const existing = totalMap.get(key)
  if (existing) {
    existing.amount += price.amount
  } else {
    totalMap.set(key, {
      currencyCode: price.currencyCode,
      currencyDigits: digits,
      amount: price.amount,
    })
  }
}

function cloneTotals(map: Map<string, MoneyTotal>): MoneyTotal[] {
  return Array.from(map.values()).map((total) => ({ ...total }))
}

export function analyzePlan(plan: OtpPlan): FareAnalysis {
  const usageMap = new Map<string, FareProductUsage>()
  const itineraries: AnalyzedItinerary[] = []
  const productTypeCounts: Record<FareProductTypeName, number> = {
    DefaultFareProduct: 0,
    DependentFareProduct: 0,
  }

  plan.itineraries.forEach((itinerary, itineraryIndex) => {
    const itineraryTotals = new Map<string, MoneyTotal>()
    const itinerarySeen = new Set<string>()
    const analyzedLegs: AnalyzedLeg[] = []

    itinerary.legs.forEach((leg, legIndex) => {
      const analyzedProducts: AnalyzedFareProduct[] = []

      leg.fareProducts.forEach((fareProduct) => {
        const { product } = fareProduct
        const productType = product.__typename
        productTypeCounts[productType] += 1

        const signature = signatureForProduct(product)
        let usage = usageMap.get(fareProduct.id)
        if (!usage) {
          usage = {
            productId: fareProduct.id,
            occurrences: [],
            signatures: [],
            isReused: false,
            hasVariation: false,
            productType,
            representative: fareProduct,
          }
          usageMap.set(fareProduct.id, usage)
        }

        usage.occurrences.push({
          itineraryIndex,
          legIndex,
          fareProduct,
          signature,
        })
        if (!usage.signatures.includes(signature)) {
          usage.signatures.push(signature)
        }
        usage.isReused = usage.occurrences.length > 1
        usage.hasVariation = usage.signatures.length > 1

        analyzedProducts.push({
          occurrence: {
            itineraryIndex,
            legIndex,
            fareProduct,
            signature,
          },
          usage,
        })

        if (!itinerarySeen.has(fareProduct.id) && fareProduct.product.price) {
          addMoney(itineraryTotals, fareProduct.product.price)
          itinerarySeen.add(fareProduct.id)
        }
      })

      analyzedLegs.push({
        legIndex,
        routeShortName: leg.routeShortName,
        fareProducts: analyzedProducts,
      })
    })

    itineraries.push({
      itineraryIndex,
      legs: analyzedLegs,
      totalsByCurrency: cloneTotals(itineraryTotals),
    })
  })

  const summaryTotals = new Map<string, MoneyTotal>()
  usageMap.forEach((usage) => {
    const price = usage.representative.product.price
    if (price) {
      addMoney(summaryTotals, price)
    }
  })

  const reusedProducts: FareProductUsage[] = []
  const variationProducts: FareProductUsage[] = []
  usageMap.forEach((usage) => {
    if (usage.isReused) {
      reusedProducts.push(usage)
    }
    if (usage.hasVariation) {
      variationProducts.push(usage)
    }
  })

  const summary: FareSummary = {
    totalsByCurrency: cloneTotals(summaryTotals),
    productTypeCounts,
    reusedProducts,
    variationProducts,
  }

  return {
    plan,
    usages: usageMap,
    itineraries,
    summary,
  }
}

export function formatMoney(total: MoneyTotal | FareProductPrice): string {
  const digits = total.currencyDigits ?? 2
  const divisor = 10 ** digits
  const value = (total.amount / divisor).toFixed(digits)
  return `${total.currencyCode} ${value}`
}

export function describeFareProduct(product: FareProductProduct): string {
  const parts: string[] = [product.__typename]
  if (product.price) {
    parts.push(formatMoney(product.price))
  }
  if (product.medium?.name || product.medium?.id) {
    parts.push(`Medium: ${product.medium.name ?? ''} ${product.medium.id ?? ''}`.trim())
  }
  if (product.riderCategory?.name || product.riderCategory?.id) {
    parts.push(
      `Rider: ${product.riderCategory.name ?? ''} ${product.riderCategory.id ?? ''}`.trim()
    )
  }
  if (product.__typename === 'DependentFareProduct') {
    const dependent = product as DependentFareProductProduct
    if (dependent.dependencies.length > 0) {
      const deps = dependent.dependencies
        .map((dependency) => dependency.id ?? dependency.name ?? 'unknown')
        .join(', ')
      parts.push(`Dependencies: ${deps}`)
    }
  }
  return parts.join(' · ')
}

export function formatTotals(totals: MoneyTotal[]): string {
  if (totals.length === 0) {
    return '—'
  }
  return totals
    .map((total) => formatMoney(total))
    .join(' + ')
}
