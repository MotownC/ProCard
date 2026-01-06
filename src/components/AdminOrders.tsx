import React, { useState, useEffect } from 'react';
import { Clock, Mail, Phone, FileText, Trash2, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { subscribeToCustomOrders, deleteCustomOrder, CustomOrder } from '../utils/firebase';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    const unsubscribe = subscribeToCustomOrders((fetchedOrders) => {
      setOrders(fetchedOrders);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (timestamp: number) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteCustomOrder(timestamp);
      } catch (error) {
        alert('Failed to delete order');
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white font-['Teko'] mb-2">
          CUSTOM ORDERS
        </h1>
        <p className="text-gray-400">
          Manage custom design service requests
        </p>
      </div>

      {/* Stats & Filters */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
            <p className="text-gray-400 text-sm">Total Orders</p>
            <p className="text-2xl font-bold text-white">{orders.length}</p>
          </div>
          <div className="bg-orange-500/20 border border-orange-500 rounded-lg px-4 py-2">
            <p className="text-orange-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-orange-400">{pendingCount}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
          <p className="text-gray-500">No {filter !== 'all' ? filter : ''} orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.timestamp}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Photo Preview */}
                <div className="flex-shrink-0">
                  <a
                    href={order.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative group"
                  >
                    <img
                      src={order.photoUrl}
                      alt="Customer upload"
                      className="w-full lg:w-48 h-48 object-cover rounded-lg border border-slate-600 group-hover:border-cyan-500 transition-colors"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-8 h-8 text-white" />
                    </div>
                  </a>
                </div>

                {/* Order Details */}
                <div className="flex-grow space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{order.name}</h3>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        {formatDate(order.timestamp)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'pending' ? (
                        <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500 rounded-full text-sm font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500 rounded-full text-sm font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </span>
                      )}

                      <button
                        onClick={() => handleDelete(order.timestamp)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <a
                        href={`mailto:${order.email}`}
                        className="hover:text-cyan-400 transition-colors"
                      >
                        {order.email}
                      </a>
                    </div>

                    {order.phone && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="w-4 h-4 text-cyan-400" />
                        <a
                          href={`tel:${order.phone}`}
                          className="hover:text-cyan-400 transition-colors"
                        >
                          {order.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {order.notes && (
                    <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                      <div className="flex items-start gap-2 text-gray-300">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Notes:</p>
                          <p className="text-sm">{order.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
