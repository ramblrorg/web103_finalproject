import { useEffect, useState } from "react";
import PackingItemForm from "./PackingItemForm.jsx";
import {
  getPackingListForTrip,
  generatePackingList,
  updatePackingListItem,
  deletePackingListItem,
} from "../services/packingList.js";
import { splitPackingItems, getPackingProgress } from "../helpers/packingFormat.js";
import "../css/PackingList.css";

const PackingListSection = ({ tripId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateNotice, setGenerateNotice] = useState(null);
  const [formMode, setFormMode] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const itemsData = await getPackingListForTrip(tripId);
      setItems(itemsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tripId]);

  const closeForm = () => setFormMode(null);

  const handleSaved = async () => {
    closeForm();
    await loadData();
  };

  const handleToggle = async (item) => {
    setActionError(null);
    setItems((prev) =>
      prev.map((current) =>
        current.id === item.id ? { ...current, is_packed: !current.is_packed } : current,
      ),
    );

    try {
      setBusyId(item.id);
      await updatePackingListItem(item.id, { is_packed: !item.is_packed });
    } catch (err) {
      setItems((prev) =>
        prev.map((current) =>
          current.id === item.id ? { ...current, is_packed: item.is_packed } : current,
        ),
      );
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Remove "${item.name}" from the packing list?`);
    if (!confirmed) return;

    setActionError(null);
    try {
      setBusyId(item.id);
      await deletePackingListItem(item.id);
      await loadData();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleGenerate = async () => {
    setActionError(null);
    setGenerateNotice(null);

    try {
      setIsGenerating(true);
      const result = await generatePackingList(tripId);
      const addedCount = result.created?.length ?? 0;
      const skippedCount = result.skipped ?? 0;

      setGenerateNotice(
        addedCount === 0
          ? "All essentials are already on your list."
          : `Added ${addedCount} essential${addedCount === 1 ? "" : "s"}.` +
              (skippedCount > 0 ? ` (${skippedCount} already on the list.)` : ""),
      );
      await loadData();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderRow = (item) => (
    <div className={`packing-row${item.is_packed ? " packing-row--packed" : ""}`} key={item.id}>
      <button
        type="button"
        className={`packing-row__check${item.is_packed ? " packing-row__check--on" : ""}`}
        role="checkbox"
        aria-checked={item.is_packed}
        aria-label={item.is_packed ? `Mark ${item.name} as not packed` : `Mark ${item.name} as packed`}
        onClick={() => handleToggle(item)}
        disabled={busyId === item.id}
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="packing-row__copy">
        <span className="packing-row__name">{item.name}</span>
        <span className="packing-row__status">{item.is_packed ? "Packed and ready" : "Still to pack"}</span>
      </div>

      <div className="packing-row__actions">
        <button
          type="button"
          className="packing-row__icon-btn"
          aria-label={`Edit ${item.name}`}
          onClick={() => setFormMode(item)}
          disabled={busyId === item.id}
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M11.3 2.3a1.5 1.5 0 0 1 2.1 2.1L5.5 12.3l-2.8.7.7-2.8 7.9-7.9Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          className="packing-row__icon-btn packing-row__icon-btn--delete"
          aria-label={`Delete ${item.name}`}
          onClick={() => handleDelete(item)}
          disabled={busyId === item.id}
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3.5 4.5h9M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M4.5 4.5l.6 8a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9l.6-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderCategory = (title, categoryItems, emptyHint, icon) => {
    const packedCount = categoryItems.filter((item) => item.is_packed).length;

    return (
      <article className="packing-category">
        <div className="packing-category__header">
          <div className="packing-category__heading">
            <span className="packing-category__icon" aria-hidden="true">{icon}</span>
            <div>
              <h3 className="packing-category__title">{title}</h3>
              <p className="packing-category__summary">
                {categoryItems.length === 0
                  ? "Nothing here yet"
                  : `${packedCount} of ${categoryItems.length} packed`}
              </p>
            </div>
          </div>
          <span className="packing-category__count">{categoryItems.length}</span>
        </div>

        {categoryItems.length === 0 ? (
          <p className="packing-category__empty">{emptyHint}</p>
        ) : (
          <div className="packing-category__list">{categoryItems.map(renderRow)}</div>
        )}
      </article>
    );
  };

  if (loading) {
    return (
      <section className="packing-section">
        <div className="packing-section__heading">
          <span className="packing-section__eyebrow">Travel checklist</span>
          <h2>Packing List</h2>
        </div>
        <div className="packing-state-card packing-state-card--loading">
          <span className="packing-spinner" aria-hidden="true" />
          <p>Loading your packing list…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="packing-section">
        <div className="packing-section__heading">
          <span className="packing-section__eyebrow">Travel checklist</span>
          <h2>Packing List</h2>
        </div>
        <div className="packing-state-card packing-state-card--error">
          <div className="packing-state-card__icon" aria-hidden="true">!</div>
          <h3>We couldn’t load your packing list</h3>
          <p>{error}</p>
          <button type="button" className="packing-btn packing-btn--secondary" onClick={loadData}>Try again</button>
        </div>
      </section>
    );
  }

  const { essentials, custom } = splitPackingItems(items);
  const { packed, total, percent } = getPackingProgress(items);
  const remaining = Math.max(total - packed, 0);

  return (
    <section className="packing-section">
      <div className="packing-list-header">
        <div>
          <span className="packing-section__eyebrow">Travel checklist</span>
          <h2>Packing List</h2>
          <p>Keep your essentials and personal items organized before your trip.</p>
        </div>

        <div className="packing-list-header__actions">
          <button type="button" className="packing-btn packing-btn--secondary" onClick={handleGenerate} disabled={isGenerating}>
            <span aria-hidden="true">✦</span> {isGenerating ? "Generating…" : "Generate packing list"}
          </button>
          <button type="button" className="packing-btn packing-btn--primary" onClick={() => setFormMode("add")}>
            <span aria-hidden="true">＋</span> Add item
          </button>
        </div>
      </div>

      {actionError && <div className="packing-alert packing-alert--error" role="alert">{actionError}</div>}
      {generateNotice && <div className="packing-alert packing-alert--success" role="status">{generateNotice}</div>}

      <div className="packing-progress-card">
        <div className="packing-progress-card__copy">
          <span className="packing-progress-card__kicker">Trip readiness</span>
          <h3>{total === 0 ? "Your list is ready when you are" : percent === 100 ? "You’re all packed!" : "You’re getting closer"}</h3>
          <p>
            {total === 0
              ? "Add a few items or generate the essentials to begin."
              : remaining === 0
                ? "Everything is checked off. Time for your next adventure."
                : `${remaining} ${remaining === 1 ? "item" : "items"} left before you’re ready to go.`}
          </p>
        </div>

        <div className="packing-progress-card__meter" style={{ "--packing-progress": percent }}>
          <div className="packing-progress-card__ring">
            <div className="packing-progress-card__ring-center">
              <strong>{percent}%</strong>
              <span>packed</span>
            </div>
          </div>
          <div className="packing-progress-card__numbers">
            <span><strong>{packed}</strong> packed</span>
            <span><strong>{total}</strong> total</span>
          </div>
        </div>

        <div className="packing-progress-card__bar-wrap">
          <div className="packing-progress-card__bar-labels">
            <span>Overall progress</span>
            <span>{packed} / {total}</span>
          </div>
          <div className="packing__progress-track" aria-label={`${percent}% packed`}>
            <div className={`packing__progress-fill${percent === 100 ? " packing__progress-fill--complete" : ""}`} style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="packing-empty-card">
          <div className="packing-empty-card__illustration" aria-hidden="true">
            <span className="packing-empty-card__sun" />
            <span className="packing-empty-card__case">🧳</span>
          </div>
          <span className="packing-empty-card__eyebrow">A fresh start</span>
          <h3>Let’s build your travel checklist</h3>
          <p>Generate a helpful set of essentials or add the personal items you never travel without.</p>
          <div className="packing-empty-card__actions">
            <button type="button" className="packing-btn packing-btn--primary" onClick={handleGenerate} disabled={isGenerating}>
              <span aria-hidden="true">✦</span> {isGenerating ? "Generating…" : "Generate essentials"}
            </button>
            <button type="button" className="packing-btn packing-btn--secondary" onClick={() => setFormMode("add")}>
              <span aria-hidden="true">＋</span> Add your own item
            </button>
          </div>
        </div>
      ) : (
        <div className="packing__categories">
          {renderCategory("Essentials", essentials, "Generate essentials whenever you’re ready.", "✦")}
          {renderCategory("Your Items", custom, "Add the personal things you don’t want to forget.", "♡")}
        </div>
      )}

      {formMode && (
        <PackingItemForm
          tripId={tripId}
          item={formMode === "add" ? null : formMode}
          existingItems={items}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      )}
    </section>
  );
};

export default PackingListSection;