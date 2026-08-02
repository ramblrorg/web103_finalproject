import { useEffect, useState } from "react";
import {
  getDestinationsForTrip,
  createDestination,
  updateDestination,
  deleteDestination,
} from "../services/destinations.js";

// arrivalDate/departureDate here are plain "YYYY-MM-DD" strings from <input type="date">,
// so this cheap string comparison is enough to catch the obvious case; the
// trip-date-range check is left to the backend's existing validation.
const getDateOrderError = (arrivalDate, departureDate) => {
  if (arrivalDate && departureDate && departureDate < arrivalDate) {
    return "Departure date cannot be before arrival date.";
  }
  return null;
};

const emptyForm = { city: "", country: "", arrivalDate: "", departureDate: "", arrivalOrder: "" };

const toRequestBody = (form) => ({
  city: form.city,
  country: form.country,
  startDate: form.arrivalDate || undefined,
  endDate: form.departureDate || undefined,
  arrivalOrder: form.arrivalOrder || undefined,
});

// tripId is passed as a prop for now since routing isn't wired up yet on this branch.
const TripDestinations = ({ tripId }) => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [addForm, setAddForm] = useState(emptyForm);
  const [addError, setAddError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editError, setEditError] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [deleteError, setDeleteError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const data = await getDestinationsForTrip(tripId);
      setDestinations(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDestinations();
  }, [tripId]);

  const handleAddSubmit = async (event) => {
    event.preventDefault();
    setAddError(null);

    const dateOrderError = getDateOrderError(addForm.arrivalDate, addForm.departureDate);
    if (dateOrderError) return setAddError(dateOrderError);

    try {
      setIsAdding(true);
      await createDestination(tripId, toRequestBody(addForm));
      setAddForm(emptyForm);
      await loadDestinations();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const startEditing = (destination) => {
    setEditingId(destination.id);
    setEditError(null);
    setEditForm({
      city: destination.city,
      country: destination.country,
      arrivalDate: destination.start_date ? destination.start_date.slice(0, 10) : "",
      departureDate: destination.end_date ? destination.end_date.slice(0, 10) : "",
      arrivalOrder: destination.arrival_order ?? "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(emptyForm);
    setEditError(null);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    setEditError(null);

    const dateOrderError = getDateOrderError(editForm.arrivalDate, editForm.departureDate);
    if (dateOrderError) return setEditError(dateOrderError);

    try {
      setIsSavingEdit(true);
      await updateDestination(editingId, toRequestBody(editForm));
      cancelEditing();
      await loadDestinations();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (destination) => {
    const confirmed = window.confirm(
      `Delete ${destination.city}, ${destination.country}? Its activities will be removed too.`,
    );
    if (!confirmed) return;

    setDeleteError(null);
    try {
      setDeletingId(destination.id);
      await deleteDestination(destination.id);
      await loadDestinations();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p>Loading destinations...</p>;
  if (error) return <p>Error loading destinations: {error}</p>;

  return (
    <div>
      <h2>Destinations</h2>

      {deleteError && <p>{deleteError}</p>}

      {destinations.length === 0 ? (
        <p>No destinations yet. Add one below to get started.</p>
      ) : (
        <ul>
          {destinations.map((destination) =>
            editingId === destination.id ? (
              <li key={destination.id}>
                <form onSubmit={handleEditSubmit}>
                  <input
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    placeholder="City"
                    required
                  />
                  <input
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    placeholder="Country"
                    required
                  />
                  <input
                    type="date"
                    value={editForm.arrivalDate}
                    onChange={(e) => setEditForm({ ...editForm, arrivalDate: e.target.value })}
                  />
                  <input
                    type="date"
                    value={editForm.departureDate}
                    onChange={(e) => setEditForm({ ...editForm, departureDate: e.target.value })}
                  />
                  <input
                    type="number"
                    value={editForm.arrivalOrder}
                    onChange={(e) => setEditForm({ ...editForm, arrivalOrder: e.target.value })}
                    placeholder="Arrival order"
                  />
                  {editError && <p>{editError}</p>}
                  <button type="submit" disabled={isSavingEdit}>
                    {isSavingEdit ? "Saving..." : "Save"}
                  </button>
                  <button type="button" onClick={cancelEditing}>
                    Cancel
                  </button>
                </form>
              </li>
            ) : (
              <li key={destination.id}>
                {destination.city}, {destination.country}
                {destination.currency_code && ` (${destination.currency_code})`}
                {destination.start_date && ` — ${destination.start_date.slice(0, 10)}`}
                {destination.end_date && ` to ${destination.end_date.slice(0, 10)}`}
                {" "}
                <button type="button" onClick={() => startEditing(destination)}>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(destination)}
                  disabled={deletingId === destination.id}
                >
                  {deletingId === destination.id ? "Deleting..." : "Delete"}
                </button>
              </li>
            ),
          )}
        </ul>
      )}

      <form onSubmit={handleAddSubmit}>
        <h3>Add Destination</h3>

        <label>
          City
          <input
            value={addForm.city}
            onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
            placeholder="e.g. Sapporo"
            required
          />
        </label>

        <label>
          Country
          <input
            value={addForm.country}
            onChange={(e) => setAddForm({ ...addForm, country: e.target.value })}
            placeholder="Japan"
            required
          />
        </label>

        <label>
          Arrival Date
          <input
            type="date"
            value={addForm.arrivalDate}
            onChange={(e) => setAddForm({ ...addForm, arrivalDate: e.target.value })}
          />
        </label>

        <label>
          Departure Date
          <input
            type="date"
            value={addForm.departureDate}
            onChange={(e) => setAddForm({ ...addForm, departureDate: e.target.value })}
          />
        </label>

        <label>
          Arrival Order
          <input
            type="number"
            value={addForm.arrivalOrder}
            onChange={(e) => setAddForm({ ...addForm, arrivalOrder: e.target.value })}
          />
        </label>

        {addError && <p>{addError}</p>}

        <button type="submit" disabled={isAdding}>
          {isAdding ? "Adding..." : "Add Destination"}
        </button>
      </form>
    </div>
  );
};

export default TripDestinations;
