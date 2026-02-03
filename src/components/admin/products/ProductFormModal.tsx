import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductFormData } from '@/types/product';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: Partial<ProductFormData>;
  title: string;
  loading?: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  title,
  loading = false
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    nom: '',
    prix: '',
    image: '',
    description: '',
    stock: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const prevInitialDataRef = useRef<Partial<ProductFormData> | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      // Only reset form data if initialData has actually changed or if it's the first time opening
      const initialDataChanged = JSON.stringify(prevInitialDataRef.current) !== JSON.stringify(initialData);

      if (!prevInitialDataRef.current || initialDataChanged) {
        setFormData({
          nom: '',
          prix: '',
          image: '',
          description: '',
          stock: '',
          ...initialData
        });
        setErrors({});
        prevInitialDataRef.current = initialData;
      }
    }
  }, [isOpen]); // Remove initialData from dependencies

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.prix || isNaN(parseFloat(formData.prix)) || parseFloat(formData.prix) <= 0) {
      newErrors.prix = 'Le prix doit être un nombre positif';
    }

    if (!formData.stock || isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Le stock doit être un nombre positif ou nul';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-slate-900/70 to-purple-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 border border-purple-500/20">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 p-6 text-white flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-bold">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <div className="p-6 bg-gradient-to-b from-slate-800/50 to-slate-900/50 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-purple-200">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                </svg>
                Nom du produit *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  className={`w-full pl-4 pr-4 py-3 bg-slate-700/50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 text-white placeholder-slate-400 ${
                    errors.nom
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                  placeholder="Ex: Vaporisateur Premium"
                />
                {formData.nom && (
                  <div className="absolute right-3 top-3 w-2 h-2 bg-green-400 rounded-full"></div>
                )}
              </div>
              {errors.nom && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.nom}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-purple-200">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v1.092a4.535 4.535 0 001.676-.662C13.398 14.766 14 13.991 14 13c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.874V7.933c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                Prix (€) *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-slate-400 font-medium">€</div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prix}
                  onChange={(e) => handleChange('prix', e.target.value)}
                  className={`w-full pl-8 pr-4 py-3 bg-slate-700/50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 text-white placeholder-slate-400 ${
                    errors.prix
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-600 focus:border-green-500 focus:ring-green-500/20'
                  }`}
                  placeholder="29.99"
                />
              </div>
              {errors.prix && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.prix}
                </p>
              )}
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-purple-200">
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Image URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleChange('image', e.target.value)}
                  className="w-full pl-4 pr-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-white placeholder-slate-400"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <div className="absolute right-3 top-3 w-2 h-2 bg-green-400 rounded-full"></div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-purple-200">
                <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 resize-none text-white placeholder-slate-400"
                placeholder="Décrivez votre produit de manière attrayante..."
              />
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-purple-200">
                <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                Stock *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleChange('stock', e.target.value)}
                  className={`w-full pl-4 pr-4 py-3 bg-slate-700/50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 text-white placeholder-slate-400 ${
                    errors.stock
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-600 focus:border-orange-500 focus:ring-orange-500/20'
                  }`}
                  placeholder="50"
                />
                <div className="absolute right-3 top-3 text-slate-400 text-sm">unités</div>
              </div>
              {errors.stock && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.stock}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-slate-600 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-600/50 hover:text-white focus:outline-none focus:ring-4 focus:ring-slate-500/20 transition-all duration-200 font-medium disabled:opacity-50 border border-slate-600"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Enregistrer
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};