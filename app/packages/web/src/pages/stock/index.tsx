import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { StockMovement, Product } from '@gestion-stock/shared'
import { formatPrice, formatDateTime } from '@gestion-stock/shared'
import toast from 'react-hot-toast'

export default function StockPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [movements, setMovements] = useState<any[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedType, setSelectedType] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
      return
    }
    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    fetchMovements()
    fetchProducts()
  }, [session, status, router, currentPage, searchQuery, selectedType, selectedProduct, dateFrom, dateTo])

  const fetchMovements = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(selectedType && { type: selectedType }),
        ...(selectedProduct && { productId: selectedProduct }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      })

      const response = await fetch(`/api/stock?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setMovements(data.movements)
        setTotalPages(data.pagination.totalPages)
      } else {
        toast.error('Erreur lors du chargement des mouvements')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=1000&actif=true')
      const data = await response.json()
      
      if (response.ok) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
    }
  }

  const getTypeLabel = (type: string) => {
    const types = {
      'ENTRY': { label: 'Entrée', bg: 'bg-green-100', text: 'text-green-800' },
      'EXIT_SALE': { label: 'Vente', bg: 'bg-blue-100', text: 'text-blue-800' },
      'EXIT_MANUAL': { label: 'Sortie', bg: 'bg-red-100', text: 'text-red-800' }
    }

    const config = types[type as keyof typeof types] || types.ENTRY
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedType('')
    setSelectedProduct('')
    setDateFrom('')
    setDateTo('')
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

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Gestion du Stock</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nouveau Mouvement
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recherche
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Produit, référence..."
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input"
              >
                <option value="">Tous les types</option>
                <option value="ENTRY">Entrées</option>
                <option value="EXIT_SALE">Ventes</option>
                <option value="EXIT_MANUAL">Sorties manuelles</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produit
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="input"
              >
                <option value="">Tous les produits</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.nom}
                  </option>
                ))}
              </select>
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

        {/* Liste des mouvements */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun mouvement trouvé</h3>
              <p className="text-gray-500 mb-4">Commencez par ajouter un mouvement de stock.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                Nouveau Mouvement
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix unitaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Motif
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDateTime(movement.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {movement.product.imageUrl ? (
                            <img 
                              src={movement.product.imageUrl} 
                              alt="" 
                              className="w-8 h-8 rounded object-cover mr-3"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-100 rounded mr-3 flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {movement.product.nom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {movement.product.reference}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeLabel(movement.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          movement.quantite > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.quantite > 0 ? '+' : ''}{movement.quantite}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatPrice(Number(movement.prixUnitaire))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {movement.motif || '-'}
                          {movement.sale && (
                            <div className="text-sm text-gray-500">
                              Vente #{movement.sale.ticketNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {movement.createdByUser?.nom && movement.createdByUser?.prenom 
                            ? `${movement.createdByUser.prenom} ${movement.createdByUser.nom}`
                            : movement.createdByUser?.email
                          }
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

      {/* Modal d'ajout de mouvement */}
      <AddMovementModal 
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        products={products}
        onSuccess={() => {
          fetchMovements()
          setShowAddModal(false)
        }}
      />
    </DashboardLayout>
  )
}

function AddMovementModal({ 
  show, 
  onClose, 
  products, 
  onSuccess 
}: {
  show: boolean
  onClose: () => void
  products: Product[]
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    productId: '',
    type: 'ENTRY' as 'ENTRY' | 'EXIT_MANUAL',
    quantite: '',
    prixUnitaire: '',
    motif: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.productId || !formData.quantite || !formData.prixUnitaire) {
      toast.error('Veuillez remplir tous les champs requis')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: formData.productId,
          type: formData.type,
          quantite: parseInt(formData.quantite),
          prixUnitaire: parseFloat(formData.prixUnitaire),
          motif: formData.motif || undefined
        }),
      })

      if (response.ok) {
        toast.success('Mouvement créé avec succès')
        setFormData({
          productId: '',
          type: 'ENTRY',
          quantite: '',
          prixUnitaire: '',
          motif: ''
        })
        onSuccess()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Nouveau Mouvement de Stock
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Produit *
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Sélectionnez un produit</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.nom} ({product.reference})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de mouvement *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'ENTRY' | 'EXIT_MANUAL' })}
                    className="input"
                    required
                  >
                    <option value="ENTRY">Entrée en stock</option>
                    <option value="EXIT_MANUAL">Sortie de stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantité *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantite}
                    onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                    className="input"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix unitaire *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.prixUnitaire}
                    onChange={(e) => setFormData({ ...formData, prixUnitaire: e.target.value })}
                    className="input"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motif
                  </label>
                  <textarea
                    value={formData.motif}
                    onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Motif du mouvement (optionnel)"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 btn-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Création...
                      </div>
                    ) : (
                      'Créer le mouvement'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}