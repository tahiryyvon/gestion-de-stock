import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  if (req.method === 'GET') {
    try {
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const todayEnd = new Date(todayStart)
      todayEnd.setDate(todayEnd.getDate() + 1)

      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1)

      // Statistiques de base
      const [
        totalProduits,
        totalCategories,
        totalVentesToday,
        totalVentesMonth,
        produitsRupture,
        produitsAlerte,
        recentSales
      ] = await Promise.all([
        // Nombre total de produits actifs
        prisma.product.count({
          where: { actif: true }
        }),
        
        // Nombre total de catégories actives
        prisma.category.count({
          where: { actif: true }
        }),
        
        // CA du jour
        prisma.sale.aggregate({
          where: {
            createdAt: {
              gte: todayStart,
              lt: todayEnd
            },
            statut: 'COMPLETED'
          },
          _sum: {
            totalTTC: true
          },
          _count: true
        }),
        
        // CA du mois
        prisma.sale.aggregate({
          where: {
            createdAt: {
              gte: thisMonthStart,
              lt: nextMonthStart
            },
            statut: 'COMPLETED'
          },
          _sum: {
            totalTTC: true
          },
          _count: true
        }),
        
        // Produits en rupture de stock (stock = 0)
        prisma.$queryRaw`
          SELECT COUNT(*)::integer as count
          FROM "Product" p
          WHERE p.actif = true
          AND (
            SELECT COALESCE(SUM(sm.quantite), 0)
            FROM "StockMovement" sm
            WHERE sm."productId" = p.id
            AND sm.statut = 'VALIDATED'
          ) = 0
        `,
        
        // Produits en alerte (stock <= seuil)
        prisma.$queryRaw`
          SELECT COUNT(*)::integer as count
          FROM "Product" p
          WHERE p.actif = true
          AND (
            SELECT COALESCE(SUM(sm.quantite), 0)
            FROM "StockMovement" sm
            WHERE sm."productId" = p.id
            AND sm.statut = 'VALIDATED'
          ) <= p."seuilStock"
          AND (
            SELECT COALESCE(SUM(sm.quantite), 0)
            FROM "StockMovement" sm
            WHERE sm."productId" = p.id
            AND sm.statut = 'VALIDATED'
          ) > 0
        `,
        
        // Dernières ventes
        prisma.sale.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                role: true
              }
            },
            items: {
              include: {
                product: {
                  select: {
                    nom: true
                  }
                }
              }
            }
          }
        })
      ])

      // Calculer la valeur du stock
      const stockValue = await prisma.$queryRaw<Array<{total: number}>>`
        SELECT COALESCE(SUM(
          (SELECT COALESCE(SUM(sm.quantite), 0)
           FROM "StockMovement" sm
           WHERE sm."productId" = p.id
           AND sm.statut = 'VALIDATED') * p."prixAchat"
        ), 0)::float as total
        FROM "Product" p
        WHERE p.actif = true
      `

      // Ventes par jour (7 derniers jours)
      const salesByDay = await prisma.$queryRaw<Array<{date: string, total: number, count: number}>>`
        SELECT 
          DATE(s."createdAt") as date,
          COALESCE(SUM(s."totalTTC"), 0)::float as total,
          COUNT(*)::integer as count
        FROM "Sale" s
        WHERE s."createdAt" >= CURRENT_DATE - INTERVAL '7 days'
        AND s.statut = 'COMPLETED'
        GROUP BY DATE(s."createdAt")
        ORDER BY date DESC
      `

      // Top 5 des produits les plus vendus (ce mois)
      const topProducts = await prisma.$queryRaw<Array<{
        productId: string,
        nom: string,
        totalQuantite: number,
        totalCA: number
      }>>`
        SELECT 
          p.id as "productId",
          p.nom,
          COALESCE(SUM(si.quantite), 0)::integer as "totalQuantite",
          COALESCE(SUM(si.quantite * si."prixUnitaire"), 0)::float as "totalCA"
        FROM "Product" p
        LEFT JOIN "SaleItem" si ON si."productId" = p.id
        LEFT JOIN "Sale" s ON s.id = si."saleId"
        WHERE s."createdAt" >= $1
        AND s.statut = 'COMPLETED'
        GROUP BY p.id, p.nom
        HAVING SUM(si.quantite) > 0
        ORDER BY "totalQuantite" DESC
        LIMIT 5
      ` as any[]

      const stats = {
        // Statistiques principales
        totalProduits,
        totalCategories,
        caJour: Number(totalVentesToday._sum.totalTTC || 0),
        ventesJour: totalVentesToday._count,
        caMois: Number(totalVentesMonth._sum.totalTTC || 0),
        ventesMois: totalVentesMonth._count,
        valeurStock: stockValue[0]?.total || 0,
        produitsRupture: (produitsRupture as any)[0]?.count || 0,
        produitsAlerte: (produitsAlerte as any)[0]?.count || 0,
        
        // Données pour les graphiques
        salesByDay: salesByDay.map((day: any) => ({
          date: day.date,
          total: Number(day.total),
          count: day.count
        })),
        
        topProducts: (topProducts as any[]).map((product: any) => ({
          productId: product.productId,
          nom: product.nom,
          totalQuantite: product.totalQuantite,
          totalCA: Number(product.totalCA)
        })),
        
        // Activité récente
        recentSales: recentSales.map((sale: any) => ({
          id: sale.id,
          ticketNumber: sale.ticketNumber,
          totalTTC: Number(sale.totalTTC),
          createdAt: sale.createdAt,
          vendeur: sale.vendeur,
          itemsCount: sale.items.length
        }))
      }

      return res.json(stats)

    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error)
      return res.status(500).json({ error: 'Erreur serveur' })
    }
  }

  res.setHeader('Allow', ['GET'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}