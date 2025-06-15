'use client';

import React, { useState, useEffect, Fragment } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  ShieldCheck,
  Loader2,
  Clock,
  Edit,
  MoreVertical,
  AlertTriangle,
  MessageSquare,
  BadgeCheck,
} from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { format } from 'date-fns';

// --- Types et Interfaces ---
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  status: 'PENDING' | 'AVAILABLE' | 'REJECTED';
  rejectionReason?: string;
  seller?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

type FilterStatus = 'ALL' | 'PENDING' | 'AVAILABLE' | 'REJECTED';

// --- Composants de l'Interface ---

// Badge de Statut pour une identification visuelle rapide
const StatusBadge = ({ status }: { status: Product['status'] }) => {
  const statusStyles = {
    PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    AVAILABLE: 'bg-green-500/20 text-green-400 border-green-500/30',
    REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  const statusIcons = {
    PENDING: <Clock size={14} className="mr-1.5" />,
    AVAILABLE: <BadgeCheck size={14} className="mr-1.5" />,
    REJECTED: <XCircle size={14} className="mr-1.5" />,
  };
  return (
    <div
      className={` inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
        statusStyles[status] || 'bg-gray-500/20 text-gray-400'
      }`}
    >
      {statusIcons[status]}
      {status}
    </div>
  );
};

// Modale pour la raison du rejet
const RejectModal = ({
  product,
  onClose,
  onSubmit,
}: {
  product: Product;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0">
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-xl max-w-md w-full p-6 text-white animate-in zoom-in-95">
        <h3 className="text-xl font-bold mb-2">Rejeter le produit</h3>
        <p className="text-slate-400 mb-4">
          Pourquoi rejetez-vous &quot;{product.name}&quot; ?
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Soyez précis pour aider le vendeur..."
          className="w-full h-32 p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
          >
            Annuler
          </button>
          <button
            onClick={() => onSubmit(reason)}
            disabled={!reason.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Soumettre le Rejet
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Composant Principal de la Page ---
export default function VeterinarianDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [productToReject, setProductToReject] = useState<Product | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('PENDING');

  const filters: { label: string; value: FilterStatus }[] = [
    { label: 'En attente', value: 'PENDING' },
    { label: 'Approuvés', value: 'AVAILABLE' },
    { label: 'Rejetés', value: 'REJECTED' },
    { label: 'Tous', value: 'ALL' },
  ];

  useEffect(() => {
    fetchProducts(filter);
  }, [filter]);

  const fetchProducts = async (status: FilterStatus) => {
    setLoading(true);
    try {
      const url = status === 'ALL' 
        ? `/api/vet/products`
        : `/api/vet/products?status=${status}`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      toast.error('Échec du chargement des produits.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (productId: string, decision: 'APPROVE' | 'REJECT', rejectionReason?: string) => {
    setUpdatingId(productId);
    try {
      const res = await fetch(`/api/vet/review/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, rejectionReason }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'La mise à jour a échoué.');
      
      toast.success(`Produit ${decision === 'APPROVE' ? 'approuvé' : 'rejeté'}`);
      
      // Mettre à jour la liste des produits pour refléter le changement
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      
    } catch (err: any) {
      toast.error(err.message || 'Une erreur est survenue.');
    } finally {
      setUpdatingId(null);
      setProductToReject(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/70 to-slate-900">
        <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black min-h-screen bg-gradient-to-br   from-primary via-teal-50 to-pink-50 text-gray-800 font-sans relative overflow-hidden dark:bg-gray-950 dark:text-gray-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* En-tête de la page */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <ShieldCheck className="text-blue-400" size={36} strokeWidth={2} />
              Tableau de Bord Vétérinaire
            </h1>
            <p className="text-slate-400 mt-2">Examinez et validez les produits soumis par les vendeurs.</p>
          </div>
          <div className="flex-shrink-0 bg-slate-800/50 border border-slate-700 rounded-full p-1.5 flex items-center gap-2">
            {filters.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                  filter === value ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {/* Section principale avec les produits */}
        <main className="space-y-6">
          {products.length === 0 ? (
            <div className="text-center py-24 bg-slate-800/40 rounded-2xl border border-dashed border-slate-700">
              <BadgeCheck className="w-16 h-16 text-slate-500 mx-auto mb-4" strokeWidth={1}/>
              <h3 className="text-xl font-semibold text-slate-200">Tout est à jour !</h3>
              <p className="text-slate-400 mt-2">Aucun produit ne correspond au filtre &apos;{filter.toLowerCase()}&apos;.</p>
            </div>
          ) : (
            products.map((product) => (
              <article key={product.id} className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10">
                <div className="flex flex-col md:flex-row">
                  {/* Image du produit */}
                  <div className="relative md:w-56 h-56 md:h-auto flex-shrink-0">
                    <Image
                      src={product.imageUrl || 'https://placehold.co/400x400/0f172a/38bdf8?text=Image'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Informations du produit */}
                  <div className="flex-grow p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                        <p className="text-sm text-slate-400 mt-1">
                          Vendu par : <strong className="font-medium text-slate-300">{product.seller?.name || 'N/A'}</strong>
                        </p>
                      </div>
                      <StatusBadge status={product.status} />
                    </div>
                    <p className="mt-4 text-slate-300 leading-relaxed text-sm line-clamp-3">{product.description}</p>
                    {product.status === 'REJECTED' && product.rejectionReason && (
                      <div className="mt-4 p-3 bg-red-900/40 border-l-4 border-red-500 rounded-r-lg text-red-300 text-sm italic">
                        <strong>Raison du rejet :</strong> &quot;{product.rejectionReason}&quot;
                      </div>
                    )}
                  </div>

                  {/* Actions du vétérinaire */}
                  <div className="bg-slate-900/50 md:bg-transparent p-4 md:p-6 md:border-l border-slate-700 flex flex-row md:flex-col gap-3 justify-center items-center flex-shrink-0 md:w-48">
                    {product.status === 'PENDING' ? (
                      <>
                        <button
                          disabled={updatingId === product.id}
                          onClick={() => handleReview(product.id, 'APPROVE')}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                        >
                          {updatingId === product.id ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                          Approuver
                        </button>
                        <button
                          disabled={updatingId === product.id}
                          onClick={() => setProductToReject(product)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition transform hover:scale-105 disabled:opacity-50"
                        >
                          <XCircle size={20} />
                          Rejeter
                        </button>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500 text-center">
                        Examen terminé le {format(new Date(product.createdAt), 'dd/MM/yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </main>
      </div>

      {/* Affichage de la modale */}
      {productToReject && (
        <RejectModal
          product={productToReject}
          onClose={() => setProductToReject(null)}
          onSubmit={(reason) => {
            handleReview(productToReject.id, 'REJECT', reason);
          }}
        />
      )}
    </div>
  );
}
