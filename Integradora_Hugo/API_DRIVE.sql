-- Active: 1697309971398@@127.0.0.1@3306@api_drive
create database API_DRIVE;

use API_DRIVE;

  CREATE TABLE IF NOT EXISTS archivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    ruta VARCHAR(255) NOT NULL
  );

                             
select * from archivos;