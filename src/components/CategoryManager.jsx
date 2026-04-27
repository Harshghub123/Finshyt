import { useState } from 'react';
import useProfile from '../store/useProfile';

const EMOJI_OPTIONS = [
  '🏠', '🍱', '🚌', '🎮', '🛍️', '💊', '📱', '📦', '✨', '💰',
  '☕', '🍕', '🎬', '✈️', '📚', '💄', '🎵', '🏋️', '🎁', '💡',
  '🐶', '🚗', '⚡', '🌿', '🍺', '🎯', '🔧', '👗', '🏖️', '🎪',
];

const COLOR_OPTIONS = [
  '#C4B5FD', '#FDBA74', '#7DD3FC', '#86EFAC', '#FDE047',
  '#F9A8D4', '#FCA5A5', '#E5E7EB', '#6EE7B7', '#A5F3FC',
  '#FB923C', '#A78BFA', '#34D399', '#F472B6', '#60A5FA',
];

function CategoryForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [icon, setIcon] = useState(initial?.icon || '📦');
  const [color, setColor] = useState(initial?.color || '#E5E7EB');

  return (
    <div className="card fade-in" style={{ padding: 20, marginBottom: 12, border: '1px solid var(--brand-light)' }}>
      {/* Name */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
          Category Name
        </label>
        <input
          className="input-field"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Gym, Takeout, Hobbies"
          maxLength={24}
          autoFocus
        />
      </div>

      {/* Emoji picker */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
          Icon
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              onClick={() => setIcon(e)}
              style={{
                width: 36, height: 36, borderRadius: 8, border: icon === e ? '2px solid var(--brand)' : '2px solid transparent',
                background: icon === e ? '#F0FDF4' : 'var(--bg-elevated)',
                fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
          Color
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                border: color === c ? '3px solid #1F2937' : '2px solid transparent',
                boxShadow: color === c ? '0 0 0 2px white' : 'none',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-ghost" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
        <button
          className="btn-primary"
          onClick={() => name.trim() && onSave({ name: name.trim(), icon, color })}
          disabled={!name.trim()}
          style={{ flex: 1, justifyContent: 'center', opacity: name.trim() ? 1 : 0.5 }}
        >
          Save category
        </button>
      </div>
    </div>
  );
}

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useProfile();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleAdd = (data) => {
    addCategory(data);
    setShowAdd(false);
  };

  const handleEdit = (id, data) => {
    updateCategory(id, data);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    deleteCategory(id);
    setDeletingId(null);
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>🏷️ My Categories</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
        Customize how your spending is tracked.
      </p>

      {/* Add form */}
      {showAdd && (
        <CategoryForm
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* Category list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {categories.map((cat) => {
          if (editingId === cat.id) {
            return (
              <CategoryForm
                key={cat.id}
                initial={cat}
                onSave={(data) => handleEdit(cat.id, data)}
                onCancel={() => setEditingId(null)}
              />
            );
          }

          return (
            <div key={cat.id} className="card fade-in" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: cat.color + '33',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                }}>
                  {cat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{cat.name}</div>
                  {cat.isDefault && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>🔒 Default</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 4 }}>
                {!cat.isDefault && (
                  <>
                    <button
                      onClick={() => setEditingId(cat.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '6px 8px', borderRadius: 8, color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => { e.target.style.background = '#F3F4F6'; e.target.style.color = '#1F2937'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.color = 'var(--text-muted)'; }}
                      title="Edit"
                    >✏️</button>

                    {deletingId === cat.id ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          style={{ background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, padding: '4px 10px', borderRadius: 8, fontWeight: 800 }}
                        >Delete</button>
                        <button
                          onClick={() => setDeletingId(null)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', padding: '4px 6px' }}
                        >✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(cat.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '6px 8px', borderRadius: 8, color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => { e.target.style.background = '#FEE2E2'; e.target.style.color = '#EF4444'; }}
                        onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.color = 'var(--text-muted)'; }}
                        title="Delete"
                      >🗑️</button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add button */}
      {!showAdd && (
        <button
          className="btn-secondary"
          onClick={() => setShowAdd(true)}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          + Add category
        </button>
      )}
    </div>
  );
}
