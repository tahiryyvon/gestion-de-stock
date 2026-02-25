export default function Home() {
  return (
    <div>
      <h1>✅ Application déployée avec succès!</h1>
      <p>Gestion de Stock - Version Simple</p>
      <p>Date: {new Date().toLocaleDateString()}</p>
      <p>Status: En ligne</p>
    </div>
  )
}