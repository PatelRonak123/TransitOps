import { ApiError } from "./ApiError.js";

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string") {
    throw new ApiError(400, "Email is required", "VALIDATION_ERROR");
  }

  if (!password || typeof password !== "string") {
    throw new ApiError(400, "Password is required", "VALIDATION_ERROR");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new ApiError(400, "Invalid email format", "VALIDATION_ERROR");
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

