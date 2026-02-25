import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Sale } from '../../../shared/src'
import { formatPrice, formatDateTime } from '../../../shared/src'
import toast from 'react-hot-toast'

export default function SalesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedStatut, setSelectedStatut] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchSales()
  }, [session, status, router, currentPage, searchQuery, dateFrom, dateTo, selectedStatut])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(selectedStatut && { statut: selectedStatut })
      })

      const response = await fetch(`/api/sales?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setSales(data.sales)
        setTotalPages(data.pagination.totalPages)
      } else {
        toast.error('Erreur lors du chargement des ventes')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const getStatutBadge = (statut: string) => {
    const statusConfig = {
      'COMPLETED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Terminée' },
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' },
      'REFUNDED': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Remboursée' }
    }

    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig.PENDING
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const getPaymentModeBadge = (mode: string) => {
    const modeConfig = {
      'CASH': { bg: 'bg-green-50', text: 'text-green-700', label: 'Espèces' },
      'CARD': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Carte' },
      'CHECK': { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Chèque' },
      'TRANSFER': { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Virement' }
    }

    const config = modeConfig[mode as keyof typeof modeConfig] || modeConfig.CASH
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs rounded ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const resetFilters = () => {
    setSearchQuery('')
    setDateFrom('')
    setDateTo('')
    setSelectedStatut('')
    setCurrentPage(1)
  }

  if (status === 'loading') {
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Ventes</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/pos')}
              className="btn-primary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nouvelle Vente
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recherche
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Numéro, vendeur..."
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
                className="input"
              >
                <option value="">Tous les statuts</option>
                <option value="COMPLETED">Terminée</option>
                <option value="PENDING">En attente</option>
                <option value="CANCELLED">Annulée</option>
                <option value="REFUNDED">Remboursée</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="btn-secondary w-full"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des ventes */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune vente trouvée</h3>
              <p className="text-gray-500 mb-4">Commencez par créer votre première vente.</p>
              <button
                onClick={() => router.push('/pos')}
                className="btn-primary"
              >
                Nouvelle Vente
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Articles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total TTC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paiement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.map((sale: any) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{sale.ticketNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          N° {sale.numero}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDateTime(sale.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {sale.vendeur?.nom && sale.vendeur?.prenom 
                            ? `${sale.vendeur.prenom} ${sale.vendeur.nom}`
                            : sale.vendeur?.email
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {sale.items?.length || 0} article(s)
                        </div>
                        <div className="text-sm text-gray-500">
                          {sale.items?.reduce((total: number, item: any) => total + item.quantite, 0) || 0} unité(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(Number(sale.totalTTC))}
                        </div>
                        {sale.remise && Number(sale.remise) > 0 && (
                          <div className="text-sm text-green-600">
                            -{sale.remise}% remise
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {sale.payments?.map((payment: any, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              {getPaymentModeBadge(payment.mode)}
                              <span className="text-sm text-gray-900">
                                {formatPrice(Number(payment.montant))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatutBadge(sale.statut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/sales/${sale.id}`)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Voir les détails"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          {session.user.role === 'ADMIN' && sale.statut === 'COMPLETED' && (
                            <button
                              onClick={() => {
                                // TODO: Implémenter l'annulation de vente
                                toast.error('Fonctionnalité non implémentée')
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Annuler la vente"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-700">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}