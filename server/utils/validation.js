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
