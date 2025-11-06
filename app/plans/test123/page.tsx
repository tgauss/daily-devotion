export default function StaticTestPage() {
  return (
    <div className="min-h-screen bg-sandstone p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Static Test Page</h1>
        <p>If you can see this, the route works!</p>
        <p>Timestamp: {new Date().toISOString()}</p>
      </div>
    </div>
  )
}
