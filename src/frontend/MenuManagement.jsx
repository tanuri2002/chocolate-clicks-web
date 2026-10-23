import React, { useState, useEffect, useRef } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../api';
import { MENU_CATEGORIES } from './constants/categories';
import './MenuManagement.css';
import './Dashboard.css';

const DEFAULT_FORM = {
  name: '',
  category: MENU_CATEGORIES[0],
  description: '',
  price: '',
  maxPerOrder: 10,
  isActive: true,
};

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirmation modal states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Global alerts
  const [alertError, setAlertError] = useState('');
  const [alertSuccess, setAlertSuccess] = useState('');

  const fileInputRef = useRef(null);

  // Load menu items
  async function loadItems() {
    setLoading(true);
    setAlertError('');
    try {
      const res = await getMenuItems({ all: true });
      setItems(res.items || []);
    } catch (err) {
      console.error('Failed to load menu items:', err);
      setAlertError(err.message || 'Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  // Open "Add Item" Modal
  function handleOpenAddModal() {
    setEditingItem(null);
    setForm({
      ...DEFAULT_FORM,
      category: MENU_CATEGORIES[0] || 'Chocolate Cakes',
    });
    setImageFile(null);
    setImagePreview('');
    setFormError('');
    setIsModalOpen(true);
  }

  // Open "Edit Item" Modal
  function handleOpenEditModal(item) {
    setEditingItem(item);
    setForm({
      name: item.name || '',
      category: item.category || MENU_CATEGORIES[0],
      description: item.description || '',
      price: item.price !== undefined ? String(item.price) : '',
      maxPerOrder: item.maxPerOrder !== undefined ? item.maxPerOrder : 10,
      isActive: item.isActive !== false,
    });
    setImageFile(null);
    setImagePreview(item.imageUrl || '');
    setFormError('');
    setIsModalOpen(true);
  }

  // Close form modal
  function handleCloseModal() {
    if (saving) return;
    setIsModalOpen(false);
    setEditingItem(null);
    setImageFile(null);
    setImagePreview('');
    setFormError('');
  }

  // Handle file selection and live preview
  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFormError('Only JPG, JPEG, PNG, or WEBP images are supported.');
      return;
    }

    setFormError('');
    setImageFile(file);

    // Live preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  // Save (Create or Update)
  async function handleSave(e) {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!form.name.trim()) {
      setFormError('Item name is required.');
      return;
    }

    if (!form.category) {
      setFormError('Please select a category.');
      return;
    }

    const numPrice = Number(form.price);
    if (isNaN(numPrice) || numPrice < 0 || form.price === '') {
      setFormError('Please enter a valid price.');
      return;
    }

    const numMax = Number(form.maxPerOrder);
    if (isNaN(numMax) || numMax < 1) {
      setFormError('Max per order must be at least 1.');
      return;
    }

    // Creating requires image
    if (!editingItem && !imageFile) {
      setFormError('An image is required when creating a new menu item.');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('category', form.category);
    formData.append('description', form.description.trim());
    formData.append('price', numPrice);
    formData.append('maxPerOrder', numMax);
    formData.append('isActive', form.isActive);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    setSaving(true);
    try {
      if (editingItem) {
        await updateMenuItem(editingItem._id, formData);
        setAlertSuccess(`Menu item "${form.name.trim()}" updated successfully.`);
      } else {
        await createMenuItem(formData);
        setAlertSuccess(`Menu item "${form.name.trim()}" created successfully.`);
      }

      handleCloseModal();
      await loadItems();

      setTimeout(() => setAlertSuccess(''), 4000);
    } catch (err) {
      console.error('Save error:', err);
      setFormError(err.message || 'Failed to save menu item.');
    } finally {
      setSaving(false);
    }
  }

  // Delete item handler
  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteMenuItem(deleteTarget._id);
      setAlertSuccess(`Menu item "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      await loadItems();

      setTimeout(() => setAlertSuccess(''), 4000);
    } catch (err) {
      console.error('Delete error:', err);
      setAlertError(err.message || 'Failed to delete menu item.');
    } finally {
      setDeleting(false);
    }
  }

  // Derive all active categories: predefined MENU_CATEGORIES plus any existing categories from DB items
  const itemCategories = [...new Set(items.map((i) => i.category).filter(Boolean))];
  const allCategories = [
    ...MENU_CATEGORIES,
    ...itemCategories.filter((c) => !MENU_CATEGORIES.includes(c)),
  ];

  // Filter items by category
  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  // Group items under category headings
  const categoriesToDisplay = selectedCategory === 'All'
    ? allCategories
    : [selectedCategory];

  return (
    <div className="menu-management-page">
      {/* Top Header Bar */}
      <div className="menu-mgmt-header">
        <div className="menu-mgmt-title-wrap">
          <h2>
            <UtensilsCrossed size={22} className="icon-orange" />
            Menu Management
          </h2>
          <span className="orders-total-badge">
            {items.length} Item{items.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="menu-mgmt-actions">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={loadItems}
            disabled={loading}
            title="Refresh menu items"
          >
            <RefreshCw size={15} className={loading ? 'admin-spin-icon' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleOpenAddModal}
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {alertError && (
        <div className="admin-alert admin-alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{alertError}</span>
          <button className="admin-alert-close" onClick={() => setAlertError('')} aria-label="Close">
            <X size={15} />
          </button>
        </div>
      )}

      {alertSuccess && (
        <div className="admin-alert admin-alert-success" role="alert">
          <CheckCircle2 size={18} />
          <span>{alertSuccess}</span>
          <button className="admin-alert-close" onClick={() => setAlertSuccess('')} aria-label="Close">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="menu-mgmt-filter-bar">
        <div className="orders-status-filters" role="group" aria-label="Filter menu by category">
          <button
            type="button"
            className={`status-filter-chip ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All ({items.length})
          </button>
          {allCategories.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            if (count === 0 && !MENU_CATEGORIES.includes(cat)) return null;
            return (
              <button
                key={cat}
                type="button"
                className={`status-filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading && items.length === 0 ? (
        <div className="admin-loading-state">
          <div className="admin-spinner" />
          <p>Loading menu items...</p>
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="customers-card menu-mgmt-empty-card">
          <div className="admin-empty-state">
            <div className="menu-mgmt-empty-icon" aria-hidden="true">
              <UtensilsCrossed size={42} className="icon-orange" />
            </div>
            <h3>No menu items yet</h3>
            <p>Click 'Add item' to create your first one.</p>
            <button
              type="button"
              className="admin-btn-primary"
              onClick={handleOpenAddModal}
              style={{ marginTop: '1rem' }}
            >
              <Plus size={16} />
              <span>Add item</span>
            </button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Filter Empty State */
        <div className="customers-card menu-mgmt-empty-card">
          <div className="admin-empty-state">
            <UtensilsCrossed size={36} className="empty-icon" />
            <h3>No items in {selectedCategory}</h3>
            <p>There are no menu items under this category yet.</p>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => setSelectedCategory('All')}
              style={{ marginTop: '1rem' }}
            >
              View All Items
            </button>
          </div>
        </div>
      ) : (
        /* Items Grouped Under Category Headings */
        <div className="menu-mgmt-categories-container">
          {categoriesToDisplay.map((cat) => {
            const catItems = items.filter((i) => i.category === cat);
            if (catItems.length === 0) return null;

            return (
              <section key={cat} className="menu-mgmt-category-group">
                <div className="menu-mgmt-category-header">
                  <h3 className="menu-mgmt-category-title">
                    {cat} <span className="menu-mgmt-category-count">({catItems.length})</span>
                  </h3>
                </div>

                <div className="menu-mgmt-grid">
                  {catItems.map((item) => (
                    <div key={item._id} className="menu-mgmt-card">
                      {/* Image */}
                      <div className="menu-mgmt-card-img-wrap">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="menu-mgmt-card-img"
                            loading="lazy"
                          />
                        ) : (
                          <div className="menu-mgmt-card-placeholder">
                            <ImageIcon size={32} className="text-gray-500" />
                          </div>
                        )}
                        <span className="menu-mgmt-category-badge">{item.category}</span>
                      </div>

                      {/* Body */}
                      <div className="menu-mgmt-card-body">
                        <div className="menu-mgmt-card-header">
                          <h4 className="menu-mgmt-card-name">{item.name}</h4>
                          <span className="menu-mgmt-card-price">
                            LKR {Number(item.price).toLocaleString()}
                          </span>
                        </div>

                        <p className="menu-mgmt-card-desc">
                          {item.description || 'No description provided.'}
                        </p>

                        <div className="menu-mgmt-card-meta">
                          <span className="menu-mgmt-meta-pill">
                            Max / Order: {item.maxPerOrder || 10}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="menu-mgmt-card-actions">
                          <button
                            type="button"
                            className="menu-mgmt-action-btn menu-mgmt-edit-btn"
                            onClick={() => handleOpenEditModal(item)}
                            title={`Edit ${item.name}`}
                          >
                            <Pencil size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="menu-mgmt-action-btn menu-mgmt-delete-btn"
                            onClick={() => setDeleteTarget(item)}
                            title={`Delete ${item.name}`}
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={handleCloseModal} role="dialog" aria-modal="true">
          <div
            className="admin-modal-container"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            {/* Modal Header */}
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={handleCloseModal}
                disabled={saving}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="admin-modal-form">
              {formError && (
                <div className="admin-modal-error" role="alert">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Image Upload with Live Preview */}
              <div className="admin-modal-field">
                <label className="admin-modal-label">
                  Item Image {editingItem ? '(Optional - upload to replace)' : '*'}
                </label>
                <div
                  className="menu-image-upload-box"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />

                  {imagePreview ? (
                    <div className="menu-image-preview-wrap">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="menu-image-preview"
                      />
                      <div className="menu-image-change-overlay">
                        <Upload size={18} />
                        <span>Click to change image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="menu-image-drop-content">
                      <Upload size={32} className="icon-orange" />
                      <p className="menu-image-upload-text">
                        <strong>Click to select an image</strong> or drag and drop
                      </p>
                      <span className="menu-image-upload-hint">
                        JPG, PNG, WEBP (Max 5MB • Resized to max 900px)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Item Name */}
              <div className="admin-modal-field">
                <label htmlFor="itemName" className="admin-modal-label">
                  Item Name *
                </label>
                <input
                  id="itemName"
                  type="text"
                  required
                  placeholder="e.g. Signature Dark Chocolate Fudge Cake"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="admin-modal-input"
                  maxLength={120}
                />
              </div>

              {/* Category & Price in 2 Columns */}
              <div className="admin-modal-row-2">
                <div className="admin-modal-field">
                  <label htmlFor="itemCategory" className="admin-modal-label">
                    Category *
                  </label>
                  <select
                    id="itemCategory"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="admin-modal-select"
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-modal-field">
                  <label htmlFor="itemPrice" className="admin-modal-label">
                    Price (LKR) *
                  </label>
                  <input
                    id="itemPrice"
                    type="number"
                    min="0"
                    step="10"
                    required
                    placeholder="e.g. 2400"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="admin-modal-input"
                  />
                </div>
              </div>

              {/* Max Per Order */}
              <div className="admin-modal-field">
                <label htmlFor="itemMaxPerOrder" className="admin-modal-label">
                  Max Quantity Per Order (Default: 10)
                </label>
                <input
                  id="itemMaxPerOrder"
                  type="number"
                  min="1"
                  max="1000"
                  value={form.maxPerOrder}
                  onChange={(e) => setForm({ ...form, maxPerOrder: e.target.value })}
                  className="admin-modal-input"
                />
                <span className="admin-modal-hint">
                  Orders exceeding this quantity will automatically become special orders requiring owner approval.
                </span>
              </div>

              {/* Description */}
              <div className="admin-modal-field">
                <label htmlFor="itemDesc" className="admin-modal-label">
                  Description
                </label>
                <textarea
                  id="itemDesc"
                  rows={3}
                  placeholder="Describe the flavors, texture, and handcrafted ingredients..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="admin-modal-textarea"
                  maxLength={1000}
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="admin-btn-spinner" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Save Changes' : 'Create Item'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => !deleting && setDeleteTarget(null)} role="dialog" aria-modal="true">
          <div className="admin-modal-container admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-confirm-icon-wrap">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="admin-confirm-title">Delete Menu Item?</h3>
            <p className="admin-confirm-text">
              Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? This will permanently remove the item and delete its image from Cloudinary.
            </p>

            <div className="admin-confirm-actions">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
