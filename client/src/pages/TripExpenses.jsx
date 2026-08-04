import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import ExpensesListSection from "../components/ExpensesListSection.jsx"; //to display list of expenses
import ExpenseSummary from "../components/ExpensesSummary.jsx"; //to display summary + piechart
import ExpenseForm from "../components/ExpenseItemForm.jsx"; //to add new expense
import {
  getExpensesForTrip,
  getExpensesSummaryForTrip,
} from "../services/expenses.js";
import { fetchTripById } from "../services/trips.js";
import "../css/Profile.css";
import "../css/Expenses.css";

const TripExpenses = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const tripData = await fetchTripById(tripId);
        setTrip(tripData);
        await loadData();
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    loadPage();
  }, [tripId]);

  //get expenses summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const summaryData = await getExpensesSummaryForTrip(tripId);
        setSummary(summaryData);
        console.log("Summary response:", summaryData);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSummary();
  }, [tripId]);

  const loadData = async () => {
    try {
      const [expensesData, summaryData] = await Promise.all([
        getExpensesForTrip(tripId),
        getExpensesSummaryForTrip(tripId),
      ]);

      setExpenses(expensesData);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
    }
  };

  const spent = Number(summary?.total_expenses ?? 0);
  const budget = Number(trip?.budget ?? 0);
  const percent =
    trip && trip.budget ? Math.min((spent / budget) * 100, 100) : 0;

  if (loading) {
    return (
      <section className="expenses-section">
        <div className="expenses-section__heading">
          <span className="expenses-section__eyebrow">Travel Budget</span>
          <h2>Expenses</h2>
        </div>
        <div className="expenses-state-card expenses-state-card--loading">
          <span className="expenses-spinner" aria-hidden="true" />
          <p>Loading your expenses…</p>
        </div>
      </section>
    );
  }

  return (
    <div className="page">
      <Sidebar />
      <main className="expenses-page">
        <header className="expenses-header">
          <Link to={`/trips/${tripId}`} className="packing-page__back">
            ← Back to Trip Dashboard
          </Link>
          <div className="expenses-header__inner">
            <div className="expenses-header__title">
              <h2>Expenses</h2>
              <p>
                Keep track of your trip expenses and stay within your budget.
              </p>
            </div>

            {/** TODO: FUTURE WORK TO ADD IN EXCHANGE RATE RENDERER WITH VALID API INFO */}
            {/* <div className="expenses-header__exchange-rate">
                            <h3> Exchange Rate </h3>
                            <p> 1 USD = N/A </p>
                        </div> */}
          </div>
        </header>

        <div className="expenses_budget_spending">
          <div className="summary-chart-container">
            {summary && (
              <ExpenseSummary
                tripId={tripId}
                expenses={expenses}
                summary={summary}
                trip={trip}
              />
            )}
          </div>

          <ExpensesListSection
            tripId={tripId}
            expenses={expenses}
            setExpenses={setExpenses}
            summary={summary}
            onUpdated={loadData}
          />
        </div>
        {showAddForm && (
          <ExpenseForm
            tripId={tripId}
            summary={summary}
            onSaved={async (newExpense) => {
              await loadData();
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setShowAddForm(true)}
        >
          + Add Expense
        </button>
      </main>
    </div>
  );
};

export default TripExpenses;
