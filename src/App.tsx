import FareViewer from './components/FareViewer'
import Header from './components/Header'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col gap-4">
      <Header />
      <main className="flex-1">
        <FareViewer />
      </main>
    </div>
  )
}
