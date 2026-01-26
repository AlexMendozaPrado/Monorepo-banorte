'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Globe, Smartphone, TabletSmartphone, Calendar, User, Building2, CheckCircle, Layers, Plus, Trash2 } from 'lucide-react';
import { ServiceDTO } from '@/core/application/dtos/ServiceDTO';
import { ServiceCategory } from '@/core/domain/entities/Service';
import { ProjectStatus, ALL_PROJECT_STATUSES, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/core/domain/value-objects/ProjectStatus';
import { EntityType, ALL_ENTITY_TYPES, ENTITY_TYPE_LABELS } from '@/core/domain/value-objects/EntityType';
import {
  ChannelVersion,
  ChannelType,
  ChannelStatus,
  ALL_CHANNELS,
  CHANNEL_LABELS,
  CHANNEL_STATUS_LABELS,
  CHANNEL_STATUS_COLORS,
} from '@/core/domain/value-objects/Channel';

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
  // Canales de Banorte
  channels: ChannelVersion[];
  // Campos Banorte
  projectStatus: ProjectStatus;
  entity: EntityType;
  hasASM: boolean;
  implementationDate: string;
  dateConfirmed: boolean;
  responsibleBusiness: string;
  responsibleIT: string;
  responsibleERN: string;
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
  // Canales de Banorte
  channels: [],
  // Valores por defecto Banorte
  projectStatus: 'iniciativa',
  entity: 'banco',
  hasASM: false,
  implementationDate: '',
  dateConfirmed: false,
  responsibleBusiness: '',
  responsibleIT: '',
  responsibleERN: '',
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
        // Canales de Banorte
        channels: service.channels || [],
        // Campos Banorte
        projectStatus: service.projectStatus || 'iniciativa',
        entity: service.entity || 'banco',
        hasASM: service.hasASM || false,
        implementationDate: service.implementationDate || '',
        dateConfirmed: service.dateConfirmed || false,
        responsibleBusiness: service.responsibleBusiness || '',
        responsibleIT: service.responsibleIT || '',
        responsibleERN: service.responsibleERN || '',
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

  // Channel handlers
  const handleAddChannel = () => {
    // Find first available channel not already added
    const usedChannels = formData.channels.map(c => c.channel);
    const availableChannel = ALL_CHANNELS.find(c => !usedChannels.includes(c));

    if (availableChannel) {
      setFormData(prev => ({
        ...prev,
        channels: [
          ...prev.channels,
          { channel: availableChannel, version: '', status: 'desarrollo' as ChannelStatus }
        ],
      }));
    }
  };

  const handleRemoveChannel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.filter((_, i) => i !== index),
    }));
  };

  const handleChannelChange = (index: number, field: keyof ChannelVersion, value: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.map((ch, i) =>
        i === index ? { ...ch, [field]: value } : ch
      ),
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

    // At least one platform or channel
    const hasAnyPlatform = platforms.web || platforms.ios || platforms.android;
    const hasAnyChannel = formData.channels.length > 0;
    if (!hasAnyPlatform && !hasAnyChannel) {
      errors.platforms = 'Se requiere al menos una plataforma o canal';
    }

    // Validate channels
    formData.channels.forEach((channel, index) => {
      if (!channel.version || channel.version.trim() === '') {
        errors[`channel_${index}_version`] = 'La versión es requerida';
      }
    });

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
      channels: formData.channels,
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

            {/* Channels Section - Principal */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-banorte-dark flex items-center gap-2">
                  <Layers size={16} className="text-banorte-gray" />
                  Canales de Banorte *
                </label>
                <button
                  type="button"
                  onClick={handleAddChannel}
                  disabled={formData.channels.length >= ALL_CHANNELS.length}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-banorte-red hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={14} />
                  Agregar canal
                </button>
              </div>
              {validationErrors.platforms && (
                <p className="mb-2 text-xs text-banorte-red">{validationErrors.platforms}</p>
              )}

              {formData.channels.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                  <Layers size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-banorte-gray">No hay canales configurados</p>
                  <button
                    type="button"
                    onClick={handleAddChannel}
                    className="mt-2 text-xs text-banorte-red hover:underline"
                  >
                    Agregar primer canal
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.channels.map((channel, index) => {
                    const usedChannels = formData.channels.map((c, i) => i !== index ? c.channel : null).filter(Boolean);
                    const availableChannels = ALL_CHANNELS.filter(c => !usedChannels.includes(c) || c === channel.channel);

                    return (
                      <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                        {/* Channel Select */}
                        <div className="flex-1 min-w-0">
                          <select
                            value={channel.channel}
                            onChange={(e) => handleChannelChange(index, 'channel', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red bg-white"
                          >
                            {availableChannels.map(ch => (
                              <option key={ch} value={ch}>
                                {CHANNEL_LABELS[ch]}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Version Input */}
                        <div className="w-24">
                          <input
                            type="text"
                            value={channel.version}
                            onChange={(e) => handleChannelChange(index, 'version', e.target.value)}
                            placeholder="1.0.0"
                            className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red ${
                              validationErrors[`channel_${index}_version`] ? 'border-red-300' : 'border-gray-200'
                            }`}
                          />
                        </div>

                        {/* Status Select */}
                        <div className="w-28">
                          <select
                            value={channel.status}
                            onChange={(e) => handleChannelChange(index, 'status', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red bg-white"
                            style={{
                              color: CHANNEL_STATUS_COLORS[channel.status],
                            }}
                          >
                            <option value="productivo" style={{ color: CHANNEL_STATUS_COLORS.productivo }}>
                              {CHANNEL_STATUS_LABELS.productivo}
                            </option>
                            <option value="piloto" style={{ color: CHANNEL_STATUS_COLORS.piloto }}>
                              {CHANNEL_STATUS_LABELS.piloto}
                            </option>
                            <option value="desarrollo" style={{ color: CHANNEL_STATUS_COLORS.desarrollo }}>
                              {CHANNEL_STATUS_LABELS.desarrollo}
                            </option>
                          </select>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveChannel(index)}
                          className="p-1.5 text-gray-400 hover:text-banorte-red hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Platforms - Secondary (collapsed) */}
            <details className="group">
              <summary className="text-sm font-medium text-banorte-dark mb-3 cursor-pointer hover:text-banorte-red flex items-center gap-2">
                <Globe size={16} className="text-banorte-gray" />
                Versiones por plataforma (opcional)
                <span className="text-xs text-banorte-gray group-open:hidden">(expandir)</span>
              </summary>
              <div className="space-y-3 mt-3">
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
            </details>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Project Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-banorte-dark uppercase tracking-wide flex items-center gap-2">
                <Building2 size={16} />
                Informacion del Proyecto
              </h3>

              {/* Project Status */}
              <div>
                <label className="block text-sm font-medium text-banorte-dark mb-2">
                  Estado del proyecto
                </label>
                <div className="flex flex-wrap gap-3">
                  {ALL_PROJECT_STATUSES.map((status) => (
                    <label
                      key={status}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                        formData.projectStatus === status
                          ? 'border-banorte-red bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="projectStatus"
                        value={status}
                        checked={formData.projectStatus === status}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectStatus: e.target.value as ProjectStatus }))}
                        className="sr-only"
                      />
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: PROJECT_STATUS_COLORS[status] }}
                      />
                      <span className="text-sm text-banorte-dark">{PROJECT_STATUS_LABELS[status]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Entity and ASM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-banorte-dark mb-2">
                    Entidad
                  </label>
                  <div className="flex gap-3">
                    {ALL_ENTITY_TYPES.map((entity) => (
                      <label
                        key={entity}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                          formData.entity === entity
                            ? entity === 'banco'
                              ? 'border-banorte-red bg-red-50 text-banorte-red'
                              : 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="entity"
                          value={entity}
                          checked={formData.entity === entity}
                          onChange={(e) => setFormData(prev => ({ ...prev, entity: e.target.value as EntityType }))}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{ENTITY_TYPE_LABELS[entity]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-banorte-dark mb-2">
                    ASM (Arquitectura de Software Modular)
                  </label>
                  <label
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      formData.hasASM
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.hasASM}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasASM: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-banorte-dark">
                      {formData.hasASM ? 'Con ASM' : 'Sin ASM'}
                    </span>
                    {formData.hasASM && <CheckCircle size={16} className="text-green-600" />}
                  </label>
                </div>
              </div>

              {/* Implementation Date */}
              <div>
                <label className="block text-sm font-medium text-banorte-dark mb-2">
                  Fecha de implementacion
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={formData.implementationDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, implementationDate: e.target.value }))}
                      disabled={!formData.dateConfirmed}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red transition-shadow ${
                        !formData.dateConfirmed ? 'bg-gray-100 text-gray-400' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={!formData.dateConfirmed}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dateConfirmed: !e.target.checked,
                        implementationDate: e.target.checked ? '' : prev.implementationDate
                      }))}
                      className="w-4 h-4 rounded border-gray-300 text-banorte-red focus:ring-banorte-red"
                    />
                    <span className="text-sm text-banorte-gray">Por confirmar</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Responsibles Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-banorte-dark uppercase tracking-wide flex items-center gap-2">
                <User size={16} />
                Responsables
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-banorte-dark mb-1">
                    Responsable Negocio
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="responsibleBusiness"
                      value={formData.responsibleBusiness}
                      onChange={handleInputChange}
                      placeholder="Nombre completo"
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red transition-shadow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-banorte-dark mb-1">
                    Responsable TI
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="responsibleIT"
                      value={formData.responsibleIT}
                      onChange={handleInputChange}
                      placeholder="Nombre completo"
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red transition-shadow"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-banorte-dark mb-1">
                    ERN (Ejecutivo Relacion de Negocio)
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="responsibleERN"
                      value={formData.responsibleERN}
                      onChange={handleInputChange}
                      placeholder="Nombre completo"
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red transition-shadow"
                    />
                  </div>
                </div>
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
