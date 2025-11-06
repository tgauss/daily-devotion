import { createServiceClient } from '@/lib/supabase/service'

export default async function SimplePlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const serviceClient = createServiceClient()
  const { data: plan } = await serviceClient
    .from('plans')
    .select('*')
    .eq('id', id)
    .single()

  return (
    <div className="min-h-screen bg-sandstone p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Simple Plan View</h1>
        {plan ? (
          <div>
            <p><strong>ID:</strong> {plan.id}</p>
            <p><strong>Title:</strong> {plan.title}</p>
            <p><strong>Description:</strong> {plan.description}</p>
            <p><strong>Owner:</strong> {plan.user_id}</p>
            <p><strong>Public:</strong> {plan.is_public ? 'Yes' : 'No'}</p>
          </div>
        ) : (
          <p>Plan not found</p>
        )}
      </div>
    </div>
  )
}
