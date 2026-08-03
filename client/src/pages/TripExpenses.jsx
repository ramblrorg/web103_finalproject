import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import ExpenseForm from "../components/AddExpenseForm.jsx";
import { getExpensesForTrip, getExpensesSummaryForTrip, createExpense, updateExpense, deleteExpense } from "../services/expenses.js";
import { fetchTripById } from '../services/trips.js';
import "../css/Profile.css";
import "../css/Expenses.css";

const emptyForm = { amount_usd: "", category: "", status: "", description: "", spent_at: "" };


const TripExpenses = () => {
    const { tripId } = useParams();
    
    const [trip, setTrip] = useState(null);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [showAddForm, setShowAddForm] = useState(false);
    
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(emptyForm);
    const [editError, setEditError] = useState(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    
    const [deleteError, setDeleteError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const [expenses, setExpenses] = useState([]);

    //
    useEffect(() => {
        const fetchData = async () => {
            try {
                const tripData = await fetchTripById(tripId);
                setTrip(tripData);
                setDestinations(tripData.destinations || []);
                const expensesData = await getExpensesForTrip(tripId);
                setExpenses(expensesData);
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };
        fetchData();
    }, [tripId]);

    //get expenses summary
    const [summary, setSummary] = useState(null);
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const summaryData = await getExpensesSummaryForTrip(tripId);
                setSummary(summaryData);
            }
            catch (err) {
                setError(err.message);
            }
        };
        fetchSummary();
    }, [tripId]);
    

    return (
        <div className = "page">
            <Sidebar />

            <main className = "expenses">
                <header className="expenses-header">
                    <h2>Expenses</h2>
                </header>

                <div className="expenses-summary">
                    <h2> Budget Overview </h2>
                    <div className="summary-item">
                        <h3> Total Budget </h3>
                        <p> {summary?.total_budget || '$0.00'} </p>
                    </div>
                    <div className="summary-item">
                        <h3> Total Spent </h3>
                        <p> {summary?.total_spent || '$0.00'} </p>
                    </div>
                </div>

                <div className="expenses-list">
                    <h2> Recent Expenses </h2>
                    {expenses.map((expense) => (
                        <div key={expense.id} className="expense-item">
                            <p>{expense.description? expense.description : ''}</p>
                            <p>{expense.amount_usd}</p>
                            <p>{expense.category}</p>
                            <p>{expense.status}</p>
                        </div>
                    ))}
                    <div className="expense-item">
                        <p> See all expenses </p>
                    </div>
                </div>
                {showAddForm && (
                    <ExpenseForm
                        tripId={tripId}
                        onCreated={(newExpense) => {
                            setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
                            setShowAddForm(false);
                        }}
                        onCancel={() => setShowAddForm(false)}
                    />
                )}

                <button type="button" className="btn btn--primary" onClick={() => setShowAddForm(true)}>
                    + Add Expense
                </button>
            </main>
        </div>
    )
};

export default TripExpenses;