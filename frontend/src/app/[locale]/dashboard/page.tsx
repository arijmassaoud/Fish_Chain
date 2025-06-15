'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    Package,
    DollarSign,
    Activity,
    Loader2,
    ClipboardList,
} from 'lucide-react';

// --- Interfaces et Types ---
interface Stats {
    totalUsers: number;
    totalProducts: number;
    totalRevenue: number;
    pendingApproval: number;
    reservationsByStatus: Array<{ status: string; _sum: { totalAmount: number | null } }>;
    usersByRole: Array<{ role: string; _count: { id: number } }>;
}
interface Reservation {
    id: string;
    /* ...autres champs de réservation */
}
interface ActivityItem {
    id: string;
    type: 'USER_REGISTRATION' | 'NEW_ORDER';
    text: string;
    details: string;
    timestamp: string;
}

// --- Sous-composants pour la clarté ---
const StatsCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) => (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-5 shadow-lg transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10">
        <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <Icon className="w-5 h-5 text-slate-500" />
        </div>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
);

const ChartContainer = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-5 shadow-lg h-80">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
    </div>
);

const RecentActivityList = ({ activities }: { activities: ActivityItem[] }) => (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-5 shadow-lg h-full">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Activity size={20} className="mr-2 text-slate-400" /> Activité Récente
        </h3>
        <div className="space-y-4">
            {activities.length > 0 ? (
                activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 text-sm">
                        <div
                            className={`mt-1 flex-shrink-0 w-3 h-3 rounded-full ${
                                activity.type === 'USER_REGISTRATION' ? 'bg-blue-400' : 'bg-green-400'
                            }`}
                        ></div>
                        <div>
                            <p className="text-slate-300">{activity.text}</p>
                            <p className="text-xs text-slate-500">
                                {format(new Date(activity.timestamp), "dd/MM/yy 'à' HH:mm", { locale: fr })}
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-slate-500 text-center py-8">Aucune activité récente à afficher.</p>
            )}
        </div>
    </div>
);

// --- Composant Principal de la Page ---
export default function AdminDashboardPage() {
    const { user, getAuthHeaders } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || user.role !== 'ADMIN') return;
            setLoading(true);
            try {
                const headers = getAuthHeaders();
                const [statsRes, activityRes, reservationsRes] = await Promise.all([
                    fetch('/api/admin/stats', { headers }),
                    fetch('/api/admin/activity', { headers }),
                    fetch('/api/reservations', { headers }), // Nouvel appel API
                ]);

                if (!statsRes.ok || !activityRes.ok || !reservationsRes.ok) throw new Error("Échec du chargement des données.");

                const statsData = await statsRes.json();
                const activityData = await activityRes.json();
                const reservationsData = await reservationsRes.json();

                setStats(statsData.data);
                setReservations(reservationsData.data);

                const combinedActivities = [
                    ...(activityData.data.recentUsers || []).map((u) => ({
                        id: `u-${u.id}`,
                        type: 'USER_REGISTRATION',
                        text: `Nouvel utilisateur : ${u.name}`,
                        details: u.name,
                        timestamp: u.createdAt,
                    })),
                    ...(activityData.data.recentReservations || []).map((r) => ({
                        id: `r-${r.id}`,
                        type: 'NEW_ORDER',
                        text: `Nouvelle commande de ${r.user.name}`,
                        details: `${r.totalAmount.toFixed(2)} €`,
                        timestamp: r.createdAt,
                    })),
                ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                setActivities(combinedActivities.slice(0, 10));
            } catch (err: any) {
                toast.error(err.message || "Une erreur est survenue.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, getAuthHeaders]);

    // --- Gestion des données pour les graphiques ---

    // Données pour le diagramme en barres (Revenus par Statut de Commande)
    const barChartData = useMemo(() => {
        return (stats?.reservationsByStatus || []).map((status) => ({
            name: status.status,
            Revenu: status._sum.totalAmount || 0,
        }));
    }, [stats?.reservationsByStatus]);

    // Données pour le diagramme en camembert (Répartition des Utilisateurs)
    const pieChartData = useMemo(() => {
        return (stats?.usersByRole || []).map((role) => ({
            name: role.role,
            value: role._count.id,
        }));
    }, [stats?.usersByRole]);

    const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/70 to-slate-900">
                <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/70 to-slate-900">
                <p>Impossible de charger les données du tableau de bord.</p>
            </div>
        );
    }

    return (
        <div
            className="text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-800"
        >
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                <header>
                    <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                        <LayoutDashboard className="text-blue-400" size={36} /> Tableau de Bord
                    </h1>
                    <p className="text-slate-400 mt-2">Vue d'ensemble de l'activité de la plateforme.</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard title="Revenu Total" value={`${(stats.totalRevenue || 0).toFixed(2)} €`} icon={DollarSign} />
                    <StatsCard title="Commandes" value={reservations.length} icon={ShoppingCart} />
                    <StatsCard title="Utilisateurs" value={stats.totalUsers || 0} icon={Users} />
                    <StatsCard title="Produits en attente" value={stats.pendingApproval || 0} icon={ClipboardList} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <ChartContainer title="Revenus par Statut de Commande">
                            <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}€`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        color: '#e2e8f0',
                                    }}
                                />
                                <Bar dataKey="Revenu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </div>
                    <div>
                        <ChartContainer title="Répartition des Utilisateurs">
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: "12px" }} />
                            </PieChart>
                        </ChartContainer>
                    </div>
                </div>

                <div>
                    <RecentActivityList activities={activities} />
                </div>
            </div>
        </div>
    );
}