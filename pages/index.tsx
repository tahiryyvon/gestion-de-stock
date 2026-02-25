export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 Application Gestion de Stock</h1>
      <p>L'application est déployée avec succès sur Vercel !</p>
      <p>Version: 1.0.0</p>
      <p>Status: ✅ Online</p>
      
      <h2>🔗 Navigation</h2>
      <ul>
        <li><a href="/auth/login">Se connecter</a></li>
        <li><a href="/dashboard">Dashboard (nécessite connexion)</a></li>
        <li><a href="/pos">Point de Vente (nécessite connexion)</a></li>
      </ul>
      
      <h2>📋 Informations système</h2>
      <p>Next.js: 14.2.35</p>
      <p>Prisma: 5.22.0</p>
      <p>Database: Neon PostgreSQL</p>
      
      <style jsx>{`
        h1 { color: #0070f3; }
        h2 { color: #333; margin-top: 30px; }
        ul { margin: 10px 0; }
        li { margin: 5px 0; }
        a { color: #0070f3; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>
    </div>
  )
}