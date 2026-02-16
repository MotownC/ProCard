import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Plus, Minus, ShoppingCart, CreditCard, MessageSquare, Send } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import PaymentForm from './PaymentForm';
import { PRICING_OPTIONS, formatPrice, calculateTotal } from '../config/pricing';
import { getOrderByToken, updateOrderPayment, requestRevision, CustomOrder, OrderMessage } from '../utils/firebase';

interface OrderApprovalProps {
  token: string;
}

const OrderApproval: React.FC<OrderApprovalProps> = ({ token }) => {
  const [order, setOrder] = useState<CustomOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Product selections: { optionId: quantity }
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Payment state
  const [clientSecret, setClientSecret] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [creatingIntent, setCreatingIntent] = useState(false);

  // Revision feedback state
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [revisionSubmitted, setRevisionSubmitted] = useState(false);

  // Load order by token
  useEffect(() => {
    const loadOrder = async () => {
      const foundOrder = await getOrderByToken(token);
      if (foundOrder) {
        if (foundOrder.status === 'paid') {
          setPaymentSuccess(true);
        }
        if (foundOrder.status === 'revision_requested') {
          setRevisionSubmitted(true);
        }
        setOrder(foundOrder);
      } else {
        setError('Order not found. Please check your link and try again.');
      }
      setLoading(false);
    };
    loadOrder();
  }, [token]);

  const updateQuantity = (optionId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[optionId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [optionId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [optionId]: next };
    });
  };

  const getSelectedItems = () => {
    return Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, quantity]) => ({ id, quantity }));
  };

  const total = calculateTotal(getSelectedItems());
  const hasSelections = getSelectedItems().length > 0;

  const handleProceedToPayment = async () => {
    if (!order || !hasSelections) return;

    setCreatingIntent(true);
    setPaymentError('');

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: getSelectedItems(),
          customerEmail: order.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set up payment');
      }

      setClientSecret(data.clientSecret);
      setTotalAmount(data.amount);
      setShowPayment(true);
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to set up payment. Please try again.');
    } finally {
      setCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!order) return;

    try {
      await updateOrderPayment(order.timestamp, {
        paymentIntentId,
        selectedOptions: Object.keys(quantities),
        quantities,
        totalPaidCents: totalAmount,
      });

      // Send email notification
      try {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID,
            template_id: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
            template_params: {
              customer_name: order.name,
              customer_email: order.email,
              customer_phone: order.phone,
              notes: `PAYMENT RECEIVED - ${formatPrice(totalAmount)}\nItems: ${getSelectedItems().map(i => `${i.quantity}x ${i.id}`).join(', ')}`,
              order_time: new Date().toLocaleString(),
            },
          }),
        });
      } catch {
        // Don't fail the order if email fails
      }

      setPaymentSuccess(true);
    } catch {
      setPaymentError('Payment was collected but we had trouble updating your order. Please contact support@procardlegends.com');
    }
  };

  const handleRequestRevision = async () => {
    if (!order || !feedbackText.trim()) return;
    setSubmittingFeedback(true);
    try {
      await requestRevision(order.timestamp, feedbackText.trim());
      setRevisionSubmitted(true);
      setFeedbackText('');
      const updated = await getOrderByToken(token);
      if (updated) setOrder(updated);
    } catch {
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800 border border-red-500/50 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800 border border-green-500/50 rounded-xl p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-400 mb-4">
            Thank you for your order, {order?.name}! We'll start production on your card right away.
          </p>
          <p className="text-sm text-gray-500">
            A receipt has been sent to {order?.email}. Questions? Contact{' '}
            <a href="mailto:support@procardlegends.com" className="text-cyan-400 hover:text-cyan-300">
              support@procardlegends.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (revisionSubmitted && order?.status === 'revision_requested') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800 border border-amber-500/50 rounded-xl p-8 max-w-md text-center">
          <MessageSquare className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Revision Requested</h2>
          <p className="text-gray-400 mb-4">
            Thanks, {order.name}! We've received your feedback and will update your design. You'll get an email when the new proof is ready.
          </p>
          <p className="text-sm text-gray-500">
            You can revisit this same link to check for updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white font-['Teko'] mb-2">
            {order?.proofHistory && order.proofHistory.length > 0
              ? 'YOUR UPDATED PROOF IS READY'
              : 'YOUR CARD IS READY'}
          </h1>
          <p className="text-gray-400">
            Review your custom card design below. You can request changes or select your products and checkout.
          </p>
        </div>

        {/* Card Proof Preview */}
        {order?.proofImageUrl && (
          <div className="mb-10">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
              <img
                src={order.proofImageUrl}
                alt="Your custom card design"
                className="max-w-sm mx-auto rounded-lg shadow-2xl border border-slate-600"
              />
              <p className="text-cyan-400 mt-4 font-semibold">
                Love your design? Select your products below! Or request changes if something needs adjusting.
              </p>
            </div>
          </div>
        )}

        {/* Message Thread */}
        {order?.messages && order.messages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              Design Notes
            </h2>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3 max-h-64 overflow-y-auto">
              {order.messages.map((msg: OrderMessage) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg text-sm ${
                    msg.sender === 'customer'
                      ? 'bg-amber-500/10 border border-amber-500/30 ml-8'
                      : 'bg-cyan-500/10 border border-cyan-500/30 mr-8'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-xs text-gray-400">
                      {msg.sender === 'customer' ? 'You' : 'ProCard Team'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-200">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request Changes Section */}
        {order?.status === 'proof_sent' && !showPayment && (
          <div className="mb-8 bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-2">Want changes?</h3>
            <p className="text-gray-400 text-sm mb-3">
              If you'd like adjustments to your design, describe what you'd like changed below.
            </p>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="e.g., Can you make the text bigger? I'd like a different background color..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-gray-500 resize-none focus:border-amber-500 focus:outline-none"
              rows={3}
            />
            <button
              type="button"
              onClick={handleRequestRevision}
              disabled={!feedbackText.trim() || submittingFeedback}
              className="mt-3 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submittingFeedback ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Request Changes
                </>
              )}
            </button>
          </div>
        )}

        {/* Product Selection */}
        {!showPayment && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white font-['Teko'] mb-4 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-cyan-400" />
              SELECT YOUR PRODUCTS
            </h2>

            <div className="space-y-3">
              {PRICING_OPTIONS.map((option) => {
                const qty = quantities[option.id] || 0;
                return (
                  <div
                    key={option.id}
                    className={`bg-slate-800 border rounded-xl p-4 flex items-center justify-between transition-colors ${
                      qty > 0 ? 'border-cyan-500' : 'border-slate-700'
                    }`}
                  >
                    <div className="flex-grow">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-semibold">{option.name}</h3>
                        {option.type === 'bundle' && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/50">
                            BEST VALUE
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{option.description}</p>
                      <p className="text-cyan-400 font-bold mt-1">{formatPrice(option.priceInCents)}</p>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        type="button"
                        onClick={() => updateQuantity(option.id, -1)}
                        disabled={qty === 0}
                        className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-white font-bold">{qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(option.id, 1)}
                        className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center hover:bg-cyan-500 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            {hasSelections && (
              <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">Order Summary</h3>
                {getSelectedItems().map(({ id, quantity }) => {
                  const option = PRICING_OPTIONS.find(o => o.id === id);
                  if (!option) return null;
                  return (
                    <div key={id} className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>{quantity}x {option.name}</span>
                      <span>{formatPrice(option.priceInCents * quantity)}</span>
                    </div>
                  );
                })}
                <div className="border-t border-slate-600 mt-3 pt-3 flex justify-between text-white font-bold">
                  <span>Total</span>
                  <span className="text-cyan-400">{formatPrice(total)}</span>
                </div>
              </div>
            )}

            {/* Proceed to Payment Button */}
            <button
              type="button"
              onClick={handleProceedToPayment}
              disabled={!hasSelections || creatingIntent}
              className="w-full mt-6 py-3 font-bold rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: hasSelections && !creatingIntent
                  ? 'linear-gradient(135deg, #06b6d4, #8b5cf6)'
                  : '#475569',
              }}
            >
              {creatingIntent ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Setting up payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Proceed to Payment {hasSelections && `(${formatPrice(total)})`}
                </>
              )}
            </button>
          </div>
        )}

        {/* Payment Section */}
        {showPayment && clientSecret && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white font-['Teko'] mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-cyan-400" />
              PAYMENT
            </h2>

            {/* Order Summary (compact) */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6">
              {getSelectedItems().map(({ id, quantity }) => {
                const option = PRICING_OPTIONS.find(o => o.id === id);
                if (!option) return null;
                return (
                  <div key={id} className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>{quantity}x {option.name}</span>
                    <span>{formatPrice(option.priceInCents * quantity)}</span>
                  </div>
                );
              })}
              <div className="border-t border-slate-600 mt-2 pt-2 flex justify-between text-white font-bold">
                <span>Total</span>
                <span className="text-cyan-400">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Back button */}
            <button
              type="button"
              onClick={() => {
                setShowPayment(false);
                setClientSecret('');
              }}
              className="text-gray-400 hover:text-white text-sm mb-4 transition-colors"
            >
              &larr; Back to product selection
            </button>

            {/* Stripe Elements */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#06b6d4',
                      colorBackground: '#0f172a',
                      colorText: '#e2e8f0',
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <PaymentForm
                  amount={totalAmount}
                  onSuccess={handlePaymentSuccess}
                  onError={setPaymentError}
                />
              </Elements>
            </div>
          </div>
        )}

        {/* Payment Error */}
        {paymentError && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400">{paymentError}</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-sm text-gray-500 text-center mt-8">
          Secure payment powered by Stripe. Questions? Contact{' '}
          <a href="mailto:support@procardlegends.com" className="text-cyan-400 hover:text-cyan-300">
            support@procardlegends.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default OrderApproval;
