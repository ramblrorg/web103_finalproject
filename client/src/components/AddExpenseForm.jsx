import { useState } from "react";
import { createExpense } from "../services/expenses.js";
import "../css/Profile.css";
import "../css/AddDestinationForm.css";

const ExpenseForm = ({ tripId, onCreated, onCancel }) => {
  const [form, setForm] = useState({ description: "", amount_usd: "", category: "", status: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const category_options = ["lodging", "travel", "activity", "food"];
  const status_options = ["estimated", "actual"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
        setIsSubmitting(true);
        await createExpense(tripId, {
            amount_usd: form.amount_usd,
            category: form.category,
            status: form.status,
            description: form.description,
        });
      onCreated();
      setForm({ description: "", amount_usd: "", category: "", status: "" });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
        <div className="modal">
            <div className="modal__header">
                <h2>Add Expense</h2>
                <button type="button" className="modal__close" onClick={onCancel} aria-label="Close">
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
                    <span className="field__label"> Amount (USD) </span>
                    <input
                        type="number"
                        name="amount_usd"
                        value={form.amount_usd}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label className="field">
                    <span className="field__label"> Category </span>
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                        >

                        <option value="" disabled> Select a category </option>
                        {category_options.map((option) => (
                            <option key={option} value={option}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                        ))}
                    </select> 
                </label>
                <label className="field">
                    <span className="field__label"> Status </span>
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        required
                        >
                        <option value="" disabled> Select a status </option>
                        {status_options.map((option) => (
                            <option key={option} value={option}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="field">
                    <span className="field__label"> Description </span>
                    <input
                        type="text"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                    />
                </label>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Expense"}
                </button>
            </form>
        </div>
    </div>
  )
};

export default ExpenseForm;