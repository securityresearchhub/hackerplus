-- ============================================================
-- HackerPlus — hp-idor-v1 Database Schema
-- Veloce Digital Systems HR Employee Portal
-- ============================================================

CREATE DATABASE IF NOT EXISTS veloce_hr;
USE veloce_hr;

-- ── Employees ────────────────────────────────────────────────
-- Employee IDs are sequential integers (1, 2, 3, 4...)
-- This is the IDOR exploit primitive — predictable resource IDs.
CREATE TABLE employees (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100) NOT NULL,
    department  VARCHAR(100) NOT NULL,
    job_title   VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL,
    salary      DECIMAL(10,2) NOT NULL,
    phone       VARCHAR(30)  NOT NULL DEFAULT 'N/A',
    hire_date   DATE         NOT NULL,
    role        ENUM('Employee','Manager','Administrator') DEFAULT 'Employee'
);

-- ── Documents ─────────────────────────────────────────────────
-- Each employee has associated documents.
-- The Administrator's document (employee_id=1) contains the dynamic flag.
-- The flag value is injected at container startup via entrypoint.sh.
CREATE TABLE documents (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    employee_id     INT NOT NULL,
    title           VARCHAR(200) NOT NULL,
    content         TEXT NOT NULL,
    classification  ENUM('Public','Internal','Confidential','Secret') DEFAULT 'Internal',
    created_at      DATE NOT NULL
);

-- ── Payslips ──────────────────────────────────────────────────
-- Monthly payslip records per employee.
-- Accessing admin payslips via IDOR reveals salary anomalies.
CREATE TABLE payslips (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    employee_id     INT NOT NULL,
    month           VARCHAR(20) NOT NULL,
    gross_salary    DECIMAL(10,2) NOT NULL,
    net_salary      DECIMAL(10,2) NOT NULL,
    issued_date     DATE NOT NULL
);

-- ── System Secrets ────────────────────────────────────────────
-- Dynamic flag storage. Value is overwritten at container start.
CREATE TABLE system_secrets (
    name    VARCHAR(50) PRIMARY KEY,
    value   TEXT NOT NULL
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Employee 1: Administrator (HIGH VALUE TARGET)
-- Student must discover id=1 via IDOR to reach the flag
INSERT INTO employees (username, password, full_name, department, job_title, email, salary, phone, hire_date, role)
VALUES ('admin', 'Adm1n@VDS2026!', 'Richard Vance', 'Executive', 'Chief Information Officer', 'r.vance@veloce-systems.internal', 195000.00, '+1-303-555-0101', '2015-03-12', 'Administrator');

-- Employee 2: Normal Employee (STUDENT LOGIN ACCOUNT)
INSERT INTO employees (username, password, full_name, department, job_title, email, salary, phone, hire_date, role)
VALUES ('jsmith', 'password123', 'John Smith', 'Operations', 'Systems Analyst', 'j.smith@veloce-systems.internal', 68500.00, '+1-303-555-0247', '2021-08-04', 'Employee');

-- Employee 3: Manager (RED HERRING)
INSERT INTO employees (username, password, full_name, department, job_title, email, salary, phone, hire_date, role)
VALUES ('mjones', 'password123', 'Maria Jones', 'Engineering', 'Senior Engineer', 'm.jones@veloce-systems.internal', 92000.00, '+1-303-555-0189', '2018-11-20', 'Manager');

-- Employee 4: Employee (RED HERRING)
INSERT INTO employees (username, password, full_name, department, job_title, email, salary, phone, hire_date, role)
VALUES ('tlee', 'password123', 'Thomas Lee', 'HR', 'HR Coordinator', 't.lee@veloce-systems.internal', 61000.00, '+1-303-555-0334', '2022-05-17', 'Employee');

-- ── Documents (per employee) ──────────────────────────────────

-- Admin documents (employee_id = 1) — FLAG IS HERE
-- The content is overwritten by entrypoint.sh with the real HP_FLAG value
INSERT INTO documents (employee_id, title, content, classification, created_at)
VALUES (1, 'System Integration Credentials', 'PLACEHOLDER_FLAG', 'Secret', '2026-07-01');

INSERT INTO documents (employee_id, title, content, classification, created_at)
VALUES (1, 'Executive Compensation Summary', 'Annual compensation package for FY2026: Base $195,000 + 20% performance bonus + ESOP allocation.', 'Confidential', '2026-06-15');

-- John Smith documents (employee_id = 2)
INSERT INTO documents (employee_id, title, content, classification, created_at)
VALUES (2, 'Q2 Performance Review', 'Performance rating: Meets Expectations. No corrective action required.', 'Internal', '2026-07-02');

INSERT INTO documents (employee_id, title, content, classification, created_at)
VALUES (2, 'Remote Work Policy Acknowledgement', 'Employee has acknowledged and signed the VDS Remote Work Policy 2026.', 'Public', '2026-01-10');

-- Maria Jones documents (employee_id = 3)
INSERT INTO documents (employee_id, title, content, classification, created_at)
VALUES (3, 'Engineering Team Budget Approval', 'Approved Q3 headcount request: 2 additional contractors. Budget: $180,000.', 'Confidential', '2026-06-28');

-- Thomas Lee documents (employee_id = 4)
INSERT INTO documents (employee_id, title, content, classification, created_at)
VALUES (4, 'New Hire Onboarding Checklist', 'All onboarding tasks completed. System accounts provisioned.', 'Internal', '2022-05-20');

-- ── Payslips (per employee) ───────────────────────────────────

-- Admin payslips
INSERT INTO payslips (employee_id, month, gross_salary, net_salary, issued_date)
VALUES (1, 'June 2026', 16250.00, 11200.00, '2026-06-30');

-- jsmith payslips
INSERT INTO payslips (employee_id, month, gross_salary, net_salary, issued_date)
VALUES (2, 'June 2026', 5708.33, 4100.00, '2026-06-30');
INSERT INTO payslips (employee_id, month, gross_salary, net_salary, issued_date)
VALUES (2, 'May 2026', 5708.33, 4100.00, '2026-05-31');

-- mjones payslips
INSERT INTO payslips (employee_id, month, gross_salary, net_salary, issued_date)
VALUES (3, 'June 2026', 7666.67, 5450.00, '2026-06-30');

-- tlee payslips
INSERT INTO payslips (employee_id, month, gross_salary, net_salary, issued_date)
VALUES (4, 'June 2026', 5083.33, 3700.00, '2026-06-30');

-- ── System Secrets ────────────────────────────────────────────
-- Placeholder — overwritten at runtime by entrypoint.sh
INSERT INTO system_secrets (name, value)
VALUES ('flag', 'hp_flag{placeholder_idor}');
