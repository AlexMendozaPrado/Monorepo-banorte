'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Globe, Smartphone, TabletSmartphone } from 'lucide-react';
import { ServiceDTO } from '@/core/application/dtos/ServiceDTO';
import { ServiceCategory } from '@/core/domain/entities/Service';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  service?: ServiceDTO;
  onSubmit: (data: ServiceFormData) => Promise<boolean>;
  loading?: boolean;
  error?: string | null;
}

export interface ServiceFormData {
  name: string;
  category: ServiceCategory;
  description: string;
  documentationUrl: string;
  logoUrl: string;
  versions: {
    web?: { currentVersion: string } | null;
    ios?: { currentVersion: string } | null;
    android?: { currentVersion: string } | null;
  };
}

const categories: ServiceCategory[] = [
  'Identity',
  'Analytics',
  'Attribution',
  'Monitoring',
  'Payments',
  'Engagement',
  'CMS',
  'Other',
];

const initialFormState: ServiceFormData = {
  name: '',
  category: 'Other',
  description: '',
  documentationUrl: '',
  logoUrl: '',
  versions: {},
};

export function ServiceFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  service,
  onSubmit,
  loading = false,
  error,
}: ServiceFormModalProps) {
  const [formData, setFormData] = useState<ServiceFormData>(initialFormState);
  const [platforms, setPlatforms] = useState({
    web: false,
    ios: false,
    android: false,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize form when service changes (edit mode)
  useEffect(() => {
    if (mode === 'edit' && service) {
      setFormData({
        name: service.name,
        category: service.category,
        description: service.description || '',
        documentationUrl: service.documentationUrl,
        logoUrl: service.logoUrl || '',
        versions: {
          web: service.versions.web ? { currentVersion: service.versions.web.currentVersion } : null,
          ios: service.versions.ios ? { currentVersion: service.versions.ios.currentVersion } : null,
          android: service.versions.android ? { currentVersion: service.versions.android.currentVersion } : null,
        },
      });
      setPlatforms({
        web: !!service.versions.web,
        ios: !!service.versions.ios,
        android: !!service.versions.android,
      });
    } else if (mode === 'create') {
      setFormData(initialFormState);
      setPlatforms({ web: false, ios: false, android: false });
    }
  }, [mode, service, isOpen]);

  // Clear validation errors when form changes
  useEffect(() => {
    setValidationErrors({});
  }, [formData, platforms]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlatformToggle = (platform: 'web' | 'ios' | 'android') => {
    setPlatforms(prev => {
      const newState = { ...prev, [platform]: !prev[platform] };

      // Update versions
      setFormData(prevData => ({
        ...prevData,
        versions: {
          ...prevData.versions,
          [platform]: newState[platform] ? { currentVersion: '' } : null,
        },
      }));

      return newState;
    });
  };

  const handleVersionChange = (platform: 'web' | 'ios' | 'android', version: string) => {
    setFormData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [platform]: { currentVersion: version },
      },
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    if (formData.name.trim().length > 100) {
      errors.name = 'El nombre debe tener máximo 100 caracteres';
    }

    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!formData.documentationUrl) {
      errors.documentationUrl = 'La URL de documentación es requerida';
    } else {
      try {
        new URL(formData.documentationUrl);
      } catch {
        errors.documentationUrl = 'URL inválida';
      }
    }

    if (formData.logoUrl) {
      try {
        new URL(formData.logoUrl);
      } catch {
        errors.logoUrl = 'URL inválida';
      }
    }

    // At least one platform
    const hasAnyPlatform = platforms.web || platforms.ios || platforms.android;
    if (!hasAnyPlatform) {
      errors.platforms = 'Se requiere al menos una plataforma';
    }

    // Validate version format
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (platforms.web) {
      const webVersion = formData.versions.web?.currentVersion || '';
      if (!versionRegex.test(webVersion)) {
        errors.webVersion = 'Formato inválido (ej: 1.0.0)';
      }
    }
    if (platforms.ios) {
      const iosVersion = formData.versions.ios?.currentVersion || '';
      if (!versionRegex.test(iosVersion)) {
        errors.iosVersion = 'Formato inválido (ej: 1.0.0)';
      }
    }
    if (platforms.android) {
      const androidVersion = formData.versions.android?.currentVersion || '';
      if (!versionRegex.test(androidVersion)) {
        errors.androidVersion = 'Formato inválido (ej: 1.0.0)';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Build versions object
    const versions: ServiceFormData['versions'] = {};
    if (platforms.web && formData.versions.web) {
      versions.web = formData.versions.web;
    } else if (!platforms.web && mode === 'edit') {
      versions.web = null;
    }
    if (platforms.ios && formData.versions.ios) {
      versions.ios = formData.versions.ios;
    } else if (!platforms.ios && mode === 'edit') {
      versions.ios = null;
    }
    if (platforms.android && formData.versions.android) {
      versions.android = formData.versions.android;
    } else if (!platforms.android && mode === 'edit') {
      versions.android = null;
    }

    const submitData: ServiceFormData = {
      ...formData,
      versions,
    };

    const success = await onSubmit(submitData);
    if (success) {
      onSuccess();
      onClose();
    }
  };

  const platformConfig = [
    { key: 'web' as const, label: 'Web', icon: Globe },
    { key: 'ios' as const, label: 'iOS', icon: Smartphone },
    { key: 'android' as const, label: 'Android', icon: TabletSmartphone },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-banorte-dark">
            {mode === 'create' ? 'Agregar Servicio' : 'Editar Servicio'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-banorte-red rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-banorte-dark mb-1">
                Nombre del servicio *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="ej: Firebase Auth"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red transition-shadow ${
                  validationErrors.name ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {validationErrors.name && (
                <p className="mt-1 text-xs text-banorte-red">{validationErrors.name}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-banorte-dark mb-1">
                Categoría *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red transition-shadow bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-banorte-dark mb-1">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descripción breve del servicio..."
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red transition-shadow resize-none ${
                  validationErrors.description ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {validationErrors.description && (
                <p className="mt-1 text-xs text-banorte-red">{validationErrors.description}</p>
              )}
            </div>

            {/* Documentation URL */}
            <div>
              <label className="block text-sm font-medium text-banorte-dark mb-1">
                URL de documentación *
              </label>
              <input
                type="url"
                name="documentationUrl"
                value={formData.documentationUrl}
                onChange={handleInputChange}
                placeholder="https://docs.example.com"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red transition-shadow ${
                  validationErrors.documentationUrl ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {validationErrors.documentationUrl && (
                <p className="mt-1 text-xs text-banorte-red">{validationErrors.documentationUrl}</p>
              )}
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-banorte-dark mb-1">
                URL del logo (opcional)
              </label>
              <input
                type="url"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/logo.png"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red transition-shadow ${
                  validationErrors.logoUrl ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {validationErrors.logoUrl && (
                <p className="mt-1 text-xs text-banorte-red">{validationErrors.logoUrl}</p>
              )}
            </div>

            {/* Platforms */}
            <div>
              <label className="block text-sm font-medium text-banorte-dark mb-3">
                Versiones por plataforma *
              </label>
              {validationErrors.platforms && (
                <p className="mb-2 text-xs text-banorte-red">{validationErrors.platforms}</p>
              )}
              <div className="space-y-3">
                {platformConfig.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer min-w-[120px]">
                      <input
                        type="checkbox"
                        checked={platforms[key]}
                        onChange={() => handlePlatformToggle(key)}
                        className="w-4 h-4 rounded border-gray-300 text-banorte-red focus:ring-banorte-red"
                      />
                      <Icon size={16} className="text-banorte-gray" />
                      <span className="text-sm text-banorte-dark">{label}</span>
                    </label>
                    {platforms[key] && (
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.versions[key]?.currentVersion || ''}
                          onChange={(e) => handleVersionChange(key, e.target.value)}
                          placeholder="1.0.0"
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red transition-shadow text-sm ${
                            validationErrors[`${key}Version`] ? 'border-red-300' : 'border-gray-200'
                          }`}
                        />
                        {validationErrors[`${key}Version`] && (
                          <p className="mt-1 text-xs text-banorte-red">
                            {validationErrors[`${key}Version`]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-banorte-gray hover:text-banorte-dark hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-banorte-red hover:bg-banorte-red-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === 'create' ? 'Creando...' : 'Guardando...'}
                </>
              ) : (
                mode === 'create' ? 'Crear servicio' : 'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
