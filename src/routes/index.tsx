import { createFileRoute } from '@tanstack/react-router'

import FareViewer from '../components/FareViewer'

export const Route = createFileRoute('/')({
  component: FareViewer,
})

