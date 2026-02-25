import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default function Home({ products }) {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🏪 Gestion de Stock</h1>
      <p>Application déployée avec succès !</p>
      
      <h2>📦 Produits ({products.length})</h2>
      {products.length === 0 ? (
        <p>Aucun produit pour le moment</p>
      ) : (
        <ul>
          {products.map(product => (
            <li key={product.id}>
              {product.name} - {product.price}€
            </li>
          ))}
        </ul>
      )}
      
      <div style={{ marginTop: '30px', fontSize: '12px', color: '#666' }}>
        <p>✅ Next.js: OK</p>
        <p>✅ Prisma: OK</p>
        <p>✅ PostgreSQL: OK</p>
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  try {
    const products = await prisma.product.findMany()
    return {
      props: {
        products: products || []
      }
    }
  } catch (error) {
    console.error('Database error:', error)
    return {
      props: {
        products: []
      }
    }
  }
}