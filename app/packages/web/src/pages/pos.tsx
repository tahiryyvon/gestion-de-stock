import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Product, CartItem, SaleData } from '@gestion-stock/shared'
import { formatPrice, generateTicketNumber } from '@gestion-stock/shared'
import toast from 'react-hot-toast'

export default function POSPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<(Product & { stockActuel: number })[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<(Product & { stockActuel: number })[]>([])
  const [isProcessingSale, setIsProcessingSale] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'CARD' | 'CHECK' | 'TRANSFER'>('CASH')
  const [cashReceived, setCashReceived] = useState<number>(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchProducts()
  }, [session, status, router])

  useEffect(() => {
    // Filtrer les produits selon la recherche
    if (searchQuery.trim() === '') {
      setFilteredProducts(products.slice(0, 12)) // Limiter à 12 pour l'affichage
    } else {
      const filtered = products.filter(product => 
        product.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.codeBarre?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredProducts(filtered.slice(0, 12))
    }
  }, [searchQuery, products])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100&actif=true')
      const data = await response.json()
      
      if (response.ok) {
        setProducts(data.products)
        setFilteredProducts(data.products.slice(0, 12))
      } else {
        toast.error('Erreur lors du chargement des produits')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const addToCart = (product: Product & { stockActuel: number }) => {
    if (product.stockActuel <= 0) {
      toast.error('Produit en rupture de stock')
      return
    }

    const existingItem = cart.find(item => item.productId === product.id)
    
    if (existingItem) {
      if (existingItem.quantity >= product.stockActuel) {
        toast.error('Stock insuffisant')
        return
      }
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        productId: product.id,
        product,
        quantity: 1,
        prixUnitaire: Number(product.prixVente),
        remise: 0
      }])
    }

    // Remettre le focus sur la recherche
    searchInputRef.current?.focus()
    setSearchQuery('')
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const product = products.find(p => p.id === productId)
    if (product && newQuantity > product.stockActuel) {
      toast.error('Stock insuffisant')
      return
    }

    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const calculateTotals = () => {
    const totalHT = cart.reduce((total, item) => {
      const itemTotal = item.quantity * item.prixUnitaire * (1 - (item.remise || 0) / 100)
      const itemHT = itemTotal / (1 + Number(item.product.tva) / 100)
      return total + itemHT
    }, 0)

    const totalTVA = cart.reduce((total, item) => {
      const itemTotal = item.quantity * item.prixUnitaire * (1 - (item.remise || 0) / 100)
      const itemHT = itemTotal / (1 + Number(item.product.tva) / 100)
      const itemTVA = itemHT * Number(item.product.tva) / 100
      return total + itemTVA
    }, 0)

    const totalTTC = totalHT + totalTVA

    return { totalHT, totalTVA, totalTTC }
  }

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error('Le panier est vide')
      return
    }

    const { totalHT, totalTVA, totalTTC } = calculateTotals()

    if (paymentMode === 'CASH' && cashReceived < totalTTC) {
      toast.error('Montant insuffisant')
      return
    }

    setIsProcessingSale(true)

    try {
      const saleData: SaleData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          prixUnitaire: item.prixUnitaire,
          tva: Number(item.product.tva),
          remise: item.remise || 0
        })),
        payments: [{
          mode: paymentMode,
          montant: paymentMode === 'CASH' ? cashReceived : totalTTC
        }],
        remise: 0
      }

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      })

      if (response.ok) {
        const sale = await response.json()
        toast.success(`Vente enregistrée - Ticket #${sale.numero}`)
        
        // Afficher le rendu de monnaie si paiement en espèces
        if (paymentMode === 'CASH' && cashReceived > totalTTC) {
          const change = cashReceived - totalTTC
          toast.success(`Monnaie à rendre: ${formatPrice(change)}`)
        }

        // Réinitialiser
        clearCart()
        setShowPaymentModal(false)
        setCashReceived(0)
        setPaymentMode('CASH')
        fetchProducts() // Recharger pour mettre à jour les stocks
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la vente')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setIsProcessingSale(false)
    }
  }

  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.length > 0) {
      // Rechercher par code-barres
      const product = products.find(p => 
        p.codeBarre === searchQuery || 
        p.reference === searchQuery
      )
      
      if (product) {
        addToCart(product)
      } else {
        toast.error('Produit non trouvé')
      }
    }
  }

  const { totalHT, totalTVA, totalTTC } = calculateTotals()

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
      <div className="h-full flex flex-col">
        {/* En-tête */}
        <div className="flex-shrink-0 bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Point de Vente</h1>
            <div className="text-sm text-gray-500">
              Vendeur: {session.user.name || session.user.email}
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Zone produits - Gauche */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Barre de recherche */}
            <div className="flex-shrink-0 p-4 bg-white border-b">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleBarcodeInput}
                  placeholder="Rechercher ou scanner un code-barres..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-lg"
                  autoFocus
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Grille de produits */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.stockActuel <= 0}
                    className={`p-4 text-left border rounded-lg transition-colors ${
                      product.stockActuel <= 0
                        ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                        : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    <div className="aspect-square mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.nom}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                      {product.nom}
                    </h3>
                    <p className="text-lg font-bold text-primary-600 mb-1">
                      {formatPrice(Number(product.prixVente))}
                    </p>
                    <p className="text-xs text-gray-500">
                      Stock: {product.stockActuel}
                    </p>
                    {product.stockActuel <= 0 && (
                      <p className="text-xs text-red-600 font-medium mt-1">
                        Rupture de stock
                      </p>
                    )}
                  </button>
                ))}
              </div>

              {filteredProducts.length === 0 && searchQuery && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun produit trouvé pour "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Panier - Droite */}
          <div className="w-96 bg-white border-l flex flex-col">
            {/* En-tête du panier */}
            <div className="flex-shrink-0 p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Panier ({cart.length})</h2>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Vider
                  </button>
                )}
              </div>
            </div>

            {/* Articles du panier */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v5a2 2 0 11-4 0v-5m4 0V8a2 2 0 00-2-2H7a2 2 0 00-2 2v5z" />
                  </svg>
                  <p>Panier vide</p>
                  <p className="text-sm">Ajoutez des produits pour commencer</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">
                        {item.product.nom}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.prixUnitaire)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total et paiement */}
            {cart.length > 0 && (
              <div className="flex-shrink-0 border-t p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total HT:</span>
                    <span>{formatPrice(totalHT)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>TVA:</span>
                    <span>{formatPrice(totalTVA)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total TTC:</span>
                    <span className="text-primary-600">{formatPrice(totalTTC)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full btn-primary py-3 text-lg"
                >
                  Procéder au paiement
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Finaliser le paiement
                  </h3>

                  <div className="mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-center">
                        Total à payer: {formatPrice(totalTTC)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mode de paiement
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'CASH', label: 'Espèces' },
                        { value: 'CARD', label: 'Carte bancaire' },
                        { value: 'CHECK', label: 'Chèque' },
                        { value: 'TRANSFER', label: 'Virement' }
                      ].map((mode) => (
                        <label key={mode.value} className="flex items-center">
                          <input
                            type="radio"
                            value={mode.value}
                            checked={paymentMode === mode.value}
                            onChange={(e) => setPaymentMode(e.target.value as any)}
                            className="mr-3"
                          />
                          {mode.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {paymentMode === 'CASH' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Montant reçu (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={totalTTC}
                        value={cashReceived}
                        onChange={(e) => setCashReceived(Number(e.target.value))}
                        className="input"
                        placeholder={totalTTC.toFixed(2)}
                      />
                      {cashReceived > totalTTC && (
                        <p className="mt-2 text-sm text-green-600">
                          Monnaie à rendre: {formatPrice(cashReceived - totalTTC)}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowPaymentModal(false)
                        setCashReceived(0)
                      }}
                      className="flex-1 btn-secondary"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={isProcessingSale || (paymentMode === 'CASH' && cashReceived < totalTTC)}
                      className="flex-1 btn-primary disabled:opacity-50"
                    >
                      {isProcessingSale ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Traitement...
                        </div>
                      ) : (
                        'Confirmer le paiement'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}