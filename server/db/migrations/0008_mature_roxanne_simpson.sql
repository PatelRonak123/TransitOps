CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"module" varchar(100) NOT NULL,
	"entity_id" uuid,
	"entity_name" varchar(100),
	"old_data" jsonb,
	"new_data" jsonb,
	"description" text NOT NULL,
	"ip_address" varchar(100),
	"browser" varchar(100),
	"operating_system" varchar(100),
	"device_type" varchar(100),
	"request_method" varchar(10) NOT NULL,
	"request_url" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;