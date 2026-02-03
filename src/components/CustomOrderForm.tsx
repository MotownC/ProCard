import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { uploadToCloudinary } from '../utils/cloudinary';
import { saveCustomOrderToFirebase, CustomOrder } from '../utils/firebase';

interface CustomOrderFormProps {
  setPage: (page: string) => void;
}

const CustomOrderForm: React.FC<CustomOrderFormProps> = ({ setPage }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!photoFile) {
      setError('Please upload a photo');
      return;
    }
    if (!formData.name || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Upload photo to Cloudinary
      const photoUrl = await uploadToCloudinary(photoFile);

      // Create order submission object
      const submission: CustomOrder = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        photoUrl: photoUrl,
        notes: formData.notes,
        timestamp: Date.now()
      };

      // Save to Firebase 'customOrders' collection
      await saveCustomOrderToFirebase(submission);
      console.log('Custom Order Submission:', submission);

      // Send email notification (optional - requires EmailJS setup)
      try {
        console.log('📧 Attempting to send email notification...');
        console.log('Service ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID);
        console.log('Template ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID);
        console.log('Public Key:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? '✓ Set' : '✗ Missing');

        const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID,
            template_id: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
            template_params: {
              customer_name: formData.name,
              customer_email: formData.email,
              customer_phone: formData.phone,
              photo_url: photoUrl,
              notes: formData.notes,
              order_time: new Date(submission.timestamp).toLocaleString()
            }
          })
        });

        if (emailResponse.ok) {
          console.log('✅ Email notification sent successfully');
        } else {
          const errorText = await emailResponse.text();
          console.error('❌ Email failed with status:', emailResponse.status);
          console.error('Error details:', errorText);
          try {
            const errorJson = JSON.parse(errorText);
            console.error('Parsed error:', errorJson);
          } catch {
            // Error wasn't JSON, already logged as text
          }
        }
      } catch (emailError) {
        console.error('❌ Email notification exception:', emailError);
        // Don't fail the whole submission if email fails
      }

      // Show success
      setUploadSuccess(true);

      // Reset form after 5 seconds (give user time to see success state)
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', notes: '' });
        setPhotoFile(null);
        setPhotoPreview('');
        setUploadSuccess(false);
      }, 5000);

    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setPage('home')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <h1 className="text-4xl font-bold text-white font-['Teko'] mb-2">
            CUSTOM DESIGN SERVICE
          </h1>
          <p className="text-gray-400">
            Upload your photo and our design team will create a professional trading card for you.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          {/* Photo Upload */}
          <div className="mb-6">
            <label htmlFor="photo-upload" className="block text-white font-semibold mb-2">
              Photo Upload <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-400 mb-3">
              Upload a high-quality photo. We'll handle background removal and card design.
            </p>

            <input
              id="photo-upload"
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />

            {!photoPreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-slate-600 rounded-lg hover:border-cyan-500 transition-colors flex flex-col items-center justify-center gap-3 bg-slate-900/50"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-gray-400">Click to upload photo</span>
              </button>
            ) : (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview('');
                    setPhotoFile(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="mb-4">
            <label htmlFor="customer-name" className="block text-white font-semibold mb-2">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              id="customer-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="customer-email" className="block text-white font-semibold mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="customer-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              placeholder="john@example.com"
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label htmlFor="customer-phone" className="block text-white font-semibold mb-2">
              Phone Number
            </label>
            <input
              id="customer-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              placeholder="(123) 456-7890"
            />
          </div>

          {/* Additional Notes */}
          <div className="mb-6">
            <label htmlFor="customer-notes" className="block text-white font-semibold mb-2">
              Additional Notes
            </label>
            <textarea
              id="customer-notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none resize-none"
              placeholder="Any specific requests for your card design? (e.g., preferred colors, style, text to include)"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || uploadSuccess}
            className={`w-full py-3 font-bold rounded-xl flex items-center justify-center gap-2 ${
              uploadSuccess
                ? 'bg-green-600 text-white cursor-default'
                : 'gradient-btn text-white disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Successfully Submitted!
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Submit Order
              </>
            )}
          </button>

          <p className="text-sm text-gray-400 text-center mt-4">
            You'll receive a confirmation email immediately after submission. Our design team will create your custom card and send you a proof within 24-48 hours.
          </p>

          <p className="text-sm text-gray-400 text-center mt-2">
            Questions? Contact us at <a href="mailto:support@procardlegends.com" className="text-cyan-400 hover:text-cyan-300 transition-colors underline">support@procardlegends.com</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default CustomOrderForm;
