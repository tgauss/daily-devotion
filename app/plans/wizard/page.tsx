import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WizardPlanBuilder } from '@/components/plans/wizard-plan-builder'

export default async function WizardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return <WizardPlanBuilder />
}
