import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { formatPrice, formatDateTime } from '../../shared/src'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalProduits: number
  totalCategories: number
  caJour: number
  ventesJour: number
  caMois: number
  ventesMois: number
  valeurStock: number
  produitsRupture: number
  produitsAlerte: number
  salesByDay: Array<{
    date: string
    total: number
    count: number
  }>
  topProducts: Array<{
    productId: string
    nom: string
    totalQuantite: number
    totalCA: number
  }>
  recentSales: Array<{
    id: string
    ticketNumber: string
    totalTTC: number
    createdAt: string
    vendeur: any
    itemsCount: number
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchStats()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      
      if (response.ok) {
        setStats(data)
      } else {
        toast.error('Erreur lors du chargement des statistiques')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble de votre activité
          </p>
        </div>

        {stats && (
          <>
            {/* Cartes de statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="CA du jour"
                value={formatPrice(stats.caJour)}
                subtitle={`${stats.ventesJour} vente${stats.ventesJour > 1 ? 's' : ''}`}
                icon="💰"
                color="green"
              />
              <StatCard
                title="CA du mois"
                value={formatPrice(stats.caMois)}
                subtitle={`${stats.ventesMois} vente${stats.ventesMois > 1 ? 's' : ''}`}
                icon="📈"
                color="blue"
              />
              <StatCard
                title="Valeur du stock"
                value={formatPrice(stats.valeurStock)}
                subtitle={`${stats.totalProduits} produit${stats.totalProduits > 1 ? 's' : ''}`}
                icon="📦"
                color="purple"
              />
              <StatCard
                title="Alertes stock"
                value={stats.produitsRupture + stats.produitsAlerte}
                subtitle={`${stats.produitsRupture} rupture${stats.produitsRupture > 1 ? 's' : ''}`}
                icon="⚠️"
                color="red"
              />
            </div>

            {/* Grille principale */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Évolution des ventes */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Ventes des 7 derniers jours</h3>
                <div className="space-y-4">
                  {stats.salesByDay.length > 0 ? (
                    stats.salesByDay.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">
                            {new Date(day.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {day.count} vente{day.count > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="font-semibold text-primary-600">
                          {formatPrice(day.total)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Aucune vente cette semaine</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Activité récente */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Activité récente</h3>
                  <button
                    onClick={() => router.push('/sales')}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    Voir tout
                  </button>
                </div>
                <div className="space-y-3">
                  {stats.recentSales.length > 0 ? (
                    stats.recentSales.map((sale) => (
                      <div key={sale.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Vente #{sale.ticketNumber}
                            </p>
                            <p className="text-sm font-semibold text-green-600">
                              {formatPrice(sale.totalTTC)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {sale.itemsCount} article{sale.itemsCount > 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(sale.createdAt).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Aucune activité récente</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top produits */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Produits les plus vendus (ce mois)</h3>
              <div className="space-y-4">
                {stats.topProducts.length > 0 ? (
                  stats.topProducts.map((product, index) => (
                    <div key={product.productId} className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{product.nom}</div>
                        <div className="text-sm text-gray-500">
                          {product.totalQuantite} unité{product.totalQuantite > 1 ? 's' : ''} vendues
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary-600">
                          {formatPrice(product.totalCA)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucune vente ce mois</p>
                  </div>
                )}
              </div>
            </div>

            {/* Boutons d'actions rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/pos')}
                className="flex items-center justify-center p-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v5a2 2 0 11-4 0v-5m4 0V8a2 2 0 00-2-2H7a2 2 0 00-2 2v5z" />
                </svg>
                <div>
                  <div className="font-semibold">Nouvelle Vente</div>
                  <div className="text-sm opacity-90">Ouvrir la caisse</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/products')}
                className="flex items-center justify-center p-6 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <div>
                  <div className="font-semibold">Gérer Produits</div>
                  <div className="text-sm opacity-70">Catalogue</div>
                </div>
              </button>

              {session.user.role === 'ADMIN' && (
                <button
                  onClick={() => router.push('/stock')}
                  className="flex items-center justify-center p-6 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  <div>
                    <div className="font-semibold">Gérer Stock</div>
                    <div className="text-sm opacity-70">Inventaire</div>
                  </div>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color 
}: {
  title: string
  value: string | number
  subtitle: string
  icon: string
  color: 'green' | 'blue' | 'purple' | 'red'
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600'
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}