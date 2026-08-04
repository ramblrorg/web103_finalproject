import React from "react";
import { useState } from "react";
import ExpenseForm from "./ExpenseItemForm.jsx";
import { deleteExpense} from "../services/expenses.js";
import "../css/Expenses.css";

const ExpensesListSection = ({ tripId, setExpenses, expenses, onUpdated }) => {
    const [showAddForm, setShowAddForm] = useState(false);

    const [selectedExpense, setSelectedExpense] = useState(null);
    
    const [deleteError, setDeleteError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
   
    const handleDelete = async (expense) => {
        try {
            await deleteExpense(expense.id);

            setExpenses((prev) =>
                prev.filter((e) => e.id !== expense.id)
            );

            await onUpdated();

        } catch (err) {
            setDeleteError(err.message);
        }
    };


    return (
        <div className="expenses-list-container">
            <div className="expenses-list">   
                <div className="expenses-list__header">           
                    <h2> Recent Expenses </h2>
                    <p> Your latest Trip Expenses </p>
                </div>
                
                {deleteError && (
                    <div className="expenses-list__error" role="alert">
                        {deleteError}
                    </div>
                )}


                    {expenses.map((expense) => (
                    <div key={expense.id} className="expense-card">

                        <div className="expense-card__info">
                            <h3>$ {expense.amount_usd}</h3>
                            <p className={`expense-card__category ${expense.category}`}>
                                {expense.category}
                            </p>
                        </div>
                        <div className="expense-card__meta">
                            <p>{expense.description || ""}</p>
                            <p>{expense.status}</p>
                        </div>

                        <div className="expense-card__actions">

                            <button
                                type="button"
                                className="btn btn--secondary"
                                onClick={() => setSelectedExpense(expense)}
                            >
                                Edit
                            </button>


                            <button
                                type="button"
                                className="btn btn--danger"
                                onClick={() => handleDelete(expense)}
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                ))}
                    <div className="expense-card__options">
                        <button
                            type="button"
                            className="btn btn--secondary"
                            onClick={() => setShowAddForm(true)}
                        >
                            + Add Expense
                        </button>
                    </div>
                </div>
                {(showAddForm || selectedExpense) && (
                    <ExpenseForm
                        tripId={tripId}
                        expense={selectedExpense}
                        onSaved={async (savedExpense) => {
                            if (selectedExpense) {
                                setExpenses((prev) =>
                                    prev.map((expense) =>
                                        expense.id === savedExpense.id
                                            ? savedExpense
                                            : expense
                                    )
                                );
                            } else {
                                setExpenses((prev) => [
                                    ...prev,
                                    savedExpense
                                ]);
                            }

                            await onUpdated();

                            setSelectedExpense(null);
                            setShowAddForm(false);
                        }}
                        onCancel={() => {
                            setSelectedExpense(null);
                            setShowAddForm(false);
                        }}
                    />
                )}
        </div>
    )
}

export default ExpensesListSection;