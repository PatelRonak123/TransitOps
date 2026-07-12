CREATE TYPE "public"."role" AS ENUM('Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('Available', 'On Trip', 'In Shop', 'Retired');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('Truck', 'Van', 'Pickup', 'Trailer', 'Mini Truck');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"role" "role" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_number" varchar(30) NOT NULL,
	"vehicle_name" varchar(100) NOT NULL,
	"vehicle_model" varchar(100),
	"vehicle_type" "vehicle_type" NOT NULL,
	"max_load_capacity" numeric(10, 2) NOT NULL,
	"odometer" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"acquisition_cost" numeric(12, 2) NOT NULL,
	"status" "status" DEFAULT 'Available' NOT NULL,
	"region" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "vehicles_registration_number_unique" UNIQUE("registration_number")
);
