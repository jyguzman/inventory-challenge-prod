const isValidNumberInput = (quantity) => {
    quantity = parseFloat(quantity);
    if (!isNaN(quantity) && Number.isInteger(quantity) 
        && quantity >= 0) 
        return true;
    return false;
}

const isValidStringInput = (input) => {
    if (typeof input === "string" || input instanceof String) {
        if (input !== null && input.trim() !== "") {
            return true;
        }
    }
    return false;
}

const allItemFieldsPresent = (item) => {
    if (!('name') in item) return false;
    if (!('quantity') in item) return false;
    if (!('city') in item) return false;
    return true;
}

const isValidItem = (input) => {
    if (!allItemFieldsPresent(input)) return false;
    const name = input.name;
    const quantity = input.quantity;
    const city = input.city;
    return (isValidNumberInput(quantity) 
        && isValidStringInput(name)
        && isValidStringInput(city));
}

module.exports = { isValidItem, isValidNumberInput }