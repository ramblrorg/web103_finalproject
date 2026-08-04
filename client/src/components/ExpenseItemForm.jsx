import { useEffect, useState } from "react";
import { createExpense, updateExpense } from "../services/expenses.js";
import "../css/Profile.css";
import "../css/AddDestinationForm.css";

const ExpenseForm = ({ tripId, expense, onSaved, onCancel }) => {
  const isEditing = Boolean(expense);

  const [form, setForm] = useState({
    description: expense?.description ?? "",
    amount_usd: expense?.amount_usd ?? "",
    category: expense?.category ?? "",
    status: expense?.status ?? "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const category_options = ["lodging", "travel", "activity", "food"];
  const status_options = ["estimated", "actual"];

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onCancel]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);

      let savedExpense;

      if (isEditing) {
        savedExpense = await updateExpense(expense.id, {
          amount_usd: form.amount_usd,
          category: form.category,
          status: form.status,
          description: form.description,
        });
      } else {
        savedExpense = await createExpense(tripId, {
          amount_usd: form.amount_usd,
          category: form.category,
          status: form.status,
          description: form.description,
        });
      }

      await onSaved(savedExpense);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="modal-backdrop">
      <div className="modal">

        <div className="modal__header">
          <h2>
            {isEditing ? "Edit Expense" : "Add Expense"}
          </h2>

          <button
            type="button"
            className="modal__close"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>


        <form className="profile__form" onSubmit={handleSubmit}>

          {error && (
            <div className="profile__form-error" role="alert">
              {error}
            </div>
          )}


          <label className="field">
            <span className="field__label">Amount (USD)</span>
            <input
              type="number"
              name="amount_usd"
              value={form.amount_usd}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </label>


          <label className="field">
            <span className="field__label">Category</span>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="" disabled>
                Select a category
              </option>

              {category_options.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}

            </select>
          </label>


          <label className="field">
            <span className="field__label">Status</span>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="" disabled>
                Select a status
              </option>

              {status_options.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}

            </select>
          </label>


          <label className="field">
            <span className="field__label">Description</span>

            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </label>



          <button className="btn btn--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Expense"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;