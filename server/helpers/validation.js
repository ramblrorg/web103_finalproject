const isValidId = (id) => /^\d+$/.test(id);
const isValidDate = (value) => !Number.isNaN(Date.parse(value));
const isValidBudget = (value) => !Number.isNaN(Number(value));

export { isValidId, isValidDate, isValidBudget };
