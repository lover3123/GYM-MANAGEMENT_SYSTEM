-- =============================================================
-- GYM MANAGEMENT SYSTEM - ENHANCED MYSQL SCHEMA
-- Author: Rohan Rajbanshi 
-- =============================================================

CREATE DATABASE IF NOT EXISTS gym_management;
USE gym_management;

-- -------------------------------------------------------------
-- 1. ADMIN (Login System)
-- -------------------------------------------------------------
CREATE TABLE Admin (
    admin_id    INT          AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,          -- bcrypt hash
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Admin (username, password, full_name, email) VALUES
('admin', '$2a$10$Dvj72dx5Bo1neMeF7AMC8OhtTGxrqZOl9befYCn8F3PZOTfQvbEtO', 'Gym Administrator', 'admin@gymms.com');


-- -------------------------------------------------------------
-- 2. MEMBER  (replaces original `doctorapp` — the members table)
-- -------------------------------------------------------------
CREATE TABLE Member (
    member_id   INT          AUTO_INCREMENT PRIMARY KEY,
    fname       VARCHAR(50)  NOT NULL,
    lname       VARCHAR(50)  NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    contact     VARCHAR(15)  NOT NULL UNIQUE,
    gender      ENUM('Male','Female','Other') NOT NULL DEFAULT 'Male',
    dob         DATE,
    address     TEXT,
    photo_url   VARCHAR(255),
    join_date   DATE         NOT NULL DEFAULT (CURRENT_DATE),
    status      ENUM('Active','Inactive','Suspended') NOT NULL DEFAULT 'Active',
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_member_email  (email),
    INDEX idx_member_contact (contact)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Member (fname, lname, email, contact, gender, join_date, status) VALUES
('Raj',     'Kumar',   'raj.kumar@gmail.com',    '9810000201', 'Male',   '2024-01-10', 'Active'),
('Saurabh', 'Kumar',   'saurabh.k@gmail.com',   '9810000202', 'Male',   '2024-02-15', 'Active'),
('Surya',   'Raj',     'surya.raj@gmail.com',    '9810000203', 'Male',   '2024-03-20', 'Active'),
('Raman',   'Kumar',   'raman.kumar@gmail.com',  '9810000204', 'Male',   '2024-04-05', 'Active'),
('Aadarsh', 'Thakur',  'aadarsh.t@gmail.com',   '9810000205', 'Male',   '2024-05-12', 'Active'),
('Rahul',   'Kumar',   'rahul.kumar@gmail.com',  '9810000206', 'Male',   '2024-06-18', 'Active'),
('Sanjeev', 'Verma',   'sanjeev.v@gmail.com',   '9810000207', 'Male',   '2024-07-22', 'Active'),
('Priya',   'Sharma',  'priya.s@gmail.com',     '9810000208', 'Female', '2024-08-01', 'Active');


-- -------------------------------------------------------------
-- 3. TRAINER
-- -------------------------------------------------------------
CREATE TABLE Trainer (
    trainer_id  INT          AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    phone       VARCHAR(15)  NOT NULL UNIQUE,
    email       VARCHAR(100),
    speciality  VARCHAR(100),
    salary      DECIMAL(10,2),
    join_date   DATE         NOT NULL DEFAULT (CURRENT_DATE),
    status      ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
    INDEX idx_trainer_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Trainer (name, phone, speciality, salary, join_date) VALUES
('Rakesh Singh',  '9820101101', 'Strength & Conditioning',  35000.00, '2023-01-05'),
('Ravi Verma',    '9820101102', 'Cardio & Endurance',       30000.00, '2023-03-15'),
('Wasim Khan',    '9820101103', 'Yoga & Flexibility',       28000.00, '2023-06-20'),
('Sameer Gupta',  '9820101104', 'Weight Loss',              32000.00, '2023-09-10');


-- -------------------------------------------------------------
-- 4. PACKAGE  (Membership Packages)
-- -------------------------------------------------------------
CREATE TABLE Package (
    package_id      INT          AUTO_INCREMENT PRIMARY KEY,
    package_name    VARCHAR(100) NOT NULL,
    description     TEXT,
    duration_months INT          NOT NULL DEFAULT 1,
    amount          DECIMAL(10,2) NOT NULL,
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Package (package_name, description, duration_months, amount) VALUES
('Preliminary',   'Basic access to gym facilities',           1,  800.00),
('Weight Gain',   'Protein-rich diet plan + strength training',3, 1500.00),
('Weight Loss',   'Cardio-focused + dietary guidance',         3, 1000.00),
('Premium',       'Full access + personal trainer + diet plan',6, 3500.00),
('Annual Elite',  'All inclusive annual plan',                12, 8000.00);


-- -------------------------------------------------------------
-- 5. MEMBERSHIP  (Member ↔ Package bridge + Trainer assignment)
-- -------------------------------------------------------------
CREATE TABLE Membership (
    membership_id   INT  AUTO_INCREMENT PRIMARY KEY,
    member_id       INT  NOT NULL,
    package_id      INT  NOT NULL,
    trainer_id      INT,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    status          ENUM('Active','Expired','Cancelled') NOT NULL DEFAULT 'Active',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mem_member  FOREIGN KEY (member_id)  REFERENCES Member(member_id)  ON DELETE CASCADE,
    CONSTRAINT fk_mem_package FOREIGN KEY (package_id) REFERENCES Package(package_id) ON DELETE RESTRICT,
    CONSTRAINT fk_mem_trainer FOREIGN KEY (trainer_id) REFERENCES Trainer(trainer_id) ON DELETE SET NULL,
    INDEX idx_mem_member  (member_id),
    INDEX idx_mem_package (package_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Membership (member_id, package_id, trainer_id, start_date, end_date, status) VALUES
(1, 2, 1, '2024-01-10', '2024-04-10', 'Expired'),
(2, 1, 2, '2024-02-15', '2024-03-15', 'Expired'),
(3, 3, 3, '2024-03-20', '2024-06-20', 'Expired'),
(4, 2, 1, '2024-04-05', '2024-07-05', 'Active'),
(5, 4, 4, '2024-05-12', '2024-11-12', 'Active'),
(6, 1, 2, '2024-06-18', '2024-07-18', 'Active'),
(7, 3, 3, '2024-07-22', '2024-10-22', 'Active'),
(8, 5, 4, '2024-08-01', '2025-08-01', 'Active');


-- -------------------------------------------------------------
-- 6. PAYMENT  (linked to Membership)
-- -------------------------------------------------------------
CREATE TABLE Payment (
    payment_id      INT          AUTO_INCREMENT PRIMARY KEY,
    membership_id   INT          NOT NULL,
    member_id       INT          NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    payment_type    ENUM('Cash','Card','Cheque','UPI','Net Banking') NOT NULL DEFAULT 'Cash',
    payment_date    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status          ENUM('Success','Pending','Failed') NOT NULL DEFAULT 'Success',
    transaction_ref VARCHAR(100),
    CONSTRAINT fk_pay_membership FOREIGN KEY (membership_id) REFERENCES Membership(membership_id) ON DELETE CASCADE,
    CONSTRAINT fk_pay_member     FOREIGN KEY (member_id)     REFERENCES Member(member_id)          ON DELETE CASCADE,
    INDEX idx_pay_member (member_id),
    INDEX idx_pay_date   (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Payment (membership_id, member_id, amount, payment_type, payment_date, status) VALUES
(1, 1, 1500.00, 'Cash',  '2024-01-10 10:00:00', 'Success'),
(2, 2,  800.00, 'Card',  '2024-02-15 11:30:00', 'Success'),
(3, 3, 1000.00, 'Cheque','2024-03-20 09:15:00', 'Success'),
(4, 4, 1500.00, 'Cash',  '2024-04-05 14:00:00', 'Success'),
(5, 5, 3500.00, 'UPI',   '2024-05-12 16:45:00', 'Success'),
(6, 6,  800.00, 'Card',  '2024-06-18 10:30:00', 'Success'),
(7, 7, 1000.00, 'Cash',  '2024-07-22 13:00:00', 'Success'),
(8, 8, 8000.00, 'Net Banking','2024-08-01 09:00:00','Success');


-- -------------------------------------------------------------
-- 7. EQUIPMENT
-- -------------------------------------------------------------
CREATE TABLE Equipment (
    equipment_id    INT          AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    category        VARCHAR(50),
    purchase_date   DATE,
    last_service    DATE,
    condition_status ENUM('Good','Needs Repair','Out of Service') DEFAULT 'Good',
    quantity        INT          NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Equipment (name, category, purchase_date, condition_status, quantity) VALUES
('Treadmill',        'Cardio',    '2022-01-15', 'Good',         5),
('Dumbbell Set',     'Free Weight','2022-03-20','Good',         10),
('Barbell Set',      'Free Weight','2022-03-20','Good',         6),
('Bench Press',      'Strength',  '2022-05-10', 'Good',         4),
('Rowing Machine',   'Cardio',    '2023-01-01', 'Needs Repair', 2),
('Yoga Mats',        'Flexibility','2023-06-15','Good',         20),
('Resistance Bands', 'Flexibility','2023-06-15','Good',         30),
('Pull-up Bar',      'Strength',  '2022-07-01', 'Good',         3);


-- =============================================================
-- USEFUL VIEWS
-- =============================================================

-- Active Members with their current package and trainer
CREATE OR REPLACE VIEW vw_active_memberships AS
SELECT
    m.member_id,
    CONCAT(m.fname, ' ', m.lname) AS member_name,
    m.email,
    m.contact,
    p.package_name,
    p.amount AS package_fee,
    ms.start_date,
    ms.end_date,
    t.name AS trainer_name,
    ms.status AS membership_status
FROM Member m
JOIN Membership ms ON m.member_id = ms.member_id
JOIN Package   p  ON ms.package_id = p.package_id
LEFT JOIN Trainer t ON ms.trainer_id = t.trainer_id
WHERE ms.status = 'Active';

-- Monthly revenue summary
CREATE OR REPLACE VIEW vw_monthly_revenue AS
SELECT
    DATE_FORMAT(payment_date, '%Y-%m') AS month,
    COUNT(*)                           AS total_payments,
    SUM(amount)                        AS total_revenue
FROM Payment
WHERE status = 'Success'
GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
ORDER BY month DESC;

-- =============================================================
-- STORED PROCEDURES
-- =============================================================

DELIMITER $$

-- Add new member + auto-create membership
CREATE PROCEDURE sp_enroll_member(
    IN p_fname      VARCHAR(50),
    IN p_lname      VARCHAR(50),
    IN p_email      VARCHAR(100),
    IN p_contact    VARCHAR(15),
    IN p_gender     ENUM('Male','Female','Other'),
    IN p_dob        DATE,
    IN p_package_id INT,
    IN p_trainer_id INT,
    IN p_pay_type   ENUM('Cash','Card','Cheque','UPI','Net Banking')
)
BEGIN
    DECLARE v_member_id     INT;
    DECLARE v_membership_id INT;
    DECLARE v_amount        DECIMAL(10,2);
    DECLARE v_duration      INT;

    -- Get package details
    SELECT amount, duration_months INTO v_amount, v_duration
    FROM Package WHERE package_id = p_package_id;

    -- Insert member
    INSERT INTO Member (fname, lname, email, contact, gender, dob)
    VALUES (p_fname, p_lname, p_email, p_contact, p_gender, p_dob);
    SET v_member_id = LAST_INSERT_ID();

    -- Create membership
    INSERT INTO Membership (member_id, package_id, trainer_id, start_date, end_date)
    VALUES (v_member_id, p_package_id, p_trainer_id, CURDATE(), DATE_ADD(CURDATE(), INTERVAL v_duration MONTH));
    SET v_membership_id = LAST_INSERT_ID();

    -- Record payment
    INSERT INTO Payment (membership_id, member_id, amount, payment_type)
    VALUES (v_membership_id, v_member_id, v_amount, p_pay_type);

    SELECT v_member_id AS new_member_id, v_membership_id AS new_membership_id;
END $$

DELIMITER ;


-- =============================================================
-- TRIGGERS
-- =============================================================

DELIMITER $$

-- Auto-expire memberships past end_date on insert/update
CREATE TRIGGER trg_check_membership_expiry
BEFORE UPDATE ON Membership
FOR EACH ROW
BEGIN
    IF NEW.end_date < CURDATE() AND NEW.status = 'Active' THEN
        SET NEW.status = 'Expired';
    END IF;
END $$

DELIMITER ;
