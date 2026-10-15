import { useState, useEffect } from 'react'
import './App.css'

function App() {
 
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // This request will be intercepted by MSW!
    fetch('https://api.pharmaDashboard.com/user')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Fetch error:', err)
        setLoading(false)
      })
  }, [])

  return (
    <>
   
          <h1>MSW Mock Server Active</h1>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', margin: '16px auto', maxWidth: '320px', textAlign: 'left' }}>
            {loading ? (
              <p>Loading mock data...</p>
            ) : (
              users.map((u) => (
                <div key={u.id}>
                  <strong>ID:</strong> {u.id} <br />
                  <strong>Name:</strong> {u.firstName} {u.lastName}
                </div>
              ))
            )}
          </div>
      
    </>
  )
}

export default App
