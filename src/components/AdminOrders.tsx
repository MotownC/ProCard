import React, { useState, useEffect, useRef } from 'react';
import { Clock, Mail, Phone, FileText, Trash2, ExternalLink, CheckCircle, Upload, Copy, DollarSign, Image, PackageCheck, MessageSquare, AlertTriangle } from 'lucide-react';
import { subscribeToCustomOrders, deleteCustomOrder, updateOrderProof, updateOrderProofRevision, updateOrderComplete, CustomOrder, OrderMessage } from '../utils/firebase';
import { uploadToCloudinary } from '../utils/cloudinary';
import { formatPrice } from '../config/pricing';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'proof_sent' | 'revision_requested' | 'paid' | 'complete'>('all');
  const [uploadingProof, setUploadingProof] = useState<number | null>(null);
  const [copiedToken, setCopiedToken] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ timestamp: number; name: string } | null>(null);
  const [pendingFrontFiles, setPendingFrontFiles] = useState<Record<number, File>>({});
  const [pendingBackFiles, setPendingBackFiles] = useState<Record<number, File>>({});
  const frontInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const backInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    const unsubscribe = subscribeToCustomOrders((fetchedOrders) => {
      setOrders(fetchedOrders);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (timestamp: number) => {
    try {
      await deleteCustomOrder(timestamp);
    } catch {
      alert('Failed to delete order');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleProofUpload = async (timestamp: number) => {
    const frontFile = pendingFrontFiles[timestamp];
    if (!frontFile) {
      alert('Please select at least a front proof image.');
      return;
    }
    const backFile = pendingBackFiles[timestamp];

    setUploadingProof(timestamp);
    try {
      // Upload front (required) and back (optional) to Cloudinary
      const proofUrl = await uploadToCloudinary(frontFile);
      let backUrl: string | undefined;
      if (backFile) {
        backUrl = await uploadToCloudinary(backFile);
      }

      const order = orders.find(o => o.timestamp === timestamp);
      let token = order?.approvalToken;
      const isRevision = !!token;

      if (token) {
        await updateOrderProofRevision(timestamp, proofUrl, undefined, backUrl);
      } else {
        token = crypto.randomUUID();
        await updateOrderProof(timestamp, proofUrl, token, backUrl);
      }

      // Clear pending files
      setPendingFrontFiles(prev => { const { [timestamp]: _, ...rest } = prev; return rest; });
      setPendingBackFiles(prev => { const { [timestamp]: _, ...rest } = prev; return rest; });

      // Send proof email to customer
      if (order?.email && token) {
        const approvalUrl = `${window.location.origin}/approve?token=${token}`;
        try {
          const resp = await fetch('/api/send-proof-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerEmail: order.email,
              customerName: order.name,
              approvalUrl,
              proofImageUrl: proofUrl,
              proofBackImageUrl: backUrl,
              isRevision,
            }),
          });
          const result = await resp.json();
          if (!resp.ok) throw new Error(result.error || 'Email send failed');
        } catch (emailErr: any) {
          alert(`Proof uploaded but email failed: ${emailErr.message}. You can copy the approval link manually.`);
        }
      }
    } catch {
      alert('Failed to upload proof image. Please try again.');
    } finally {
      setUploadingProof(null);
    }
  };

  const getApprovalUrl = (token: string) => {
    return `${window.location.origin}/approve?token=${token}`;
  };

  const copyApprovalLink = (timestamp: number, token: string) => {
    navigator.clipboard.writeText(getApprovalUrl(token));
    setCopiedToken(timestamp);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getStatusBadge = (order: CustomOrder) => {
    switch (order.status) {
      case 'complete':
        return (
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500 rounded-full text-sm font-medium flex items-center gap-1">
            <PackageCheck className="w-3 h-3" />
            Complete {order.totalPaidCents ? formatPrice(order.totalPaidCents) : ''}
          </span>
        );
      case 'paid':
        return (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500 rounded-full text-sm font-medium flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Paid {order.totalPaidCents ? formatPrice(order.totalPaidCents) : ''}
          </span>
        );
      case 'proof_sent':
        return (
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500 rounded-full text-sm font-medium flex items-center gap-1">
            <Image className="w-3 h-3" />
            Proof Sent
          </span>
        );
      case 'revision_requested':
        return (
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500 rounded-full text-sm font-medium flex items-center gap-1 animate-pulse">
            <MessageSquare className="w-3 h-3" />
            Revision Requested
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500 rounded-full text-sm font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
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
  const proofSentCount = orders.filter(o => o.status === 'proof_sent').length;
  const revisionCount = orders.filter(o => o.status === 'revision_requested').length;
  const paidCount = orders.filter(o => o.status === 'paid').length;
  const completeCount = orders.filter(o => o.status === 'complete').length;

  const handleMarkComplete = async (timestamp: number) => {
    try {
      await updateOrderComplete(timestamp);
    } catch {
      alert('Failed to mark order as complete');
    }
  };

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
      <div className="mb-6 flex gap-4 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-4 py-2 transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-800 border-2 border-cyan-500 ring-1 ring-cyan-500/50'
              : 'bg-slate-800 border border-slate-700 hover:border-slate-500'
          }`}
        >
          <p className="text-gray-400 text-sm">Total Orders</p>
          <p className="text-2xl font-bold text-white">{orders.length}</p>
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`rounded-lg px-4 py-2 transition-colors cursor-pointer ${
            filter === 'pending'
              ? 'bg-orange-500/20 border-2 border-orange-400 ring-1 ring-orange-400/50'
              : 'bg-orange-500/20 border border-orange-500 hover:border-orange-400'
          }`}
        >
          <p className="text-orange-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-orange-400">{pendingCount}</p>
        </button>
        <button
          onClick={() => setFilter('proof_sent')}
          className={`rounded-lg px-4 py-2 transition-colors cursor-pointer ${
            filter === 'proof_sent'
              ? 'bg-blue-500/20 border-2 border-blue-400 ring-1 ring-blue-400/50'
              : 'bg-blue-500/20 border border-blue-500 hover:border-blue-400'
          }`}
        >
          <p className="text-blue-400 text-sm">Proof Sent</p>
          <p className="text-2xl font-bold text-blue-400">{proofSentCount}</p>
        </button>
        <button
          onClick={() => setFilter('revision_requested')}
          className={`rounded-lg px-4 py-2 transition-colors cursor-pointer ${
            filter === 'revision_requested'
              ? 'bg-amber-500/20 border-2 border-amber-400 ring-1 ring-amber-400/50'
              : 'bg-amber-500/20 border border-amber-500 hover:border-amber-400'
          }`}
        >
          <p className="text-amber-400 text-sm">Revisions</p>
          <p className="text-2xl font-bold text-amber-400">{revisionCount}</p>
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`rounded-lg px-4 py-2 transition-colors cursor-pointer ${
            filter === 'paid'
              ? 'bg-green-500/20 border-2 border-green-400 ring-1 ring-green-400/50'
              : 'bg-green-500/20 border border-green-500 hover:border-green-400'
          }`}
        >
          <p className="text-green-400 text-sm">Paid</p>
          <p className="text-2xl font-bold text-green-400">{paidCount}</p>
        </button>
        <button
          onClick={() => setFilter('complete')}
          className={`rounded-lg px-4 py-2 transition-colors cursor-pointer ${
            filter === 'complete'
              ? 'bg-purple-500/20 border-2 border-purple-400 ring-1 ring-purple-400/50'
              : 'bg-purple-500/20 border border-purple-500 hover:border-purple-400'
          }`}
        >
          <p className="text-purple-400 text-sm">Complete</p>
          <p className="text-2xl font-bold text-purple-400">{completeCount}</p>
        </button>
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
                      {getStatusBadge(order)}

                      <button
                        onClick={() => setDeleteConfirm({ timestamp: order.timestamp, name: order.name })}
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

                  {/* Message Thread */}
                  {order.messages && order.messages.length > 0 && (
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 space-y-3">
                      <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-cyan-400" />
                        Conversation ({order.messages.length} messages)
                      </h4>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {order.messages.map((msg: OrderMessage) => (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-lg text-sm ${
                              msg.sender === 'customer'
                                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
                                : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-200'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-xs">
                                {msg.sender === 'customer' ? order.name : 'Admin'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(msg.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p>{msg.text}</p>
                            {(msg.proofImageUrl || msg.proofBackImageUrl) && (
                              <div className="flex gap-2 mt-2">
                                {msg.proofImageUrl && (
                                  <div className="text-center">
                                    <img src={msg.proofImageUrl} alt="Front" className="w-24 h-24 object-cover rounded border border-slate-600" />
                                    <p className="text-xs text-gray-500 mt-0.5">Front</p>
                                  </div>
                                )}
                                {msg.proofBackImageUrl && (
                                  <div className="text-center">
                                    <img src={msg.proofBackImageUrl} alt="Back" className="w-24 h-24 object-cover rounded border border-slate-600" />
                                    <p className="text-xs text-gray-500 mt-0.5">Back</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Details (for paid/complete orders) */}
                  {(order.status === 'paid' || order.status === 'complete') && order.paymentIntentId && (
                    <div className={`rounded-lg p-3 border ${order.status === 'complete' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                      <p className={`text-sm font-medium mb-1 ${order.status === 'complete' ? 'text-purple-400' : 'text-green-400'}`}>
                        {order.status === 'complete' ? 'Payment Received & Shipped' : 'Payment Received'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Stripe ID: {order.paymentIntentId}
                      </p>
                      {order.quantities && (
                        <p className="text-gray-400 text-xs mt-1">
                          Items: {Object.entries(order.quantities).map(([id, qty]) => `${qty}x ${id}`).join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Mark as Shipped checkbox (for paid orders) */}
                  {order.status === 'paid' && (
                    <label className="flex items-center gap-3 cursor-pointer group bg-slate-900 rounded-lg p-3 border border-slate-700 hover:border-purple-500/50 transition-colors">
                      <input
                        type="checkbox"
                        onChange={() => handleMarkComplete(order.timestamp)}
                        className="w-5 h-5 rounded border-slate-600 text-purple-500 focus:ring-purple-500 cursor-pointer"
                      />
                      <span className="text-gray-300 text-sm group-hover:text-purple-400 transition-colors flex items-center gap-2">
                        <PackageCheck className="w-4 h-4" />
                        Mark as shipped / complete
                      </span>
                    </label>
                  )}

                  {/* Proof Upload & Approval Link Section */}
                  {(order.status === 'pending' || order.status === 'proof_sent' || order.status === 'revision_requested') && (
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 space-y-3">
                      {/* Existing Proof Previews */}
                      {(order.proofImageUrl || order.proofBackImageUrl) && (
                        <div className="flex items-center gap-4">
                          {order.proofImageUrl && (
                            <div className="text-center">
                              <img src={order.proofImageUrl} alt="Front proof" className="w-16 h-16 object-cover rounded border border-slate-600" />
                              <p className="text-xs text-gray-500 mt-1">Front</p>
                            </div>
                          )}
                          {order.proofBackImageUrl && (
                            <div className="text-center">
                              <img src={order.proofBackImageUrl} alt="Back proof" className="w-16 h-16 object-cover rounded border border-slate-600" />
                              <p className="text-xs text-gray-500 mt-1">Back</p>
                            </div>
                          )}
                          {order.approvalToken ? (
                            <a
                              href={getApprovalUrl(order.approvalToken)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Proof uploaded
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-green-400 text-sm flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Proof uploaded
                            </span>
                          )}
                        </div>
                      )}

                      {/* Front & Back File Selectors */}
                      <div className="flex flex-wrap gap-3">
                        {/* Front (required) */}
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            ref={(el) => { frontInputRefs.current[order.timestamp] = el; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setPendingFrontFiles(prev => ({ ...prev, [order.timestamp]: file }));
                            }}
                            className="hidden"
                          />
                          <button
                            onClick={() => frontInputRefs.current[order.timestamp]?.click()}
                            disabled={uploadingProof === order.timestamp}
                            className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                              pendingFrontFiles[order.timestamp]
                                ? 'bg-green-600 hover:bg-green-500 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                            }`}
                          >
                            <Image className="w-4 h-4" />
                            {pendingFrontFiles[order.timestamp]
                              ? pendingFrontFiles[order.timestamp].name.slice(0, 20)
                              : 'Select Front'}
                          </button>
                        </div>

                        {/* Back (optional) */}
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            ref={(el) => { backInputRefs.current[order.timestamp] = el; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setPendingBackFiles(prev => ({ ...prev, [order.timestamp]: file }));
                            }}
                            className="hidden"
                          />
                          <button
                            onClick={() => backInputRefs.current[order.timestamp]?.click()}
                            disabled={uploadingProof === order.timestamp}
                            className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                              pendingBackFiles[order.timestamp]
                                ? 'bg-green-600 hover:bg-green-500 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                            }`}
                          >
                            <Image className="w-4 h-4" />
                            {pendingBackFiles[order.timestamp]
                              ? pendingBackFiles[order.timestamp].name.slice(0, 20)
                              : 'Select Back (optional)'}
                          </button>
                        </div>
                      </div>

                      {/* Upload / Send Button */}
                      <button
                        onClick={() => handleProofUpload(order.timestamp)}
                        disabled={uploadingProof === order.timestamp || !pendingFrontFiles[order.timestamp]}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
                      >
                        {uploadingProof === order.timestamp ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Uploading & Sending...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            {order.proofImageUrl ? 'Replace & Send Proof' : 'Upload & Send Proof'}
                          </>
                        )}
                      </button>

                      {/* Approval Link */}
                      {order.approvalToken && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={getApprovalUrl(order.approvalToken)}
                            className="flex-grow px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-gray-300 text-xs"
                          />
                          <button
                            onClick={() => copyApprovalLink(order.timestamp, order.approvalToken!)}
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-1 text-sm transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            {copiedToken === order.timestamp ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Order</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the order for <span className="text-white font-semibold">{deleteConfirm.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.timestamp)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
