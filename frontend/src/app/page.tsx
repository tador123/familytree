// @ts-nocheck - React types are in Docker container
export default function Home() {
  return (
    <div>
      <h2>Welcome to Family Tree</h2>
      <p>Manage your family relationships, biographical information, and media.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h3>Features:</h3>
        <ul>
          <li>📋 Manage family members and their biographical information</li>
          <li>🌳 Visualize family relationships in a tree structure</li>
          <li>📸 Upload and manage family photos and documents</li>
          <li>🔍 Search and filter family members</li>
          <li>📊 View family statistics and insights</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Services Status:</h3>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <strong>API Service</strong>
            <p>Port: 3001</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <strong>Media Service</strong>
            <p>Port: 3002</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <strong>Database</strong>
            <p>PostgreSQL</p>
          </div>
        </div>
      </div>
    </div>
  )
}
