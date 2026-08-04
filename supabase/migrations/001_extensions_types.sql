CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('admin', 'profe');
CREATE TYPE attendance_status AS ENUM ('presente', 'ausente', 'justificado');
CREATE TYPE movement_type AS ENUM ('ingreso', 'egreso', 'baja_desgaste');
