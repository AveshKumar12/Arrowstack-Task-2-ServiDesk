
BEGIN;

-- 1. Departments
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'employee'
        CHECK (role IN ('employee', 'agent', 'admin')),

    department_id INTEGER REFERENCES departments(id)
        ON DELETE SET NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX users_email_unique
ON users (LOWER(email));

-- 3. Service Requests
CREATE TABLE service_requests (
    id SERIAL PRIMARY KEY,

    ticket_number VARCHAR(30) NOT NULL UNIQUE,

    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,

    category VARCHAR(30) NOT NULL
        CHECK (category IN ('IT', 'HR', 'Facilities')),

    priority VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

    status VARCHAR(30) NOT NULL DEFAULT 'open'
        CHECK (status IN (
            'open',
            'in_progress',
            'pending',
            'resolved',
            'closed'
        )),

    requester_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    assigned_to INTEGER
        REFERENCES users(id) ON DELETE SET NULL,

    department_id INTEGER
        REFERENCES departments(id) ON DELETE SET NULL,

    due_at TIMESTAMP,
    resolved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Request Comments
CREATE TABLE request_comments (
    id SERIAL PRIMARY KEY,

    request_id INTEGER NOT NULL
        REFERENCES service_requests(id) ON DELETE CASCADE,

    user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    comment TEXT NOT NULL,

    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Activity Logs
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,

    request_id INTEGER
        REFERENCES service_requests(id) ON DELETE SET NULL,

    user_id INTEGER
        REFERENCES users(id) ON DELETE SET NULL,

    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Request Attachments
CREATE TABLE request_attachments (
    id SERIAL PRIMARY KEY,

    request_id INTEGER NOT NULL
        REFERENCES service_requests(id) ON DELETE CASCADE,

    uploaded_by INTEGER
        REFERENCES users(id) ON DELETE SET NULL,

    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT CHECK (file_size >= 0),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for commonly searched data
CREATE INDEX idx_users_department
ON users(department_id);

CREATE INDEX idx_requests_requester
ON service_requests(requester_id);

CREATE INDEX idx_requests_assigned
ON service_requests(assigned_to);

CREATE INDEX idx_requests_status
ON service_requests(status);

CREATE INDEX idx_requests_category
ON service_requests(category);

CREATE INDEX idx_requests_created
ON service_requests(created_at DESC);

CREATE INDEX idx_comments_request
ON request_comments(request_id);

CREATE INDEX idx_activity_request
ON activity_logs(request_id);

CREATE INDEX idx_attachments_request
ON request_attachments(request_id);

COMMIT;
