import { ApiError } from "./ApiError.js";

export const validateLogin = (req, res, next) => {
  const { email, password, role, rememberMe } = req.body;

  if (!email || typeof email !== "string" || email.trim() === "") {
    throw new ApiError(400, "Email is required", "VALIDATION_ERROR");
  }

  if (!password || typeof password !== "string" || password === "") {
    throw new ApiError(400, "Password is required", "VALIDATION_ERROR");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new ApiError(400, "Invalid email format", "VALIDATION_ERROR");
  }

  if (!role || typeof role !== "string" || role.trim() === "") {
    throw new ApiError(400, "Role is required", "VALIDATION_ERROR");
  }

  const allowedRoles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(400, "Invalid role selected.", "VALIDATION_ERROR");
  }

  if (rememberMe !== undefined && typeof rememberMe !== "boolean") {
    throw new ApiError(400, "RememberMe must be a boolean value", "VALIDATION_ERROR");
  }

  next();
};


export const validateRegister = (req, res, next) => {
  const { email, password, full_name, role } = req.body;

  if (!email || typeof email !== "string") {
    throw new ApiError(400, "Email is required", "VALIDATION_ERROR");
  }

  if (!password || typeof password !== "string") {
    throw new ApiError(400, "Password is required", "VALIDATION_ERROR");
  }

  if (!full_name || typeof full_name !== "string") {
    throw new ApiError(400, "Full name is required", "VALIDATION_ERROR");
  }

  if (!role || typeof role !== "string") {
    throw new ApiError(400, "Role is required", "VALIDATION_ERROR");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new ApiError(400, "Invalid email format", "VALIDATION_ERROR");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long", "VALIDATION_ERROR");
  }

  const allowedRoles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(
      400,
      `Invalid role. Allowed roles are: ${allowedRoles.join(", ")}`,
      "VALIDATION_ERROR"
    );
  }

  next();
};

export const validateCreateVehicle = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
  }

  const {
    registration_number,
    vehicle_name,
    vehicle_type,
    max_load_capacity,
    odometer,
    acquisition_cost,
    status
  } = req.body;

  if (!registration_number || typeof registration_number !== "string" || registration_number.trim() === "") {
    throw new ApiError(400, "Registration number is required", "VALIDATION_ERROR");
  }
  req.body.registration_number = registration_number.trim().toUpperCase();

  if (!vehicle_name || typeof vehicle_name !== "string" || vehicle_name.trim().length < 2) {
    throw new ApiError(400, "Vehicle name must be at least 2 characters long", "VALIDATION_ERROR");
  }
  req.body.vehicle_name = vehicle_name.trim();

  const allowedTypes = ["Truck", "Van", "Pickup", "Trailer", "Mini Truck"];
  if (!vehicle_type || typeof vehicle_type !== "string" || !allowedTypes.includes(vehicle_type)) {
    throw new ApiError(400, `Invalid vehicle type. Allowed types are: ${allowedTypes.join(", ")}`, "VALIDATION_ERROR");
  }

  const capacity = Number(max_load_capacity);
  if (max_load_capacity === undefined || max_load_capacity === null || isNaN(capacity) || capacity <= 0) {
    throw new ApiError(400, "Maximum load capacity must be a positive number", "VALIDATION_ERROR");
  }
  req.body.max_load_capacity = capacity;

  if (odometer !== undefined && odometer !== null) {
    const odo = Number(odometer);
    if (isNaN(odo) || odo < 0) {
      throw new ApiError(400, "Odometer reading cannot be negative", "VALIDATION_ERROR");
    }
    req.body.odometer = odo;
  } else {
    req.body.odometer = 0;
  }

  const cost = Number(acquisition_cost);
  if (acquisition_cost === undefined || acquisition_cost === null || isNaN(cost) || cost < 0) {
    throw new ApiError(400, "Acquisition cost must be a non-negative number", "VALIDATION_ERROR");
  }
  req.body.acquisition_cost = cost;

  const allowedStatuses = ["Available", "On Trip", "In Shop", "Retired"];
  if (status !== undefined && status !== null) {
    if (typeof status !== "string" || !allowedStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}`, "VALIDATION_ERROR");
    }
  } else {
    req.body.status = "Available";
  }

  next();
};

export const validateUpdateVehicle = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
  }

  const {
    vehicle_name,
    vehicle_type,
    max_load_capacity,
    capacity,
    odometer,
    acquisition_cost,
    status
  } = req.body;

  if (vehicle_name !== undefined) {
    if (typeof vehicle_name !== "string" || vehicle_name.trim().length < 2) {
      throw new ApiError(400, "Vehicle name must be at least 2 characters long", "VALIDATION_ERROR");
    }
    req.body.vehicle_name = vehicle_name.trim();
  }

  if (vehicle_type !== undefined) {
    const allowedTypes = ["Truck", "Van", "Pickup", "Trailer", "Mini Truck"];
    if (typeof vehicle_type !== "string" || !allowedTypes.includes(vehicle_type)) {
      throw new ApiError(400, `Invalid vehicle type. Allowed types are: ${allowedTypes.join(", ")}`, "VALIDATION_ERROR");
    }
  }

  const capVal = max_load_capacity !== undefined ? max_load_capacity : capacity;
  if (capVal !== undefined) {
    const cap = Number(capVal);
    if (isNaN(cap) || cap <= 0) {
      throw new ApiError(400, "Maximum load capacity must be a positive number", "VALIDATION_ERROR");
    }
    req.body.max_load_capacity = cap;
  }

  if (odometer !== undefined) {
    const odo = Number(odometer);
    if (isNaN(odo) || odo < 0) {
      throw new ApiError(400, "Odometer reading cannot be negative", "VALIDATION_ERROR");
    }
    req.body.odometer = odo;
  }

  if (acquisition_cost !== undefined) {
    const cost = Number(acquisition_cost);
    if (isNaN(cost) || cost < 0) {
      throw new ApiError(400, "Acquisition cost must be a non-negative number", "VALIDATION_ERROR");
    }
    req.body.acquisition_cost = cost;
  }

  if (status !== undefined) {
    const allowedStatuses = ["Available", "On Trip", "In Shop", "Retired"];
    if (typeof status !== "string" || !allowedStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}`, "VALIDATION_ERROR");
    }
  }

  next();
};

export const validateCreateDriver = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
  }

  const {
    full_name,
    license_number,
    license_category,
    license_expiry_date,
    contact_number,
    email,
    safety_score,
    status
  } = req.body;

  if (!full_name || typeof full_name !== "string" || full_name.trim().length < 2) {
    throw new ApiError(400, "Full name must be at least 2 characters long", "VALIDATION_ERROR");
  }
  req.body.full_name = full_name.trim();

  if (!license_number || typeof license_number !== "string" || license_number.trim() === "") {
    throw new ApiError(400, "License number is required", "VALIDATION_ERROR");
  }
  req.body.license_number = license_number.trim().toUpperCase();

  const allowedCategories = ["LMV", "HMV", "MCWG", "Transport", "Heavy Transport"];
  if (!license_category || typeof license_category !== "string" || !allowedCategories.includes(license_category)) {
    throw new ApiError(400, `Invalid license category. Allowed categories: ${allowedCategories.join(", ")}`, "VALIDATION_ERROR");
  }

  if (!license_expiry_date || isNaN(Date.parse(license_expiry_date))) {
    throw new ApiError(400, "A valid license expiry date is required", "VALIDATION_ERROR");
  }

  if (!contact_number || typeof contact_number !== "string" || !/^\d{10,15}$/.test(contact_number.trim())) {
    throw new ApiError(400, "Contact number must be between 10 and 15 digits", "VALIDATION_ERROR");
  }
  req.body.contact_number = contact_number.trim();

  if (email !== undefined && email !== null && email !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email.trim())) {
      throw new ApiError(400, "Invalid email format", "VALIDATION_ERROR");
    }
    req.body.email = email.trim();
  }

  if (safety_score !== undefined && safety_score !== null) {
    const score = Number(safety_score);
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      throw new ApiError(400, "Safety score must be an integer between 0 and 100", "VALIDATION_ERROR");
    }
    req.body.safety_score = score;
  } else {
    req.body.safety_score = 100;
  }

  const allowedStatuses = ["Available", "On Trip", "Off Duty", "Suspended"];
  if (status !== undefined && status !== null) {
    if (typeof status !== "string" || !allowedStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Allowed statuses: ${allowedStatuses.join(", ")}`, "VALIDATION_ERROR");
    }
  } else {
    req.body.status = "Available";
  }

  next();
};

export const validateUpdateDriver = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
  }

  const {
    full_name,
    contact_number,
    email,
    safety_score,
    status,
    license_expiry_date
  } = req.body;

  if (full_name !== undefined) {
    if (typeof full_name !== "string" || full_name.trim().length < 2) {
      throw new ApiError(400, "Full name must be at least 2 characters long", "VALIDATION_ERROR");
    }
    req.body.full_name = full_name.trim();
  }

  if (contact_number !== undefined) {
    if (typeof contact_number !== "string" || !/^\d{10,15}$/.test(contact_number.trim())) {
      throw new ApiError(400, "Contact number must be between 10 and 15 digits", "VALIDATION_ERROR");
    }
    req.body.contact_number = contact_number.trim();
  }

  if (email !== undefined && email !== null && email !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email.trim())) {
      throw new ApiError(400, "Invalid email format", "VALIDATION_ERROR");
    }
    req.body.email = email.trim();
  }

  if (safety_score !== undefined) {
    const score = Number(safety_score);
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      throw new ApiError(400, "Safety score must be an integer between 0 and 100", "VALIDATION_ERROR");
    }
    req.body.safety_score = score;
  }

  if (status !== undefined) {
    const allowedStatuses = ["Available", "On Trip", "Off Duty", "Suspended"];
    if (typeof status !== "string" || !allowedStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Allowed statuses: ${allowedStatuses.join(", ")}`, "VALIDATION_ERROR");
    }
  }

  if (license_expiry_date !== undefined) {
    if (isNaN(Date.parse(license_expiry_date))) {
      throw new ApiError(400, "Invalid license expiry date", "VALIDATION_ERROR");
    }
  }

  next();
};

export const validateCreateTrip = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
  }

  const { vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, revenue } = req.body;

  if (!vehicle_id || typeof vehicle_id !== "string") {
    throw new ApiError(400, "Vehicle ID is required", "VALIDATION_ERROR");
  }

  if (!driver_id || typeof driver_id !== "string") {
    throw new ApiError(400, "Driver ID is required", "VALIDATION_ERROR");
  }

  if (!source || typeof source !== "string" || source.trim() === "") {
    throw new ApiError(400, "Source is required", "VALIDATION_ERROR");
  }
  req.body.source = source.trim();

  if (!destination || typeof destination !== "string" || destination.trim() === "") {
    throw new ApiError(400, "Destination is required", "VALIDATION_ERROR");
  }
  req.body.destination = destination.trim();

  const cargo = Number(cargo_weight);
  if (cargo_weight === undefined || cargo_weight === null || isNaN(cargo) || cargo <= 0) {
    throw new ApiError(400, "Cargo weight must be a positive number", "VALIDATION_ERROR");
  }
  req.body.cargo_weight = cargo;

  if (planned_distance !== undefined && planned_distance !== null) {
    const distance = Number(planned_distance);
    if (isNaN(distance) || distance <= 0) {
      throw new ApiError(400, "Planned distance must be a positive number", "VALIDATION_ERROR");
    }
    req.body.planned_distance = distance;
  }

  if (revenue !== undefined && revenue !== null) {
    const rev = Number(revenue);
    if (isNaN(rev) || rev < 0) {
      throw new ApiError(400, "Revenue must be a non-negative number", "VALIDATION_ERROR");
    }
    req.body.revenue = rev;
  }

  next();
};

export const validateUpdateTrip = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
  }

  const { source, destination, cargo_weight, planned_distance, revenue } = req.body;

  if (source !== undefined) {
    if (typeof source !== "string" || source.trim() === "") {
      throw new ApiError(400, "Source cannot be empty", "VALIDATION_ERROR");
    }
    req.body.source = source.trim();
  }

  if (destination !== undefined) {
    if (typeof destination !== "string" || destination.trim() === "") {
      throw new ApiError(400, "Destination cannot be empty", "VALIDATION_ERROR");
    }
    req.body.destination = destination.trim();
  }

  if (cargo_weight !== undefined) {
    const cargo = Number(cargo_weight);
    if (isNaN(cargo) || cargo <= 0) {
      throw new ApiError(400, "Cargo weight must be a positive number", "VALIDATION_ERROR");
    }
    req.body.cargo_weight = cargo;
  }

  if (planned_distance !== undefined) {
    const distance = Number(planned_distance);
    if (isNaN(distance) || distance <= 0) {
      throw new ApiError(400, "Planned distance must be a positive number", "VALIDATION_ERROR");
    }
    req.body.planned_distance = distance;
  }

  if (revenue !== undefined) {
    const rev = Number(revenue);
    if (isNaN(rev) || rev < 0) {
      throw new ApiError(400, "Revenue must be a non-negative number", "VALIDATION_ERROR");
    }
    req.body.revenue = rev;
  }

  next();
};

export const validateCompleteTripBody = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
  }

  const { end_odometer, actual_distance, fuel_consumed } = req.body;

  const endOdo = Number(end_odometer);
  if (end_odometer === undefined || end_odometer === null || isNaN(endOdo) || endOdo <= 0) {
    throw new ApiError(400, "End odometer must be a positive number", "VALIDATION_ERROR");
  }
  req.body.end_odometer = endOdo;

  const actualDist = Number(actual_distance);
  if (actual_distance === undefined || actual_distance === null || isNaN(actualDist) || actualDist <= 0) {
    throw new ApiError(400, "Actual distance must be a positive number", "VALIDATION_ERROR");
  }
  req.body.actual_distance = actualDist;

  const fuel = Number(fuel_consumed);
  if (fuel_consumed === undefined || fuel_consumed === null || isNaN(fuel) || fuel < 0) {
    throw new ApiError(400, "Fuel consumed must be a non-negative number", "VALIDATION_ERROR");
  }
  req.body.fuel_consumed = fuel;

  next();
};

export const validateCreateMaintenance = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
  }

  const {
    vehicle_id,
    maintenance_type,
    issue_title,
    priority,
    estimated_cost,
    start_date,
    expected_completion_date
  } = req.body;

  if (!vehicle_id || typeof vehicle_id !== "string") {
    throw new ApiError(400, "Vehicle ID is required", "VALIDATION_ERROR");
  }

  const allowedTypes = [
    "Oil Change",
    "Engine Repair",
    "Tyre Replacement",
    "Battery",
    "General Service",
    "Brake Service",
    "Accident Repair",
    "Other"
  ];
  if (!maintenance_type || typeof maintenance_type !== "string" || !allowedTypes.includes(maintenance_type)) {
    throw new ApiError(400, `Invalid maintenance type. Allowed types: ${allowedTypes.join(", ")}`, "VALIDATION_ERROR");
  }

  if (!issue_title || typeof issue_title !== "string" || issue_title.trim() === "") {
    throw new ApiError(400, "Issue title is required", "VALIDATION_ERROR");
  }
  req.body.issue_title = issue_title.trim();

  const allowedPriorities = ["Low", "Medium", "High", "Critical"];
  if (!priority || typeof priority !== "string" || !allowedPriorities.includes(priority)) {
    throw new ApiError(400, `Invalid priority. Allowed priorities: ${allowedPriorities.join(", ")}`, "VALIDATION_ERROR");
  }

  if (estimated_cost !== undefined && estimated_cost !== null) {
    const est = Number(estimated_cost);
    if (isNaN(est) || est < 0) {
      throw new ApiError(400, "Estimated cost must be a non-negative number", "VALIDATION_ERROR");
    }
    req.body.estimated_cost = est;
  }

  if (start_date !== undefined && start_date !== null) {
    if (isNaN(Date.parse(start_date))) {
      throw new ApiError(400, "Invalid start date format", "VALIDATION_ERROR");
    }
  }

  if (expected_completion_date !== undefined && expected_completion_date !== null) {
    if (isNaN(Date.parse(expected_completion_date))) {
      throw new ApiError(400, "Invalid expected completion date format", "VALIDATION_ERROR");
    }
    if (start_date && Date.parse(expected_completion_date) < Date.parse(start_date)) {
      throw new ApiError(400, "Expected completion date cannot be before start date", "VALIDATION_ERROR");
    }
  }

  next();
};

export const validateUpdateMaintenance = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
  }

  const {
    maintenance_type,
    issue_title,
    priority,
    estimated_cost,
    actual_cost,
    expected_completion_date
  } = req.body;

  if (maintenance_type !== undefined) {
    const allowedTypes = [
      "Oil Change",
      "Engine Repair",
      "Tyre Replacement",
      "Battery",
      "General Service",
      "Brake Service",
      "Accident Repair",
      "Other"
    ];
    if (typeof maintenance_type !== "string" || !allowedTypes.includes(maintenance_type)) {
      throw new ApiError(400, `Invalid maintenance type. Allowed types: ${allowedTypes.join(", ")}`, "VALIDATION_ERROR");
    }
  }

  if (issue_title !== undefined) {
    if (typeof issue_title !== "string" || issue_title.trim() === "") {
      throw new ApiError(400, "Issue title cannot be empty", "VALIDATION_ERROR");
    }
    req.body.issue_title = issue_title.trim();
  }

  if (priority !== undefined) {
    const allowedPriorities = ["Low", "Medium", "High", "Critical"];
    if (typeof priority !== "string" || !allowedPriorities.includes(priority)) {
      throw new ApiError(400, `Invalid priority. Allowed priorities: ${allowedPriorities.join(", ")}`, "VALIDATION_ERROR");
    }
  }

  if (estimated_cost !== undefined && estimated_cost !== null) {
    const est = Number(estimated_cost);
    if (isNaN(est) || est < 0) {
      throw new ApiError(400, "Estimated cost must be a non-negative number", "VALIDATION_ERROR");
    }
    req.body.estimated_cost = est;
  }

  if (actual_cost !== undefined && actual_cost !== null) {
    const act = Number(actual_cost);
    if (isNaN(act) || act < 0) {
      throw new ApiError(400, "Actual cost must be a non-negative number", "VALIDATION_ERROR");
    }
    req.body.actual_cost = act;
  }

  if (expected_completion_date !== undefined && expected_completion_date !== null) {
    if (isNaN(Date.parse(expected_completion_date))) {
      throw new ApiError(400, "Invalid expected completion date format", "VALIDATION_ERROR");
    }
  }

  next();
};

export const validateCompleteMaintenanceBody = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
  }

  const { actual_cost, completion_date } = req.body;

  const act = Number(actual_cost);
  if (actual_cost === undefined || actual_cost === null || isNaN(act) || act < 0) {
    throw new ApiError(400, "Actual cost must be a non-negative number", "VALIDATION_ERROR");
  }
  req.body.actual_cost = act;

  if (completion_date !== undefined && completion_date !== null) {
    if (isNaN(Date.parse(completion_date))) {
      throw new ApiError(400, "Invalid completion date format", "VALIDATION_ERROR");
    }
  }

  next();
};

export const validateCreateFuelLog = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
  }

  const { trip_id, vehicle_id, fuel_type, liters, price_per_liter, odometer_reading, fuel_date } = req.body;

  if (!trip_id || typeof trip_id !== "string") {
    throw new ApiError(400, "Trip ID is required", "VALIDATION_ERROR");
  }

  if (!vehicle_id || typeof vehicle_id !== "string") {
    throw new ApiError(400, "Vehicle ID is required", "VALIDATION_ERROR");
  }

  const allowedTypes = ["Diesel", "Petrol", "CNG", "Electric", "Other"];
  if (!fuel_type || typeof fuel_type !== "string" || !allowedTypes.includes(fuel_type)) {
    throw new ApiError(400, `Invalid fuel type. Allowed types: ${allowedTypes.join(", ")}`, "VALIDATION_ERROR");
  }

  const l = Number(liters);
  if (liters === undefined || liters === null || isNaN(l) || l <= 0) {
    throw new ApiError(400, "Liters must be a positive number", "VALIDATION_ERROR");
  }
  req.body.liters = l;

  const p = Number(price_per_liter);
  if (price_per_liter === undefined || price_per_liter === null || isNaN(p) || p <= 0) {
    throw new ApiError(400, "Price per liter must be a positive number", "VALIDATION_ERROR");
  }
  req.body.price_per_liter = p;

  const odo = Number(odometer_reading);
  if (odometer_reading === undefined || odometer_reading === null || isNaN(odo) || odo <= 0) {
    throw new ApiError(400, "Odometer reading must be a positive number", "VALIDATION_ERROR");
  }
  req.body.odometer_reading = odo;

  if (!fuel_date || isNaN(Date.parse(fuel_date))) {
    throw new ApiError(400, "A valid fuel date is required", "VALIDATION_ERROR");
  }

  next();
};

export const validateUpdateFuelLog = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
  }

  const { fuel_type, liters, price_per_liter, odometer_reading, fuel_date } = req.body;

  if (fuel_type !== undefined) {
    const allowedTypes = ["Diesel", "Petrol", "CNG", "Electric", "Other"];
    if (typeof fuel_type !== "string" || !allowedTypes.includes(fuel_type)) {
      throw new ApiError(400, `Invalid fuel type. Allowed types: ${allowedTypes.join(", ")}`, "VALIDATION_ERROR");
    }
  }

  if (liters !== undefined) {
    const l = Number(liters);
    if (isNaN(l) || l <= 0) {
      throw new ApiError(400, "Liters must be a positive number", "VALIDATION_ERROR");
    }
    req.body.liters = l;
  }

  if (price_per_liter !== undefined) {
    const p = Number(price_per_liter);
    if (isNaN(p) || p <= 0) {
      throw new ApiError(400, "Price per liter must be a positive number", "VALIDATION_ERROR");
    }
    req.body.price_per_liter = p;
  }

  if (odometer_reading !== undefined) {
    const odo = Number(odometer_reading);
    if (isNaN(odo) || odo <= 0) {
      throw new ApiError(400, "Odometer reading must be a positive number", "VALIDATION_ERROR");
    }
    req.body.odometer_reading = odo;
  }

  if (fuel_date !== undefined) {
    if (isNaN(Date.parse(fuel_date))) {
      throw new ApiError(400, "Invalid fuel date", "VALIDATION_ERROR");
    }
  }

  next();
};

export const validateCreateExpense = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
  }

  const {
    vehicle_id,
    trip_id,
    maintenance_id,
    expense_type,
    title,
    amount,
    expense_date,
    payment_method,
    payment_status,
    vendor_name,
    invoice_number,
    receipt_url
  } = req.body;

  if (!vehicle_id && !trip_id && !maintenance_id) {
    throw new ApiError(400, "Expense must be linked to a Vehicle, Trip or Maintenance.", "VALIDATION_ERROR");
  }

  if (!title || typeof title !== "string" || title.trim() === "") {
    throw new ApiError(400, "Title is required", "VALIDATION_ERROR");
  }
  if (title.length > 255) {
    throw new ApiError(400, "Title cannot exceed 255 characters", "VALIDATION_ERROR");
  }
  req.body.title = title.trim();

  const allowedTypes = [
    "Fuel",
    "Maintenance",
    "Repair",
    "Insurance",
    "Registration",
    "Parking",
    "Toll",
    "Driver Allowance",
    "Cleaning",
    "Tyre Replacement",
    "Battery",
    "Miscellaneous"
  ];
  if (!expense_type || typeof expense_type !== "string" || !allowedTypes.includes(expense_type)) {
    throw new ApiError(400, `Invalid expense type. Allowed types: ${allowedTypes.join(", ")}`, "VALIDATION_ERROR");
  }

  const amt = Number(amount);
  if (amount === undefined || amount === null || isNaN(amt) || amt <= 0) {
    throw new ApiError(400, "Amount must be a positive number greater than zero", "VALIDATION_ERROR");
  }
  req.body.amount = amt;

  if (!expense_date || isNaN(Date.parse(expense_date))) {
    throw new ApiError(400, "A valid expense date is required", "VALIDATION_ERROR");
  }
  const expDate = new Date(expense_date);
  const today = new Date();
  if (expDate > today) {
    throw new ApiError(400, "Expense date cannot be in the future", "VALIDATION_ERROR");
  }

  const allowedMethods = ["Cash", "UPI", "Card", "Bank Transfer", "Cheque"];
  if (!payment_method || typeof payment_method !== "string" || !allowedMethods.includes(payment_method)) {
    throw new ApiError(400, `Invalid payment method. Allowed methods: ${allowedMethods.join(", ")}`, "VALIDATION_ERROR");
  }

  const allowedStatus = ["Paid", "Pending"];
  if (!payment_status || typeof payment_status !== "string" || !allowedStatus.includes(payment_status)) {
    throw new ApiError(400, `Invalid payment status. Allowed status: ${allowedStatus.join(", ")}`, "VALIDATION_ERROR");
  }

  if (vendor_name && vendor_name.length > 150) {
    throw new ApiError(400, "Vendor name cannot exceed 150 characters", "VALIDATION_ERROR");
  }

  if (invoice_number && invoice_number.length > 100) {
    throw new ApiError(400, "Invoice number cannot exceed 100 characters", "VALIDATION_ERROR");
  }

  if (receipt_url && receipt_url.length > 500) {
    throw new ApiError(400, "Receipt URL cannot exceed 500 characters", "VALIDATION_ERROR");
  }

  next();
};

export const validateUpdateExpense = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
  }

  const {
    expense_type,
    title,
    amount,
    expense_date,
    payment_method,
    payment_status,
    vendor_name,
    invoice_number,
    receipt_url
  } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      throw new ApiError(400, "Title cannot be empty", "VALIDATION_ERROR");
    }
    if (title.length > 255) {
      throw new ApiError(400, "Title cannot exceed 255 characters", "VALIDATION_ERROR");
    }
    req.body.title = title.trim();
  }

  if (expense_type !== undefined) {
    const allowedTypes = [
      "Fuel",
      "Maintenance",
      "Repair",
      "Insurance",
      "Registration",
      "Parking",
      "Toll",
      "Driver Allowance",
      "Cleaning",
      "Tyre Replacement",
      "Battery",
      "Miscellaneous"
    ];
    if (typeof expense_type !== "string" || !allowedTypes.includes(expense_type)) {
      throw new ApiError(400, `Invalid expense type. Allowed types: ${allowedTypes.join(", ")}`, "VALIDATION_ERROR");
    }
  }

  if (amount !== undefined) {
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      throw new ApiError(400, "Amount must be a positive number greater than zero", "VALIDATION_ERROR");
    }
    req.body.amount = amt;
  }

  if (expense_date !== undefined) {
    if (isNaN(Date.parse(expense_date))) {
      throw new ApiError(400, "Invalid expense date format", "VALIDATION_ERROR");
    }
    if (new Date(expense_date) > new Date()) {
      throw new ApiError(400, "Expense date cannot be in the future", "VALIDATION_ERROR");
    }
  }

  if (payment_method !== undefined) {
    const allowedMethods = ["Cash", "UPI", "Card", "Bank Transfer", "Cheque"];
    if (typeof payment_method !== "string" || !allowedMethods.includes(payment_method)) {
      throw new ApiError(400, `Invalid payment method. Allowed methods: ${allowedMethods.join(", ")}`, "VALIDATION_ERROR");
    }
  }

  if (payment_status !== undefined) {
    const allowedStatus = ["Paid", "Pending"];
    if (typeof payment_status !== "string" || !allowedStatus.includes(payment_status)) {
      throw new ApiError(400, `Invalid payment status. Allowed status: ${allowedStatus.join(", ")}`, "VALIDATION_ERROR");
    }
  }

  if (vendor_name && vendor_name.length > 150) {
    throw new ApiError(400, "Vendor name cannot exceed 150 characters", "VALIDATION_ERROR");
  }

  if (invoice_number && invoice_number.length > 100) {
    throw new ApiError(400, "Invoice number cannot exceed 100 characters", "VALIDATION_ERROR");
  }

  if (receipt_url && receipt_url.length > 500) {
    throw new ApiError(400, "Receipt URL cannot exceed 500 characters", "VALIDATION_ERROR");
  }

  next();
};





