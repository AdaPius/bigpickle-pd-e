import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Entry = {
  id: string
  hour: string
  energy: number
  productivity: number
}

const STORAGE_KEY = 'steps-energy-productivity-dashboard-v1'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as { date: string; steps: number; entries: Entry[] }
  } catch {
    return null
  }
}

function App() {
  const stored = loadState()
  const isToday = stored?.date === todayKey()
  const [steps, setSteps] = useState(isToday ? stored!.steps : 0)
  const [entries, setEntries] = useState<Entry[]>(isToday ? stored!.entries : [])
  const [hour, setHour] = useState('09:00')
  const [energy, setEnergy] = useState(5)
  const [productivity, setProductivity] = useState(5)

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: todayKey(), steps, entries }),
    )
  }, [steps, entries])

  const avgEnergy = useMemo(() => {
    if (!entries.length) return 0
    return entries.reduce((s, e) => s + e.energy, 0) / entries.length
  }, [entries])

  const avgProductivity = useMemo(() => {
    if (!entries.length) return 0
    return entries.reduce((s, e) => s + e.productivity, 0) / entries.length
  }, [entries])

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => a.hour.localeCompare(b.hour)),
    [entries],
  )

  function addEntry() {
    const next: Entry = {
      id: `${hour}-${Date.now()}`,
      hour,
      energy,
      productivity,
    }
    setEntries((prev) => {
      const withoutHour = prev.filter((e) => e.hour !== hour)
      return [...withoutHour, next]
    })
  }

  function resetToday() {
    setSteps(0)
    setEntries([])
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Daily Wellness Dashboard</h1>
          <p className="subtle">Track steps, energy, and productivity across {todayKey()}</p>
        </div>
        <button className="secondary" onClick={resetToday}>Reset Today</button>
      </header>

      <section className="grid">
        <div className="card">
          <h2>Steps</h2>
          <div className="metric">{steps.toLocaleString()}</div>
          <p className="small">Manual step count for today</p>
          <label htmlFor="steps">Update steps</label>
          <input
            id="steps"
            type="number"
            min={0}
            value={steps}
            onChange={(e) => setSteps(Math.max(0, Number(e.target.value) || 0))}
          />
          <div className="row" style={{ marginTop: 10 }}>
            <button className="secondary" onClick={() => setSteps((s) => s + 500)}>+500</button>
            <button className="secondary" onClick={() => setSteps((s) => s + 1000)}>+1000</button>
          </div>
        </div>

        <div className="card">
          <h2>Average Energy</h2>
          <div className="metric">{avgEnergy ? avgEnergy.toFixed(1) : '—'}/10</div>
          <p className="small">{entries.length ? `Based on ${entries.length} check-in(s)` : 'No check-ins yet'}</p>
        </div>

        <div className="card">
          <h2>Average Productivity</h2>
          <div className="metric">{avgProductivity ? avgProductivity.toFixed(1) : '—'}/10</div>
          <p className="small">{entries.length ? `Across the day` : 'Add entries to see trends'}</p>
        </div>
      </section>

      <section className="card" style={{ marginBottom: 20 }}>
        <h2>Log Check-in</h2>
        <div className="form-grid">
          <div>
            <label htmlFor="hour">Time</label>
            <select id="hour" value={hour} onChange={(e) => setHour(e.target.value)}>
              {Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`).map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="energy">Energy (1-10)</label>
            <input id="energy" type="number" min={1} max={10} value={energy} onChange={(e) => setEnergy(Math.min(10, Math.max(1, Number(e.target.value) || 1)))} />
          </div>
          <div>
            <label htmlFor="productivity">Productivity (1-10)</label>
            <input id="productivity" type="number" min={1} max={10} value={productivity} onChange={(e) => setProductivity(Math.min(10, Math.max(1, Number(e.target.value) || 1)))} />
          </div>
        </div>
        <button onClick={addEntry}>Save Check-in</button>
        <p className="small" style={{ marginTop: 8 }}>Saving the same time replaces the previous entry for that hour.</p>
      </section>

      <section className="card">
        <h2>Day Timeline</h2>
        {sortedEntries.length === 0 ? (
          <p className="empty">No entries yet. Log your energy and productivity to build your timeline.</p>
        ) : (
          <div className="timeline">
            {sortedEntries.map((e) => (
              <div className="entry" key={e.id}>
                <strong>{e.hour}</strong>
                <div>
                  <div className="small">Energy: {e.energy}/10</div>
                  <div className="bar-wrap"><div className="bar energy" style={{ width: `${e.energy * 10}%` }} /></div>
                </div>
                <div>
                  <div className="small">Productivity: {e.productivity}/10</div>
                  <div className="bar-wrap"><div className="bar productivity" style={{ width: `${e.productivity * 10}%` }} /></div>
                </div>
                <div className="small">{((e.energy + e.productivity) / 2).toFixed(1)} avg</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default App
