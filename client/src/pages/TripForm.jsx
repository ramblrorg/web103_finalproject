import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import { fetchTripById, createTrip, updateTrip } from "../services/trips.js";
import { toDateInputValue, formatDateRange, formatBudget, getStatusLabel, validateTripForm } from "../helpers/tripFormat.js";
import placeholderImg from "../assets/trip-placeholder.svg";
import "../css/Trips.css"; // reuses .trip-card styles for the live preview panel
import "../css/TripForm.css";

const EMPTY_FORM = { title: "", startDate: "", endDate: "", budget: "", imageUrl: "" };

const TripForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | error
  const [saveError, setSaveError] = useState("");
  const [previewImageFailed, setPreviewImageFailed] = useState(false);

  // Only relevant in edit mode -- loading the existing trip before the form can render.
  const [loadStatus, setLoadStatus] = useState(isEditMode ? "loading" : "ready"); // loading | ready | error
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!isEditMode) return;

    setLoadStatus("loading");
    fetchTripById(id)
      .then((trip) => {
        setForm({
          title: trip.title || "",
          startDate: toDateInputValue(trip.start_date),
          endDate: toDateInputValue(trip.end_date),
          budget: trip.budget ?? "",
          imageUrl: trip.image_url || "",
        });
        setLoadStatus("ready");
      })
      .catch((err) => {
        setLoadError(err.message || "Failed to load trip.");
        setLoadStatus("error");
      });
  }, [id, isEditMode]);

  const handleFieldChange = (field) => (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    if (field === "imageUrl") setPreviewImageFailed(false);
  };

  const goBackToTrips = () => navigate("/trips");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateTripForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaveStatus("saving");
    setSaveError("");

    const payload = {
      title: form.title.trim(),
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      budget: form.budget === "" ? undefined : Number(form.budget),
      // Sending undefined (vs "") when left blank matches how the other
      // optional fields behave here: the backend COALESCEs on PATCH, so an
      // intentionally-cleared field won't currently null out an existing
      // value on edit -- same known limitation as budget/dates today, not
      // something new introduced by this field.
      imageUrl: form.imageUrl.trim() || undefined,
    };

    try {
      if (isEditMode) {
        await updateTrip(id, payload);
      } else {
        await createTrip(payload);
      }
      navigate("/trips");
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err.message || "Failed to save trip. Please try again.");
    }
  };

  const previewDates = formatDateRange(form.startDate, form.endDate);
  const previewBudget = formatBudget(form.budget);
  const previewStatus = getStatusLabel(form.startDate, form.endDate);
  const previewShowsPhoto = Boolean(form.imageUrl.trim()) && !previewImageFailed;
  const previewCoverSrc = previewShowsPhoto ? form.imageUrl.trim() : placeholderImg;

  return (
    <div className="page">
      <Sidebar />

      <main className="trip-form-page">
        <button type="button" className="trip-form__back" onClick={goBackToTrips}>
          <span aria-hidden="true">←</span> Back to My Trips
        </button>

        <div className="trip-form__hero">
          <h1 className="trip-form__title">{isEditMode ? "Edit Trip" : "Create New Trip"}</h1>
          <p className="trip-form__subtitle">
            {isEditMode
              ? "Update your trip's details below."
              : "Give your next adventure a name, some dates, and a budget to work with."}
          </p>
        </div>

        {isEditMode && loadStatus === "loading" && (
          <div className="trip-form__card trip-form__status">Loading trip…</div>
        )}

        {isEditMode && loadStatus === "error" && (
          <div className="trip-form__card trip-form__status trip-form__status--error">
            <p>{loadError}</p>
            <button type="button" className="btn btn--secondary" onClick={goBackToTrips}>
              Back to My Trips
            </button>
          </div>
        )}

        {loadStatus === "ready" && (
          <div className="trip-form__layout">
            <form className="trip-form__card trip-form" onSubmit={handleSubmit} noValidate>
              {saveStatus === "error" && (
                <div className="form-error" role="alert">
                  {saveError}
                </div>
              )}

              <div className="trip-form__section">
                <p className="trip-form__section-label">Trip Basics</p>

                <label className="field">
                  <span className="field__label">Trip Name</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={handleFieldChange("title")}
                    placeholder="e.g. Summer in Japan"
                    disabled={saveStatus === "saving"}
                    aria-invalid={Boolean(fieldErrors.title)}
                    autoFocus
                  />
                  {fieldErrors.title && <span className="field__error">{fieldErrors.title}</span>}
                </label>
              </div>

              <div className="trip-form__section">
                <p className="trip-form__section-label">Dates &amp; Budget</p>

                <div className="trip-form__row">
                  <label className="field">
                    <span className="field__label">Start Date</span>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={handleFieldChange("startDate")}
                      disabled={saveStatus === "saving"}
                      aria-invalid={Boolean(fieldErrors.startDate)}
                    />
                    {fieldErrors.startDate && (
                      <span className="field__error">{fieldErrors.startDate}</span>
                    )}
                  </label>

                  <label className="field">
                    <span className="field__label">End Date</span>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={handleFieldChange("endDate")}
                      disabled={saveStatus === "saving"}
                      aria-invalid={Boolean(fieldErrors.endDate)}
                    />
                    {fieldErrors.endDate && (
                      <span className="field__error">{fieldErrors.endDate}</span>
                    )}
                  </label>
                </div>

                <label className="field">
                  <span className="field__label">Budget (USD)</span>
                  <div className={`trip-form__budget-input${fieldErrors.budget ? " trip-form__budget-input--error" : ""}`}>
                    <span className="trip-form__budget-prefix">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.budget}
                      onChange={handleFieldChange("budget")}
                      placeholder="3000"
                      disabled={saveStatus === "saving"}
                      aria-invalid={Boolean(fieldErrors.budget)}
                    />
                  </div>
                  {fieldErrors.budget && <span className="field__error">{fieldErrors.budget}</span>}
                </label>
              </div>

              <div className="trip-form__section">
                <p className="trip-form__section-label">Cover Photo (Optional)</p>

                <label className="field">
                  <span className="field__label">Image URL</span>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={handleFieldChange("imageUrl")}
                    placeholder="https://example.com/photo.jpg"
                    disabled={saveStatus === "saving"}
                    aria-invalid={Boolean(fieldErrors.imageUrl)}
                  />
                  {fieldErrors.imageUrl ? (
                    <span className="field__error">{fieldErrors.imageUrl}</span>
                  ) : (
                    <span className="trip-form__hint">
                      Paste a link to a photo. Leave blank to use a placeholder.
                    </span>
                  )}
                </label>
              </div>

              <div className="trip-form__actions">
                <button type="submit" className="btn btn--primary" disabled={saveStatus === "saving"}>
                  {saveStatus === "saving"
                    ? "Saving…"
                    : isEditMode
                      ? "Save Changes"
                      : "New Trip"}
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={goBackToTrips}
                  disabled={saveStatus === "saving"}
                >
                  Cancel
                </button>
              </div>
            </form>

            <aside className="trip-form__preview">
              <p className="trip-form__preview-label">Preview</p>
              <div className="trip-card trip-card--preview">
                <div className="trip-card__cover">
                  <img
                    className="trip-card__cover-img"
                    src={previewCoverSrc}
                    alt=""
                    onError={() => setPreviewImageFailed(true)}
                  />
                  {previewStatus && <span className="trip-card__status">{previewStatus}</span>}
                </div>
                <div className="trip-card__body">
                  <h3 className="trip-card__title">{form.title.trim() || "Untitled Trip"}</h3>
                  <p className="trip-card__dates">{previewDates}</p>
                  {previewBudget && (
                    <div className="trip-card__footer">
                      <span className="trip-card__budget">{previewBudget}</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="trip-form__preview-hint">
                This is roughly how your trip card will look on My Trips.
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default TripForm;
