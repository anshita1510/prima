"use client";

import React, { useState, useEffect } from 'react';
import { Building, Plus, Edit, Save, X, Trash2, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { userService, Company, CreateCompanyData } from '../services/user.service';

interface CompanyManagementProps {
  onCompanyCreated?: (company: Company) => void;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export default function CompanyManagement({ onCompanyCreated, onError, onSuccess }: CompanyManagementProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<number | null>(null);
  
  const [createFormData, setCreateFormData] = useState<CreateCompanyData>({
    name: '',
    description: ''
  });

  const [editFormData, setEditFormData] = useState<{
    name: string;
    isActive: boolean;
  }>({
    name: '',
    isActive: true
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const response = await userService.getCompanies();
      setCompanies(response.companies);
    } catch (error: any) {
      onError?.('Failed to load companies: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createFormData.name.trim()) {
      onError?.('Company name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await userService.createCompany({
        name: createFormData.name.trim(),
        description: createFormData.description?.trim()
      });

      if (response.success) {
        onSuccess?.(`Company "${response.company.name}" created successfully!`);
        onCompanyCreated?.(response.company);
        setCreateFormData({ name: '', description: '' });
        setShowCreateForm(false);
        loadCompanies(); // Refresh the list
      }
    } catch (error: any) {
      onError?.(error.message || 'Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company.id);
    setEditFormData({
      name: company.name,
      isActive: true // Assuming active by default, you might want to add this to Company interface
    });
  };

  const handleUpdateCompany = async (companyId: number) => {
    if (!editFormData.name.trim()) {
      onError?.('Company name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await userService.updateCompany(companyId, {
        name: editFormData.name.trim(),
        isActive: editFormData.isActive
      });

      if (response.success) {
        onSuccess?.(`Company "${response.company.name}" updated successfully!`);
        setEditingCompany(null);
        loadCompanies(); // Refresh the list
      }
    } catch (error: any) {
      onError?.(error.message || 'Failed to update company');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingCompany(null);
    setEditFormData({ name: '', isActive: true });
  };

  const generateCompanyCodePreview = (name: string) => {
    if (!name.trim()) return 'Enter company name to see preview';
    
    // Extract letters and numbers, convert to uppercase
    const cleanName = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 4); // Take first 4 characters
    
    return `${cleanName}XXX (XXX will be auto-generated)`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Company Management</h2>
            <p className="text-sm text-gray-600">Create and manage companies in the system</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={loadCompanies}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Company
          </button>
        </div>
      </div>

      {/* Create Company Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="text-lg font-medium text-purple-900 mb-4">Create New Company</h3>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setCreateFormData(prev => ({ 
                      ...prev, 
                      name: newName
                    }));
                  }}
                  placeholder="Acme Corporation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Code (Auto-generated)
                </label>
                <input
                  type="text"
                  value={generateCompanyCodePreview(createFormData.name)}
                  readOnly
                  placeholder="Enter company name to see preview"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier generated automatically</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={createFormData.description}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the company"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Company
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateFormData({ name: '', description: '' });
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Companies List */}
      <div className="space-y-3">
        {loading && companies.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-8">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600">Create your first company to get started.</p>
          </div>
        ) : (
          companies.map((company) => (
            <div key={company.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              {editingCompany === company.id ? (
                // Edit Mode
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateCompany(company.id)}
                      disabled={loading}
                      className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-2 px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{company.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{company.code}</span>
                        {company.userCount !== undefined && (
                          <span>{company.userCount} users</span>
                        )}
                        {company.employeeCount !== undefined && (
                          <span>{company.employeeCount} employees</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditCompany(company)}
                      className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}