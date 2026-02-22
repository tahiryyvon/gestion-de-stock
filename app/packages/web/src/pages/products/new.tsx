import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { ProductSchema, ProductData, Category } from '@gestion-stock/shared'
import toast from 'react-hot-toast'

interface ProductFormData extends ProductData {
  stockInitial?: number
}

const ProductFormSchema = ProductSchema.extend({
  stockInitial: ProductSchema.shape.seuilAlerte.optional(),
})

export default function NewProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      tva: 20.0,
      seuilAlerte: 5,
      actif: true,
      stockInitial: 0
    }
  })

  const prixAchat = watch('prixAchat')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
      return
    }
    if (session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }
    fetchCategories()
  }, [session, status, router])

  // Calcul automatique du prix de vente avec une marge de 30%
  useEffect(() => {
    if (prixAchat && prixAchat > 0) {
      const prixVenteSugere = prixAchat * 1.3
      setValue('prixVente', Number(prixVenteSugere.toFixed(2)))
    }
  }, [prixAchat, setValue])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Produit créé avec succès!')
        router.push('/products')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création du produit')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setIsSubmitting(false)
    }
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau produit</h1>
          <p className="mt-1 text-sm text-gray-600">
            Ajoutez un nouveau produit à votre catalogue
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Informations générales
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Nom du produit *</label>
                <input
                  {...register('nom')}
                  type="text"
                  className="input"
                  placeholder="Ex: iPhone 15 Pro"
                />
                {errors.nom && (
                  <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>
                )}
              </div>

              <div>
                <label className="label">Référence *</label>
                <input
                  {...register('reference')}
                  type="text"
                  className="input"
                  placeholder="Ex: IP15P-128-BLK"
                />
                {errors.reference && (
                  <p className="mt-1 text-sm text-red-600">{errors.reference.message}</p>
                )}
              </div>

              <div>
                <label className="label">Code-barres</label>
                <input
                  {...register('codeBarre')}
                  type="text"
                  className="input"
                  placeholder="Ex: 1234567890123"
                />
                {errors.codeBarre && (
                  <p className="mt-1 text-sm text-red-600">{errors.codeBarre.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="label">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="input"
                  placeholder="Description détaillée du produit..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="label">Catégorie</label>
                <select {...register('categorieId')} className="input">
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categorieId && (
                  <p className="mt-1 text-sm text-red-600">{errors.categorieId.message}</p>
                )}
              </div>

              <div>
                <label className="label">URL de l'image</label>
                <input
                  {...register('imageUrl')}
                  type="url"
                  className="input"
                  placeholder="https://example.com/image.jpg"
                />
                {errors.imageUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Tarification
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="label">Prix d'achat (€) *</label>
                <input
                  {...register('prixAchat', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  placeholder="0.00"
                />
                {errors.prixAchat && (
                  <p className="mt-1 text-sm text-red-600">{errors.prixAchat.message}</p>
                )}
              </div>

              <div>
                <label className="label">Prix de vente (€) *</label>
                <input
                  {...register('prixVente', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  placeholder="0.00"
                />
                {errors.prixVente && (
                  <p className="mt-1 text-sm text-red-600">{errors.prixVente.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Suggestion automatique basée sur une marge de 30%
                </p>
              </div>

              <div>
                <label className="label">TVA (%)</label>
                <input
                  {...register('tva', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="input"
                />
                {errors.tva && (
                  <p className="mt-1 text-sm text-red-600">{errors.tva.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Gestion du stock
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="label">Stock initial</label>
                <input
                  {...register('stockInitial', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="input"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Quantité à ajouter lors de la création du produit
                </p>
              </div>

              <div>
                <label className="label">Seuil d'alerte *</label>
                <input
                  {...register('seuilAlerte', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="input"
                />
                {errors.seuilAlerte && (
                  <p className="mt-1 text-sm text-red-600">{errors.seuilAlerte.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Niveau minimum avant alerte de réapprovisionnement
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </div>
              ) : (
                'Créer le produit'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}