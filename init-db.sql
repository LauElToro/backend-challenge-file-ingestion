USE master;
GO
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'ClientesDB')
BEGIN
  CREATE DATABASE ClientesDB;
END
GO
USE ClientesDB;
GO
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Clientes' AND xtype='U')
CREATE TABLE Clientes (
  Nombre VARCHAR(20),
  Apellido VARCHAR(20),
  DNI VARCHAR(20),
  Estado VARCHAR(50),
  FechaIngreso VARCHAR(50),
  EsPep VARCHAR(10),
  EsSujetoObligado VARCHAR(10)
);
GO
