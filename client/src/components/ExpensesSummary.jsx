import { useState } from "react";
import { createExpense } from "../services/expenses.js";
import { PieChart, Pie, Cell, Tooltip, Legend} from "recharts";
import "../css/Profile.css";
import "../css/Expenses.css";

const ExpenseSummary = ({ tripId, expenses, summary, trip }) => {
    const spent = Number(summary.total_expenses ?? 0);
    const budget = Number(trip.budget ?? 0);
    const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const COLORS = {
        food: "#d6795c",
        travel: "#7f9d6d",
        activity: "#9d5cd6",
        lodging: "#5c7fd6",
    };

    const categoryData = Object.values(
        expenses.reduce((acc, expense) => {
            if (!acc[expense.category]) {
                acc[expense.category] = {
                    name: expense.category,
                    value: 0,
                };
            }

            acc[expense.category].value += Number(expense.amount_usd);

            return acc;
        }, {})
    );

  return (
    <div className="expenses-summary">
        <h2> Budget Overview </h2>
        <div className="budget-spent-summary-card">
                    <div className="summary-item">
                        <h3> Total Budget </h3>
                        <p> $ {budget} </p>
                    </div>
                
                    <div className="summary-item">
                        <h3> Total Spent </h3>
                        <p> $ {spent} </p>
                    </div>
        </div>
        <div className="budget-progress-card__bar-wrap">
            <div className="budget-progress-card__bar-labels">
                <span>Budget spent</span>
                <span>{100 - percent.toFixed(1)}% left</span>
            </div>
            <div className="budget__progress-track" aria-label={`${percent}% spent`}>
                <div className={`budget__progress-fill${percent === 100 ? " budget__progress-fill--complete" : ""}`} style={{ width: `${percent}%` }} />
            </div>
        </div>
        <div className="expenses-summary__chart">
            <PieChart width={350} height={300}>
                <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                >
                    {categoryData.map((entry, index) => (
                        <Cell
                            key={entry.name}
                            fill={COLORS[entry.name]}
                        />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value, name, props) => {
                        const total = categoryData.reduce((sum, item) => sum + item.value, 0);
                        const percent = ((props.payload.value / total) * 100).toFixed(1);

                        return [`${percent}%`, props.payload.name];
                    }}
                />
                <Legend
                    iconType="circle"
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                />
            </PieChart>
      </div>
    </div>
  );
}

export default ExpenseSummary;