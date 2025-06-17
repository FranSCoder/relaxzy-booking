import AddTherapistForm from '@/app/(protected)/admin/AddTherapistForm'
import TherapistList from './TherapistList'

export default async function HomePage() {
  return (
    <main className="p-4">
      <TherapistList/>
      <AddTherapistForm/>
    </main>
  )
}
