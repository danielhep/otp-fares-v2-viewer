import { useMemo, useState } from 'react'

import {
  analyzePlan,
  describeFareProduct,
  formatMoney,
  formatTotals,
  parseOtpPlanInput,
  type AnalyzedFareProduct,
  type FareAnalysis,
  type FareProductTypeName,
} from '../lib/fare-analysis'
import { sampleOtpPlanJson } from '../sampleData'
import { parse } from 'node:path/win32'

const typeAccent: Record<FareProductTypeName, string> = {
  DefaultFareProduct: 'border-blue-500/60 bg-blue-500/10 text-blue-100',
  DependentFareProduct: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-100',
}

const typeChip: Record<FareProductTypeName, string> = {
  DefaultFareProduct: 'bg-blue-500/20 text-blue-100 border border-blue-500/50',
  DependentFareProduct: 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/50',
}

const reuseBadge = 'bg-purple-500/20 border border-purple-400/60 text-purple-100'
const variationBadge = 'bg-amber-500/20 border border-amber-400/60 text-amber-100'

export default function FareViewer() {
  const [rawInput, setRawInput] = useState('')
  const [analysis, setAnalysis] = useState<FareAnalysis | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedItinerary, setSelectedItinerary] = useState(0)
  const [lastParsedAt, setLastParsedAt] = useState<number | null>(null)

  const handleChangeInput = (value: string) => {
    setRawInput(value)
    if (errorMessage) {
      setErrorMessage(null)
    }
  }

  const handleParse = () => {
    const result = parseOtpPlanInput(rawInput)
    if (result.kind === 'empty') {
      setAnalysis(null)
      setErrorMessage('Paste OTP GraphQL JSON to get started.')
      setLastParsedAt(null)
      return
    }
    if (result.kind === 'error') {
      setAnalysis(null)
      setErrorMessage(result.message)
      setLastParsedAt(null)
      return
    }

    const nextAnalysis = analyzePlan(result.plan)
    setAnalysis(nextAnalysis)
    setErrorMessage(null)
    setSelectedItinerary((current) =>
      Math.min(current, Math.max(0, nextAnalysis.itineraries.length - 1)),
    )
    setLastParsedAt(Date.now())
  }

  const handleLoadSample = () => {
    setRawInput(sampleOtpPlanJson)
    const result = parseOtpPlanInput(sampleOtpPlanJson)
    if (result.kind === 'success') {
      const nextAnalysis = analyzePlan(result.plan)
      setAnalysis(nextAnalysis)
      setErrorMessage(null)
      setSelectedItinerary(0)
      setLastParsedAt(Date.now())
    }
  }

  const currentItinerary = useMemo(() => {
    if (!analysis) {
      return null
    }
    return analysis.itineraries[selectedItinerary] ?? null
  }, [analysis, selectedItinerary])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
        <div className="space-y-6">
          <FareSummaryPanel analysis={analysis} />
          <FareLegend />
        </div>
        <div className="space-y-6">
          <JsonInputPanel
            rawInput={rawInput}
            onChange={handleChangeInput}
            onParse={handleParse}
            onLoadSample={handleLoadSample}
            parseDisabled={!rawInput.trim()}
            errorMessage={errorMessage}
            lastParsedAt={lastParsedAt}
          />
          <ItineraryPanel
            analysis={analysis}
            currentItinerary={currentItinerary}
            onSelectItinerary={setSelectedItinerary}
            selectedItinerary={selectedItinerary}
          />
        </div>
      </div>
    </div>
  )
}

interface JsonInputPanelProps {
  rawInput: string
  onChange: (value: string) => void
  onParse: () => void
  onLoadSample: () => void
  parseDisabled: boolean
  errorMessage: string | null
  lastParsedAt: number | null
}

function JsonInputPanel({
  rawInput,
  onChange,
  onParse,
  onLoadSample,
  parseDisabled,
  errorMessage,
  lastParsedAt,
}: JsonInputPanelProps) {
  console.log(parseDisabled)
  return (
    <section className="rounded-xl border border-slate-700/70 bg-slate-900/70 shadow-xl shadow-slate-950/30">
      <div className="flex items-center justify-between border-b border-slate-700/60 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">Paste OTP JSON</h2>
          <p className="text-sm text-slate-400">
            Paste the GraphQL response body that contains the plan itineraries and fare products.
          </p>
        </div>
        <button
          type="button"
          onClick={onLoadSample}
          className="rounded-lg border border-blue-500/50 bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-100 transition hover:bg-blue-500/20"
        >
          Load Sample
        </button>
      </div>
      <div className="flex flex-col gap-4 p-5">
        <textarea
          value={rawInput}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`{ "plan": { ... } } or { "data": { "plan": { ... } } }`}
          className="min-h-[220px] w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onParse}
            disabled={parseDisabled}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:bg-blue-500/40"
          >
            Parse &amp; Visualize
          </button>
          {lastParsedAt ? (
            <p className="text-xs text-slate-400">
              Last parsed {new Date(lastParsedAt).toLocaleTimeString()}
            </p>
          ) : null}
          {errorMessage ? (
            <p className="text-sm font-medium text-rose-300">{errorMessage}</p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

interface FareSummaryPanelProps {
  analysis: FareAnalysis | null
}

function FareSummaryPanel({ analysis }: FareSummaryPanelProps) {
  if (!analysis) {
    return (
      <section className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30">
        <h2 className="text-lg font-semibold text-slate-50">Fare Summary</h2>
        <p className="mt-2 text-sm text-slate-400">
          Parse a plan to see aggregated fare information, reuse counts, and variation alerts.
        </p>
      </section>
    )
  }

  const { summary } = analysis

  return (
    <section className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30">
      <h2 className="text-lg font-semibold text-slate-50">Fare Summary</h2>
      <div className="mt-4 space-y-4 text-sm text-slate-200">
        <div>
          <h3 className="text-xs uppercase tracking-wide text-slate-400">Total Journey Cost</h3>
          <p className="mt-1 text-base font-semibold text-slate-50">
            {formatTotals(summary.totalsByCurrency)}
          </p>
        </div>
        <div className="grid gap-3">
          <div>
            <h3 className="text-xs uppercase tracking-wide text-slate-400">Fare Product Types</h3>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-100">
                Default · {summary.productTypeCounts.DefaultFareProduct}
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-100">
                Dependent · {summary.productTypeCounts.DependentFareProduct}
              </span>
            </div>
          </div>
          <SummaryList
            title="Reused Fare Products"
            emptyLabel="No reuse detected"
            items={summary.reusedProducts.map((usage) => ({
              key: usage.productId,
              heading: usage.productId,
              description: `${usage.occurrences.length} uses across itineraries`,
            }))}
          />
          <SummaryList
            title="Variation Alerts"
            emptyLabel="No variations detected"
            items={summary.variationProducts.map((usage) => ({
              key: usage.productId,
              heading: usage.productId,
              description: `${usage.signatures.length} distinct variations`,
            }))}
          />
        </div>
      </div>
    </section>
  )
}

interface SummaryListProps {
  title: string
  emptyLabel: string
  items: Array<{ key: string; heading: string; description: string }>
}

function SummaryList({ title, emptyLabel, items }: SummaryListProps) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wide text-slate-400">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-1 text-xs text-slate-500">{emptyLabel}</p>
      ) : (
        <ul className="mt-2 space-y-2 text-xs text-slate-300">
          {items.map((item) => (
            <li key={item.key} className="rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2">
              <p className="font-medium text-slate-100">{item.heading}</p>
              <p className="text-[0.7rem] uppercase tracking-wide text-slate-500">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FareLegend() {
  return (
    <section className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30">
      <h2 className="text-lg font-semibold text-slate-50">Fare Product Legend</h2>
      <dl className="mt-4 space-y-3 text-sm text-slate-300">
        <LegendItem
          swatchClass="bg-blue-500/20 border border-blue-500/50"
          title="Default Fare Product"
          description="Standard fares returned by OTP with explicit prices."
        />
        <LegendItem
          swatchClass="bg-emerald-500/20 border border-emerald-500/50"
          title="Dependent Fare Product"
          description="Fares that depend on another product (e.g. discounts, transfers)."
        />
        <LegendItem
          swatchClass="bg-purple-500/20 border border-purple-500/50"
          title="↺ Reused"
          description="Same fare product ID applied to multiple legs."
        />
        <LegendItem
          swatchClass="bg-amber-500/20 border border-amber-500/60"
          title="⚠ Variation"
          description="Same ID but with differing price or metadata."
        />
      </dl>
    </section>
  )
}

interface LegendItemProps {
  swatchClass: string
  title: string
  description: string
}

function LegendItem({ swatchClass, title, description }: LegendItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-md ${swatchClass} text-xs font-semibold text-slate-100`}>
        {title.startsWith('↺') ? '↺' : title.startsWith('⚠') ? '⚠' : ''}
      </span>
      <div>
        <p className="text-sm font-medium text-slate-100">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  )
}

interface ItineraryPanelProps {
  analysis: FareAnalysis | null
  currentItinerary: FareAnalysis['itineraries'][number] | null
  onSelectItinerary: (index: number) => void
  selectedItinerary: number
}

function ItineraryPanel({ analysis, currentItinerary, onSelectItinerary, selectedItinerary }: ItineraryPanelProps) {
  if (!analysis) {
    return (
      <section className="rounded-xl border border-dashed border-slate-700/70 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
        Paste OTP plan JSON and click Parse to visualize fare products.
      </section>
    )
  }

  if (analysis.itineraries.length === 0) {
    return (
      <section className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-6 text-sm text-slate-400">
        No itineraries found in the parsed plan.
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-700/70 bg-slate-900/70 shadow-xl shadow-slate-950/30">
      <div className="border-b border-slate-700/60 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-50">Itineraries</h2>
      </div>
      <div className="flex flex-col gap-5 p-5">
        <nav className="flex flex-wrap gap-3">
          {analysis.itineraries.map((itinerary) => {
            const isActive = itinerary.itineraryIndex === selectedItinerary
            return (
              <button
                key={itinerary.itineraryIndex}
                type="button"
                onClick={() => onSelectItinerary(itinerary.itineraryIndex)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'border-blue-500 bg-blue-500/20 text-blue-100'
                    : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
                }`}
              >
                <span className="block text-left font-semibold">
                  Itinerary {itinerary.itineraryIndex + 1}
                </span>
                <span className="block text-xs text-slate-400">
                  {formatTotals(itinerary.totalsByCurrency)}
                </span>
              </button>
            )
          })}
        </nav>
        {currentItinerary ? (
          <div className="space-y-6">
            {currentItinerary.legs.map((leg) => (
              <LegDetails key={leg.legIndex} leg={leg} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

interface LegDetailsProps {
  leg: FareAnalysis['itineraries'][number]['legs'][number]
}

function LegDetails({ leg }: LegDetailsProps) {
  const headerLabel = leg.routeShortName
    ? `${leg.routeShortName}`
    : `Leg ${leg.legIndex + 1}`

  return (
    <article className="rounded-xl border border-slate-700/70 bg-slate-950/80 p-5 shadow-lg shadow-slate-950/30">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-50">Leg {leg.legIndex + 1}</h3>
          <p className="text-sm text-slate-400">Route: {headerLabel}</p>
        </div>
      </header>
      <div className="space-y-4">
        {leg.fareProducts.length === 0 ? (
          <p className="text-sm text-slate-500">No fare products on this leg.</p>
        ) : (
          leg.fareProducts.map((analyzed) => (
            <FareProductCard key={`${analyzed.occurrence.legIndex}-${analyzed.occurrence.fareProduct.id}`} analyzed={analyzed} />
          ))
        )}
      </div>
    </article>
  )
}

interface FareProductCardProps {
  analyzed: AnalyzedFareProduct
}

function FareProductCard({ analyzed }: FareProductCardProps) {
  const { occurrence, usage } = analyzed
  const { fareProduct } = occurrence
  const details = fareProduct.product

  const baseClass = typeAccent[details.__typename]
  const highlightClasses = [baseClass]
  if (usage.isReused) {
    highlightClasses.push('ring-1 ring-purple-500/50')
  }
  if (usage.hasVariation) {
    highlightClasses.push('ring-1 ring-amber-500/50')
  }

  return (
    <div className={`rounded-lg border px-4 py-3 transition ${highlightClasses.join(' ')}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-slate-100">{fareProduct.id}</span>
          {usage.isReused ? (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${reuseBadge}`}>
              ↺ {usage.occurrences.length}
            </span>
          ) : null}
          {usage.hasVariation ? (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${variationBadge}`}>
              ⚠ Variation
            </span>
          ) : null}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${typeChip[details.__typename]}`}>
          {details.__typename.replace('FareProduct', '')}
        </span>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-2 text-xs text-slate-200 sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-[0.65rem] uppercase tracking-wide text-slate-400">Product Name</dt>
          <dd className="text-sm text-slate-100">{details.name ?? '—'}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-[0.65rem] uppercase tracking-wide text-slate-400">Internal Product ID</dt>
          <dd className="font-mono text-sm text-slate-100">{details.id}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-[0.65rem] uppercase tracking-wide text-slate-400">Medium</dt>
          <dd className="text-sm text-slate-100">
            {details.medium?.name ?? details.medium?.id ?? '—'}
            {details.medium?.name && details.medium?.id
              ? ` · ${details.medium.id}`
              : ''}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-[0.65rem] uppercase tracking-wide text-slate-400">Rider Category</dt>
          <dd className="text-sm text-slate-100">
            {details.riderCategory?.name ?? details.riderCategory?.id ?? '—'}
            {details.riderCategory?.name && details.riderCategory?.id
              ? ` · ${details.riderCategory.id}`
              : ''}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-[0.65rem] uppercase tracking-wide text-slate-400">Price</dt>
          <dd className="font-mono text-sm text-slate-100">
            {details.price ? formatMoney(details.price) : '—'}
          </dd>
        </div>
        {details.__typename === 'DependentFareProduct' ? (
          <div className="space-y-1">
            <dt className="text-[0.65rem] uppercase tracking-wide text-slate-400">Dependencies</dt>
            <dd className="text-sm text-slate-100">
              {details.dependencies.length > 0
                ? details.dependencies
                    .map((dependency) => dependency.id ?? dependency.name ?? 'unknown')
                    .join(', ')
                : '—'}
            </dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-3 text-[0.65rem] uppercase tracking-wide text-slate-500">
        Signature · {describeFareProduct(details)}
      </p>
    </div>
  )
}
