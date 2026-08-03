import { useEffect, useState } from "react";
import { createPackingListItem, updatePackingListItem } from "../services/packingList.js";
import { findMatchingItem } from "../helpers/packingFormat.js";
import "../css/PackingList.css";

const PackingItemForm = ({ tripId, item, existingItems, onSaved, onCancel }) => {
  const isEditing = Boolean(item);
  const [name, setName] = useState(item?.name ?? "");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onCancel]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Item name is required.");
      return;
    }

    const duplicate = findMatchingItem(
      existingItems.filter((existing) => existing.id !== item?.id),
      trimmed,
    );

    if (duplicate) {
      setError(`"${duplicate.name}" is already on the list.`);
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing) {
        await updatePackingListItem(item.id, { name: trimmed });
      } else {
        await createPackingListItem(tripId, { name: trimmed });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="packing-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !isSubmitting && onCancel()}>
      <div className="packing-modal" role="dialog" aria-modal="true" aria-labelledby="packing-modal-title">
        <div className="packing-modal__art" aria-hidden="true">
          <span className="packing-modal__art-cloud packing-modal__art-cloud--one" />
          <span className="packing-modal__art-cloud packing-modal__art-cloud--two" />
          <span className="packing-modal__art-icon">🧳</span>
        </div>

        <div className="packing-modal__body">
          <div className="packing-modal__header">
            <div>
              <span className="packing-modal__eyebrow">Packing checklist</span>
              <h2 id="packing-modal-title">{isEditing ? "Edit your item" : "Add something to pack"}</h2>
              <p>{isEditing ? "Update the name and keep your list tidy." : "Add one of the personal must-haves for your trip."}</p>
            </div>
            <button type="button" className="packing-modal__close" onClick={onCancel} aria-label="Close" disabled={isSubmitting}>×</button>
          </div>

          <form className="packing-form" onSubmit={handleSubmit}>
            {error && <div className="packing-alert packing-alert--error" role="alert">{error}</div>}

            <label className="packing-field">
              <span className="packing-field__label">Item name</span>
              <div className="packing-field__input-wrap">
                <span className="packing-field__input-icon" aria-hidden="true">✓</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Sunscreen"
                  required
                  autoFocus
                  disabled={isSubmitting}
                  maxLength={120}
                />
              </div>
              <span className="packing-field__hint">Try “passport,” “camera,” or “favorite book.”</span>
            </label>

            <div className="packing-form__actions">
              <button type="button" className="packing-btn packing-btn--secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="packing-btn packing-btn--primary" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Add to list"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PackingItemForm;