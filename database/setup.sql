-- ============================================================
-- Training Dashboard - SQL Server Setup Script
-- ============================================================

-- Create database (run as SA or db admin)
-- CREATE DATABASE TrainingDB;
-- GO
-- USE TrainingDB;
-- GO

-- Drop table if exists (for re-runs)
IF OBJECT_ID('dbo.Trainings', 'U') IS NOT NULL
    DROP TABLE dbo.Trainings;
GO

CREATE TABLE dbo.Trainings (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    EmployeeId      INT             NULL,
    EmployeeName    NVARCHAR(100)   NULL,
    EmployeeEmail   NVARCHAR(150)   NULL,
    Leader          NVARCHAR(100)   NULL,
    ManagerName     NVARCHAR(100)   NULL,
    ManagerEmail    NVARCHAR(150)   NULL,
    BusinessUnit    NVARCHAR(100)   NULL,
    Country         NVARCHAR(100)   NULL,
    TrainingName    NVARCHAR(200)   NULL,
    TrainingCategory NVARCHAR(100)  NULL,
    IsMandatory     BIT             NULL,
    Status          NVARCHAR(50)    NULL,
    EnrollmentDate  DATE            NULL,
    DueDate         DATE            NULL,
    CompletionDate  DATE            NULL,
    TrainingHours   DECIMAL(10,2)   NULL,
    AssessmentScore DECIMAL(10,2)   NULL,
    TrainingProvider NVARCHAR(100)  NULL,
    LoadDate        DATE            NULL
);
GO

-- Create indexes for common query patterns
CREATE INDEX IX_Trainings_Status        ON dbo.Trainings(Status);
CREATE INDEX IX_Trainings_BusinessUnit  ON dbo.Trainings(BusinessUnit);
CREATE INDEX IX_Trainings_Country       ON dbo.Trainings(Country);
CREATE INDEX IX_Trainings_Category      ON dbo.Trainings(TrainingCategory);
CREATE INDEX IX_Trainings_EmployeeId    ON dbo.Trainings(EmployeeId);
CREATE INDEX IX_Trainings_EnrollmentDate ON dbo.Trainings(EnrollmentDate);
GO

-- ============================================================
-- Import data from Excel using SSMS or SSIS:
--   Right-click database → Tasks → Import Data
--   Source: Excel → select Trainings_POC_5000_Records.xlsx
--   Destination: SQL Server → TrainingDB → dbo.Trainings
--
-- OR use BCP:
--   bcp TrainingDB.dbo.Trainings in "Trainings_POC_5000_Records.csv" -S localhost -U sa -P YourPassword -c -t, -r\n
-- ============================================================

-- Verify the import
SELECT TOP 5 * FROM dbo.Trainings;
SELECT COUNT(*) AS TotalRecords FROM dbo.Trainings;
GO
