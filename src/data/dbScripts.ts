/**
 * Softham OpenDesk - Complete Relational Database Schemas & DDL Scripts
 * Fully aligned with src/types.ts and src/data/mockData.ts
 * Compatible with PostgreSQL 14+, MySQL 8+, SQLite 3+ / Smart POS, and Prisma ORM.
 *
 * POSTGRESQL_DDL e SEED_DATA_SQL espelham src/data/schema.sql e
 * src/data/seed.sql, que continuam sendo a referencia canonica.
 */

export const POSTGRESQL_DDL = `-- =========================================================================
-- SOFTHAM OPENDESK - ENTERPRISE RELATIONAL SCHEMA (POSTGRESQL 14+)
-- Alinhado com src/types.ts • Suporte Offline-First Sync • Auditoria Completa
-- =========================================================================

-- Extensões para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Função de Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. TENANTS / ESTABELECIMENTOS
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(50) PRIMARY KEY, -- ex: 'quiosque-praia', 'restaurante-bar', etc.
    name VARCHAR(150) NOT NULL,
    trade_name VARCHAR(150) NOT NULL DEFAULT 'Softham OpenDesk',
    cnpj_cpf VARCHAR(20) UNIQUE,
    segment_type VARCHAR(50) NOT NULL DEFAULT 'quiosque_praia',
    tagline VARCHAR(255),
    location VARCHAR(255),
    phone VARCHAR(25),
    service_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 10.00,
    currency VARCHAR(5) NOT NULL DEFAULT 'BRL',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_tenant_segment_type CHECK (
        segment_type IN ('quiosque_praia', 'restaurante_bar', 'rooftop_lounge', 'foodpark_complexo')
    )
);

CREATE TRIGGER trg_tenants_updated_at
BEFORE UPDATE ON tenants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. USERS & STAFF (GARÇONS, COZINHA, GERÊNCIA, CAIXA, APOIO)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150),
    role VARCHAR(40) NOT NULL DEFAULT 'garcom',
    pin_code VARCHAR(10) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_user_pin UNIQUE (tenant_id, pin_code),
    CONSTRAINT chk_users_role CHECK (
        role IN ('admin', 'gerente', 'garcom', 'cozinha', 'bar', 'caixa', 'apoio')
    )
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. SECTORS / SETORES FÍSICOS
CREATE TABLE IF NOT EXISTS sectors (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    icon_name VARCHAR(40) NOT NULL DEFAULT 'sun',
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_sector_code UNIQUE (tenant_id, code),
    CONSTRAINT chk_sectors_icon CHECK (
        icon_name IN ('sun', 'umbrella', 'users', 'flame', 'sparkles', 'coffee', 'building', 'trees')
    )
);

-- 4. TABLES_SPOTS (MESAS, GUARDA-SÓIS, BANGALÔS E BISTRÔS)
CREATE TABLE IF NOT EXISTS tables_spots (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sector_id VARCHAR(50) NOT NULL REFERENCES sectors(id) ON DELETE RESTRICT,
    code VARCHAR(30) NOT NULL, -- Ex: 'G-01', 'M-01', 'B-01'
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 4,
    status VARCHAR(30) NOT NULL DEFAULT 'livre',
    current_waiter_name VARCHAR(120),
    min_consumption NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- Consumação mínima por mesa (override)
    service_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 10.00, -- Taxa de serviço por mesa (ex: Bangalô VIP 12%)
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    opened_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_table_code UNIQUE (tenant_id, code),
    CONSTRAINT chk_tables_status CHECK (
        status IN ('livre', 'ocupada', 'conta_solicitada', 'reservada')
    )
);

CREATE TRIGGER trg_tables_spots_updated_at
BEFORE UPDATE ON tables_spots
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. MENU_ITEMS (PRODUTOS DO CARDÁPIO & ALUGUEL)
CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    cost_price NUMERIC(10,2) DEFAULT 0.00,
    description TEXT,
    prep_station VARCHAR(30) NOT NULL DEFAULT 'cozinha',
    prep_time_minutes INT NOT NULL DEFAULT 15,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    image_url TEXT,
    unit VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_menu_category CHECK (
        category IN ('bebidas', 'porcoes', 'pratos', 'aluguel', 'sobremesas', 'drinks', 'entradas')
    ),
    CONSTRAINT chk_menu_prep_station CHECK (
        prep_station IN ('bar', 'cozinha', 'apoio')
    )
);

CREATE TRIGGER trg_menu_items_updated_at
BEFORE UPDATE ON menu_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. ORDERS_BILLS (COMANDAS & SESSÕES DE MESA - OFFLINE-FIRST SYNC)
CREATE TABLE IF NOT EXISTS orders_bills (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    table_id VARCHAR(50) NOT NULL REFERENCES tables_spots(id) ON DELETE RESTRICT,
    waiter_name VARCHAR(120),
    status VARCHAR(30) NOT NULL DEFAULT 'aberta',
    customer_count INT NOT NULL DEFAULT 1,
    subtotal_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    service_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 10.00,
    service_fee_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    -- Campos para Idempotência e Sincronização Offline-First
    client_uuid UUID UNIQUE,
    device_id VARCHAR(100),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_orders_status CHECK (
        status IN ('aberta', 'fechamento_solicitado', 'paga_parcial', 'paga_total', 'cancelada')
    )
);

CREATE TRIGGER trg_orders_bills_updated_at
BEFORE UPDATE ON orders_bills
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. BILL_CUSTOMERS (CLIENTES DA MESA PARA RATEIO COLORIDO INTELIGENTE)
CREATE TABLE IF NOT EXISTS bill_customers (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id VARCHAR(50) NOT NULL REFERENCES orders_bills(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(30) NOT NULL DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ORDER_ITEMS (ITENS DA COMANDA & ESTADOS DO KDS - OFFLINE-FIRST SYNC)
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id VARCHAR(50) NOT NULL REFERENCES orders_bills(id) ON DELETE CASCADE,
    item_id VARCHAR(50) NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    customer_id VARCHAR(50) REFERENCES bill_customers(id) ON DELETE SET NULL,
    assigned_to_customer VARCHAR(100) NOT NULL, -- 'Lucas', 'Renata', 'Mesa Toda'
    name VARCHAR(150) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    prep_station VARCHAR(30) NOT NULL DEFAULT 'cozinha',
    status VARCHAR(30) NOT NULL DEFAULT 'enviado',
    notes TEXT,
    ordered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Campos para Idempotência e Sincronização Offline-First
    client_uuid UUID UNIQUE,
    device_id VARCHAR(100),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_order_items_status CHECK (
        status IN ('enviado', 'preparando', 'pronto', 'entregue', 'cancelado')
    ),
    CONSTRAINT chk_order_items_prep_station CHECK (
        prep_station IN ('bar', 'cozinha', 'apoio')
    )
);

CREATE TRIGGER trg_order_items_updated_at
BEFORE UPDATE ON order_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. TABLE_TRANSFER_LOGS (AUDITORIA ANTIFRAUDE DE TROCAS E FUSÕES)
CREATE TABLE IF NOT EXISTS table_transfer_logs (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    source_table_code VARCHAR(30) NOT NULL,
    target_table_code VARCHAR(30) NOT NULL,
    transfer_type VARCHAR(40) NOT NULL,
    waiter_name VARCHAR(120) NOT NULL,
    items_transferred_count INT NOT NULL DEFAULT 0,
    customers_transferred_count INT NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_transfer_type CHECK (
        transfer_type IN ('troca_completa', 'fusao', 'transferencia_itens')
    )
);

-- 10. CASH_SHIFTS (TURNOS DE CAIXA / GAVETA FISCAL / DRE DIÁRIO)
CREATE TABLE IF NOT EXISTS cash_shifts (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    operator_user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    opening_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    closing_balance NUMERIC(10,2),
    total_pix NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_credit NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_debit NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_cash NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_service_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'aberto',
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    CONSTRAINT chk_cash_shift_status CHECK (
        status IN ('aberto', 'fechado', 'conferido')
    )
);

-- 11. CASH_TRANSACTIONS (PAGAMENTOS, SANGRIA E SUPRIMENTOS - OFFLINE-FIRST SYNC)
CREATE TABLE IF NOT EXISTS cash_transactions (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    cash_shift_id VARCHAR(50) REFERENCES cash_shifts(id) ON DELETE SET NULL,
    order_id VARCHAR(50) REFERENCES orders_bills(id) ON DELETE SET NULL,
    customer_name VARCHAR(100),
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(40) NOT NULL,
    transaction_type VARCHAR(40) NOT NULL DEFAULT 'pagamento_comanda',
    tx_id VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Campos para Idempotência e Sincronização Offline-First
    client_uuid UUID UNIQUE,
    device_id VARCHAR(100),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_cash_tx_payment_method CHECK (
        payment_method IN ('pix', 'cartao_credito', 'cartao_debito', 'dinheiro')
    ),
    CONSTRAINT chk_cash_tx_type CHECK (
        transaction_type IN ('pagamento_comanda', 'sangria', 'suprimento', 'estorno')
    )
);

-- ÍNDICES DE ALTA CONCORRÊNCIA (AREIA / MOBILE PERFORMANCE)
CREATE INDEX IF NOT EXISTS idx_tables_tenant_status ON tables_spots (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON orders_bills (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_order_items_kds ON order_items (tenant_id, status, prep_station);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_bill_customers_order ON bill_customers (order_id);
CREATE INDEX IF NOT EXISTS idx_transfers_tenant ON table_transfer_logs (tenant_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_cash_tx_shift ON cash_transactions (cash_shift_id);
CREATE INDEX IF NOT EXISTS idx_orders_sync ON orders_bills (client_uuid, synced_at);
CREATE INDEX IF NOT EXISTS idx_items_sync ON order_items (client_uuid, synced_at);`;

export const MYSQL_DDL = `-- =========================================================================
-- SOFTHAM OPENDESK - MYSQL 8.0+ RELATIONAL DDL SCRIPT
-- Engine: InnoDB, Charset: utf8mb4, CHECK Constraints e Sincronização
-- =========================================================================

CREATE DATABASE IF NOT EXISTS softham_opendesk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE softham_opendesk;

-- 1. TENANTS
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    trade_name VARCHAR(150) NOT NULL DEFAULT 'Softham OpenDesk',
    cnpj_cpf VARCHAR(20) UNIQUE,
    segment_type VARCHAR(50) NOT NULL DEFAULT 'quiosque_praia',
    tagline VARCHAR(255),
    location VARCHAR(255),
    phone VARCHAR(25),
    service_fee_percent DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    currency VARCHAR(5) NOT NULL DEFAULT 'BRL',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_tenant_segment_type CHECK (
        segment_type IN ('quiosque_praia', 'restaurante_bar', 'rooftop_lounge', 'foodpark_complexo')
    )
) ENGINE=InnoDB;

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150),
    role VARCHAR(40) NOT NULL DEFAULT 'garcom',
    pin_code VARCHAR(10) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY uq_tenant_user_pin (tenant_id, pin_code),
    CONSTRAINT chk_users_role CHECK (
        role IN ('admin', 'gerente', 'garcom', 'cozinha', 'bar', 'caixa', 'apoio')
    )
) ENGINE=InnoDB;

-- 3. SECTORS
CREATE TABLE IF NOT EXISTS sectors (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    icon_name VARCHAR(40) NOT NULL DEFAULT 'sun',
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY uq_tenant_sector_code (tenant_id, code),
    CONSTRAINT chk_sectors_icon CHECK (
        icon_name IN ('sun', 'umbrella', 'users', 'flame', 'sparkles', 'coffee', 'building', 'trees')
    )
) ENGINE=InnoDB;

-- 4. TABLES_SPOTS
CREATE TABLE IF NOT EXISTS tables_spots (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    sector_id VARCHAR(50) NOT NULL,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 4,
    status VARCHAR(30) NOT NULL DEFAULT 'livre',
    current_waiter_name VARCHAR(120),
    min_consumption DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    service_fee_percent DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    opened_at DATETIME NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE RESTRICT,
    UNIQUE KEY uq_tenant_table_code (tenant_id, code),
    CONSTRAINT chk_tables_status CHECK (
        status IN ('livre', 'ocupada', 'conta_solicitada', 'reservada')
    )
) ENGINE=InnoDB;

-- 5. MENU_ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) DEFAULT 0.00,
    description TEXT,
    prep_station VARCHAR(30) NOT NULL DEFAULT 'cozinha',
    prep_time_minutes INT NOT NULL DEFAULT 15,
    is_available TINYINT(1) NOT NULL DEFAULT 1,
    image_url TEXT,
    unit VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT chk_menu_category CHECK (
        category IN ('bebidas', 'porcoes', 'pratos', 'aluguel', 'sobremesas', 'drinks', 'entradas')
    ),
    CONSTRAINT chk_menu_prep_station CHECK (
        prep_station IN ('bar', 'cozinha', 'apoio')
    )
) ENGINE=InnoDB;

-- 6. ORDERS_BILLS
CREATE TABLE IF NOT EXISTS orders_bills (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    table_id VARCHAR(50) NOT NULL,
    waiter_name VARCHAR(120),
    status VARCHAR(30) NOT NULL DEFAULT 'aberta',
    customer_count INT NOT NULL DEFAULT 1,
    subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    service_fee_percent DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    service_fee_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME NULL,
    notes TEXT,
    client_uuid CHAR(36) UNIQUE,
    device_id VARCHAR(100),
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES tables_spots(id) ON DELETE RESTRICT,
    CONSTRAINT chk_orders_status CHECK (
        status IN ('aberta', 'fechamento_solicitado', 'paga_parcial', 'paga_total', 'cancelada')
    )
) ENGINE=InnoDB;

-- 7. BILL_CUSTOMERS
CREATE TABLE IF NOT EXISTS bill_customers (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(30) NOT NULL DEFAULT '#3b82f6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders_bills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. ORDER_ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    item_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50),
    assigned_to_customer VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    prep_station VARCHAR(30) NOT NULL DEFAULT 'cozinha',
    status VARCHAR(30) NOT NULL DEFAULT 'enviado',
    notes TEXT,
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    client_uuid CHAR(36) UNIQUE,
    device_id VARCHAR(100),
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders_bills(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES bill_customers(id) ON DELETE SET NULL,
    CONSTRAINT chk_order_items_status CHECK (
        status IN ('enviado', 'preparando', 'pronto', 'entregue', 'cancelado')
    ),
    CONSTRAINT chk_order_items_prep_station CHECK (
        prep_station IN ('bar', 'cozinha', 'apoio')
    )
) ENGINE=InnoDB;

-- 9. TABLE_TRANSFER_LOGS
CREATE TABLE IF NOT EXISTS table_transfer_logs (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    source_table_code VARCHAR(30) NOT NULL,
    target_table_code VARCHAR(30) NOT NULL,
    transfer_type VARCHAR(40) NOT NULL,
    waiter_name VARCHAR(120) NOT NULL,
    items_transferred_count INT NOT NULL DEFAULT 0,
    customers_transferred_count INT NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT chk_transfer_type CHECK (
        transfer_type IN ('troca_completa', 'fusao', 'transferencia_itens')
    )
) ENGINE=InnoDB;

-- 10. CASH_SHIFTS
CREATE TABLE IF NOT EXISTS cash_shifts (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    operator_user_id VARCHAR(50) NOT NULL,
    opening_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    closing_balance DECIMAL(10,2),
    total_pix DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_credit DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_debit DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_cash DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_service_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'aberto',
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME NULL,
    notes TEXT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (operator_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_cash_shift_status CHECK (
        status IN ('aberto', 'fechado', 'conferido')
    )
) ENGINE=InnoDB;

-- 11. CASH_TRANSACTIONS
CREATE TABLE IF NOT EXISTS cash_transactions (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    cash_shift_id VARCHAR(50),
    order_id VARCHAR(50),
    customer_name VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(40) NOT NULL,
    transaction_type VARCHAR(40) NOT NULL DEFAULT 'pagamento_comanda',
    tx_id VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    client_uuid CHAR(36) UNIQUE,
    device_id VARCHAR(100),
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (cash_shift_id) REFERENCES cash_shifts(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders_bills(id) ON DELETE SET NULL,
    CONSTRAINT chk_cash_tx_payment_method CHECK (
        payment_method IN ('pix', 'cartao_credito', 'cartao_debito', 'dinheiro')
    ),
    CONSTRAINT chk_cash_tx_type CHECK (
        transaction_type IN ('pagamento_comanda', 'sangria', 'suprimento', 'estorno')
    )
) ENGINE=InnoDB;`;

export const SQLITE_OFFLINE_DDL = `-- =========================================================================
-- SOFTHAM OPENDESK - SQLITE 3 / SMART POS EMBEDDED OFFLINE DDL
-- Compacto, execução ultra-rápida no Android POS com idempotência (client_uuid)
-- =========================================================================

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS local_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS local_tables (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    sector TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'livre' CHECK (status IN ('livre', 'ocupada', 'conta_solicitada', 'reservada')),
    waiter_name TEXT,
    min_consumption REAL DEFAULT 0,
    service_fee_percent REAL DEFAULT 10,
    paid_amount REAL DEFAULT 0,
    opened_at TEXT,
    sync_status TEXT DEFAULT 'synced'
);

CREATE TABLE IF NOT EXISTS local_menu (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('bebidas', 'porcoes', 'pratos', 'aluguel', 'sobremesas', 'drinks', 'entradas')),
    price REAL NOT NULL,
    prep_station TEXT NOT NULL CHECK (prep_station IN ('bar', 'cozinha', 'apoio')),
    prep_time_minutes INTEGER DEFAULT 15,
    is_available INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS local_customers (
    id TEXT PRIMARY KEY,
    table_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    FOREIGN KEY (table_id) REFERENCES local_tables(id)
);

CREATE TABLE IF NOT EXISTS local_orders (
    id TEXT PRIMARY KEY,
    table_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    customer_id TEXT,
    assigned_to_customer TEXT NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price REAL NOT NULL,
    prep_station TEXT NOT NULL CHECK (prep_station IN ('bar', 'cozinha', 'apoio')),
    status TEXT NOT NULL DEFAULT 'enviado' CHECK (status IN ('enviado', 'preparando', 'pronto', 'entregue', 'cancelado')),
    notes TEXT,
    ordered_at TEXT NOT NULL,
    client_uuid TEXT UNIQUE,
    sync_status TEXT DEFAULT 'pending_upload',
    FOREIGN KEY (table_id) REFERENCES local_tables(id),
    FOREIGN KEY (customer_id) REFERENCES local_customers(id)
);

CREATE TABLE IF NOT EXISTS local_payments (
    id TEXT PRIMARY KEY,
    table_id TEXT NOT NULL,
    customer_name TEXT,
    amount REAL NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('pix', 'cartao_credito', 'cartao_debito', 'dinheiro')),
    timestamp TEXT NOT NULL,
    tx_id TEXT,
    client_uuid TEXT UNIQUE,
    sync_status TEXT DEFAULT 'pending_upload',
    FOREIGN KEY (table_id) REFERENCES local_tables(id)
);

CREATE TABLE IF NOT EXISTS local_transfer_audit (
    id TEXT PRIMARY KEY,
    source_table_code TEXT NOT NULL,
    target_table_code TEXT NOT NULL,
    transfer_type TEXT NOT NULL CHECK (transfer_type IN ('troca_completa', 'fusao', 'transferencia_itens')),
    waiter_name TEXT NOT NULL,
    items_count INTEGER NOT NULL,
    customers_count INTEGER NOT NULL,
    reason TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending_upload'
);`;

export const PRISMA_SCHEMA = `// =========================================================================
// SOFTHAM OPENDESK - PRISMA ORM SCHEMA DEFINITION
// Fully aligned with src/types.ts & Offline Sync Support
// =========================================================================

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum SegmentType {
  quiosque_praia
  restaurante_bar
  rooftop_lounge
  foodpark_complexo
}

enum UserRole {
  admin
  gerente
  garcom
  cozinha
  bar
  caixa
  apoio
}

enum TableStatus {
  livre
  ocupada
  conta_solicitada
  reservada
}

enum MenuCategory {
  bebidas
  porcoes
  pratos
  aluguel
  sobremesas
  drinks
  entradas
}

enum PrepStation {
  bar
  cozinha
  apoio
}

enum OrderStatus {
  aberta
  fechamento_solicitado
  paga_parcial
  paga_total
  cancelada
}

enum KdsStatus {
  enviado
  preparando
  pronto
  entregue
  cancelado
}

enum TransferType {
  troca_completa
  fusao
  transferencia_itens
}

enum PaymentMethod {
  pix
  cartao_credito
  cartao_debito
  dinheiro
}

enum CashShiftStatus {
  aberto
  fechado
  conferido
}

model Tenant {
  id                String       @id
  name              String       @db.VarChar(150)
  tradeName         String       @default("Softham OpenDesk") @db.VarChar(150)
  cnpjCpf           String?      @unique @db.VarChar(20)
  segmentType       SegmentType  @default(quiosque_praia)
  tagline           String?      @db.VarChar(255)
  location          String?      @db.VarChar(255)
  phone             String?      @db.VarChar(25)
  serviceFeePercent Decimal      @default(10.00) @db.Decimal(5, 2)
  currency          String       @default("BRL") @db.VarChar(5)
  isActive          Boolean      @default(true)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  users             User[]
  sectors           Sector[]
  tables            TableSpot[]
  menuItems         MenuItem[]
  orders            OrderBill[]
  customers         BillCustomer[]
  transfers         TableTransferLog[]
  cashShifts        CashShift[]
  cashTransactions  CashTransaction[]

  @@map("tenants")
}

model User {
  id        String   @id
  tenantId  String
  name      String   @db.VarChar(120)
  email     String?  @db.VarChar(150)
  role      UserRole @default(garcom)
  pinCode   String   @db.VarChar(10)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  shifts    CashShift[]

  @@unique([tenantId, pinCode])
  @@map("users")
}

model Sector {
  id          String      @id
  tenantId    String
  code        String      @db.VarChar(50)
  label       String      @db.VarChar(100)
  iconName    String      @default("sun") @db.VarChar(40)
  description String?     @db.Text
  sortOrder   Int         @default(0)
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())

  tenant      Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  tables      TableSpot[]

  @@unique([tenantId, code])
  @@map("sectors")
}

model TableSpot {
  id                 String      @id
  tenantId           String
  sectorId           String
  code               String      @db.VarChar(30)
  name               String      @db.VarChar(100)
  capacity           Int         @default(4)
  status             TableStatus @default(livre)
  currentWaiterName  String?     @db.VarChar(120)
  minConsumption     Decimal     @default(0.00) @db.Decimal(10, 2)
  serviceFeePercent  Decimal     @default(10.00) @db.Decimal(5, 2)
  paidAmount         Decimal     @default(0.00) @db.Decimal(10, 2)
  openedAt           DateTime?
  notes              String?     @db.Text
  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt

  tenant             Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  sector             Sector      @relation(fields: [sectorId], references: [id])
  orders             OrderBill[]

  @@unique([tenantId, code])
  @@map("tables_spots")
}

model MenuItem {
  id              String       @id
  tenantId        String
  name            String       @db.VarChar(150)
  category        MenuCategory
  price           Decimal      @db.Decimal(10, 2)
  costPrice       Decimal      @default(0.00) @db.Decimal(10, 2)
  description     String?      @db.Text
  prepStation     PrepStation  @default(cozinha)
  prepTimeMinutes Int          @default(15)
  isAvailable     Boolean      @default(true)
  imageUrl        String?      @db.Text
  unit            String?      @db.VarChar(30)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  tenant          Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  orderItems      OrderItem[]

  @@map("menu_items")
}

model OrderBill {
  id                String          @id
  tenantId          String
  tableId           String
  waiterName        String?         @db.VarChar(120)
  status            OrderStatus     @default(aberta)
  customerCount     Int             @default(1)
  subtotalAmount    Decimal         @default(0.00) @db.Decimal(10, 2)
  serviceFeePercent Decimal         @default(10.00) @db.Decimal(5, 2)
  serviceFeeAmount  Decimal         @default(0.00) @db.Decimal(10, 2)
  totalAmount       Decimal         @default(0.00) @db.Decimal(10, 2)
  paidAmount        Decimal         @default(0.00) @db.Decimal(10, 2)
  openedAt          DateTime        @default(now())
  closedAt          DateTime?
  notes             String?         @db.Text
  clientUuid        String?         @unique @db.Uuid
  deviceId          String?         @db.VarChar(100)
  syncedAt          DateTime        @default(now())
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  tenant            Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  table             TableSpot       @relation(fields: [tableId], references: [id])
  customers         BillCustomer[]
  items             OrderItem[]
  payments          CashTransaction[]

  @@map("orders_bills")
}

model BillCustomer {
  id        String      @id
  tenantId  String
  orderId   String
  name      String      @db.VarChar(100)
  color     String      @default("#3b82f6") @db.VarChar(30)
  createdAt DateTime    @default(now())

  tenant    Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  order     OrderBill   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  items     OrderItem[]

  @@map("bill_customers")
}

model OrderItem {
  id                 String        @id
  tenantId           String
  orderId            String
  itemId             String
  customerId         String?
  assignedToCustomer String        @db.VarChar(100)
  name               String        @db.VarChar(150)
  price              Decimal       @db.Decimal(10, 2)
  quantity           Int           @default(1)
  prepStation        PrepStation   @default(cozinha)
  status             KdsStatus     @default(enviado)
  notes              String?       @db.Text
  orderedAt          DateTime      @default(now())
  clientUuid         String?       @unique @db.Uuid
  deviceId           String?       @db.VarChar(100)
  syncedAt           DateTime      @default(now())
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  tenant             Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  order              OrderBill     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItem           MenuItem      @relation(fields: [itemId], references: [id])
  customer           BillCustomer? @relation(fields: [customerId], references: [id], onDelete: SetNull)

  @@map("order_items")
}

model TableTransferLog {
  id                       String       @id
  tenantId                 String
  sourceTableCode          String       @db.VarChar(30)
  targetTableCode          String       @db.VarChar(30)
  transferType             TransferType
  waiterName               String       @db.VarChar(120)
  itemsTransferredCount    Int          @default(0)
  customersTransferredCount Int         @default(0)
  reason                   String       @db.Text
  timestamp                DateTime     @default(now())

  tenant                   Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("table_transfer_logs")
}

model CashShift {
  id              String          @id
  tenantId        String
  operatorUserId  String
  openingBalance  Decimal         @default(0.00) @db.Decimal(10, 2)
  closingBalance  Decimal?        @db.Decimal(10, 2)
  totalPix        Decimal         @default(0.00) @db.Decimal(10, 2)
  totalCredit     Decimal         @default(0.00) @db.Decimal(10, 2)
  totalDebit      Decimal         @default(0.00) @db.Decimal(10, 2)
  totalCash       Decimal         @default(0.00) @db.Decimal(10, 2)
  totalServiceFee Decimal         @default(0.00) @db.Decimal(10, 2)
  status          CashShiftStatus @default(aberto)
  openedAt        DateTime        @default(now())
  closedAt        DateTime?
  notes           String?         @db.Text

  tenant          Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  operator        User            @relation(fields: [operatorUserId], references: [id])
  transactions    CashTransaction[]

  @@map("cash_shifts")
}

model CashTransaction {
  id              String        @id
  tenantId        String
  cashShiftId     String?
  orderId         String?
  customerName    String?       @db.VarChar(100)
  amount          Decimal       @db.Decimal(10, 2)
  paymentMethod   PaymentMethod
  transactionType String        @default("pagamento_comanda") @db.VarChar(40)
  txId            String?       @db.VarChar(100)
  timestamp       DateTime      @default(now())
  clientUuid      String?       @unique @db.Uuid
  deviceId        String?       @db.VarChar(100)
  syncedAt        DateTime      @default(now())

  tenant          Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  shift           CashShift?    @relation(fields: [cashShiftId], references: [id], onDelete: SetNull)
  order           OrderBill?    @relation(fields: [orderId], references: [id], onDelete: SetNull)

  @@map("cash_transactions")
}`;

export const SEED_DATA_SQL = `-- =========================================================================
-- SOFTHAM OPENDESK - SEED DATA (CARGA INICIAL COMPLETA DO MOCKDATA.TS)
-- 4 Perfis de Estabelecimento, Setores, 12 Itens de Cardápio, 8 Mesas,
-- Clientes de Rateio, Pedidos com Estados KDS, Pagamento e Logs de Auditoria
--
-- NOTA (pendências conhecidas):
--   * Apenas o tenant 'quiosque-praia' possui setores cadastrados. Os demais
--     (restaurante-bar, rooftop-lounge, foodpark-complexo) ainda não têm os
--     4 setores cada definidos em mockData.ts — e como tables_spots.sector_id
--     é NOT NULL, esses perfis ainda não podem receber mesas.
--   * O seed exercita apenas 'pix'. Faltam pagamentos em 'cartao_credito',
--     'cartao_debito' e 'dinheiro' para validar o CHECK de payment_method e
--     o fechamento de caixa por modalidade.
--   * Nenhum registro em cash_shifts — o DRE de caixa nasce vazio.
-- =========================================================================

-- 1. TENANTS (4 PERFIS DO MOCKDATA.TS)
INSERT INTO tenants (id, name, trade_name, segment_type, tagline, location, currency, service_fee_percent) VALUES
('quiosque-praia', 'Quiosque Estrela do Mar', 'Softham OpenDesk', 'quiosque_praia', 'Quiosques de Praia, Beach Clubs & Lazer Beira-Mar', 'Praia da Enseada, Posto 4', 'BRL', 10.00),
('restaurante-bar', 'Restaurante & Chopperia Central', 'Softham OpenDesk', 'restaurante_bar', 'Restaurantes, Bares, Gastrobares & Pubs', 'Avenida Gastronômica, 1200', 'BRL', 10.00),
('rooftop-lounge', 'Skyline Rooftop & Drinks', 'Softham OpenDesk', 'rooftop_lounge', 'Rooftops, Lounges de Alto Padrão & Casas Noturnas', 'Cobertura Empresarial Tower 28º Andar', 'BRL', 12.00),
('foodpark-complexo', 'Vila Gastronômica Food Park', 'Softham OpenDesk', 'foodpark_complexo', 'Food Parks, Complexos Gastronômicos & Praças de Alimentação', 'Parque das Artes, Setor Sul', 'BRL', 10.00)
ON CONFLICT (id) DO NOTHING;

-- 2. USERS (EQUIPE DE AREIA / RETAGUARDA)
INSERT INTO users (id, tenant_id, name, email, role, pin_code) VALUES
('u-1', 'quiosque-praia', 'Rodrigo Garçom (Areia)', 'rodrigo@softham.com', 'garcom', '1010'),
('u-2', 'quiosque-praia', 'Camila Garçom (Deck)', 'camila@softham.com', 'garcom', '2020'),
('u-3', 'quiosque-praia', 'Thiago Garçom (Lounge)', 'thiago@softham.com', 'garcom', '3030'),
('u-4', 'quiosque-praia', 'Chef Marcelo (Cozinha)', 'cozinha@softham.com', 'cozinha', '4040'),
('u-5', 'quiosque-praia', 'Mariana Barmaid (Bar)', 'bar@softham.com', 'bar', '5050'),
('u-6', 'quiosque-praia', 'Equipe Apoio de Praia', 'apoio@softham.com', 'apoio', '6060'),
('u-7', 'quiosque-praia', 'Gerência Geral Softham', 'admin@softham.com', 'admin', '9999')
ON CONFLICT (id) DO NOTHING;

-- 3. SECTORS (SETORES DO QUIOSQUE PRAIA)
INSERT INTO sectors (id, tenant_id, code, label, icon_name, description, sort_order) VALUES
('sec-1', 'quiosque-praia', 'areia_frente', '1ª Linha (Frente Mar)', 'sun', 'Guarda-sóis pé na areia beira d’água', 1),
('sec-2', 'quiosque-praia', 'areia_meio', '2ª Linha (Areia Central)', 'umbrella', 'Tendas e guarda-sóis intermediários', 2),
('sec-3', 'quiosque-praia', 'deck_coberto', 'Deck Coberto Principal', 'coffee', 'Mesas protegidas do sol com piso de madeira', 3),
('sec-4', 'quiosque-praia', 'lounge_bangalo', 'Lounge VIP Bangalôs', 'flame', 'Espaço com sofá, cortinas e consumação diferenciada', 4)
ON CONFLICT (id) DO NOTHING;

-- 4. MENU ITEMS (OS 12 ITENS DE INITIAL_MENU COM TODAS AS ESTAÇÕES: BAR, COZINHA, APOIO)
INSERT INTO menu_items (id, tenant_id, name, category, price, cost_price, description, prep_station, prep_time_minutes, is_available) VALUES
('item-1', 'quiosque-praia', 'Água de Coco Gelada (Fruta)', 'bebidas', 12.00, 3.50, 'Coco verde natural colhido e resfriado na hora', 'bar', 3, TRUE),
('item-2', 'quiosque-praia', 'Caipirinha Tradicional de Limão (500ml)', 'drinks', 26.00, 5.80, 'Cachaça artesanal da serra, limão taiti fresco e açúcar orgânico', 'bar', 5, TRUE),
('item-3', 'quiosque-praia', 'Gin Tropical da Praia (600ml)', 'drinks', 38.00, 9.50, 'Gin premium, Red Bull Tropical, laranja bahia e alecrim fresco', 'bar', 6, TRUE),
('item-4', 'quiosque-praia', 'Balde de Cerveja Heineken Long Neck (6 un)', 'bebidas', 78.00, 32.00, 'Balde de alumínio com gelo escama e 6 long necks 330ml estalando', 'bar', 4, TRUE),
('item-5', 'quiosque-praia', 'Suco Natural Abacaxi com Hortelã (400ml)', 'bebidas', 16.00, 4.20, 'Feito com a polpa da fruta fresca, sem conservantes', 'bar', 5, TRUE),
('item-6', 'quiosque-praia', 'Camarão Rosa à Milanesa Crocante (600g)', 'porcoes', 115.00, 42.00, 'Camarões limpos empanados em farinha panko, acompanha molho tártaro e limão siciliano', 'cozinha', 18, TRUE),
('item-7', 'quiosque-praia', 'Isca de Peixe do Dia com Molho Especial (500g)', 'porcoes', 84.00, 28.00, 'Filé de pescada amarela fresca empanada, crocante por fora e suculenta por dentro', 'cozinha', 15, TRUE),
('item-8', 'quiosque-praia', 'Lula à Dorê com Molho Rosé (400g)', 'porcoes', 89.00, 31.00, 'Anéis de lula tenros empanados e dourados na hora', 'cozinha', 14, TRUE),
('item-9', 'quiosque-praia', 'Porção Batata Rústica com Cheddar e Bacon', 'porcoes', 49.00, 14.50, 'Batatas com casca temperadas com páprica, cobertas com fondue de cheddar', 'cozinha', 12, TRUE),
('item-10', 'quiosque-praia', 'Casquinha de Siri Gratinada (Unidade)', 'pratos', 32.00, 9.00, 'Carne pura de siri refogada no azeite de dendê, leite de coco e gratinada com parmesão', 'cozinha', 10, TRUE),
('item-11', 'quiosque-praia', 'Aluguel Cadeira Confort Reclinável', 'aluguel', 25.00, 0.00, 'Cadeira confortável 4 posições. (Isenta se atingir consumação mínima)', 'apoio', 2, TRUE),
('item-12', 'quiosque-praia', 'Aluguel Guarda-Sol / Ombrelone 2,20m UV', 'aluguel', 40.00, 0.00, 'Montagem e fixação com ancoragem pela equipe de apoio', 'apoio', 2, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 5. TABLES & SPOTS (AS 8 MESAS DE INITIAL_TABLES COM CONSUMAÇÃO MÍNIMA E TAXA INDIVIDUAL)
INSERT INTO tables_spots (id, tenant_id, sector_id, code, name, capacity, status, current_waiter_name, min_consumption, service_fee_percent, paid_amount, opened_at, notes) VALUES
('table-1', 'quiosque-praia', 'sec-1', 'G-01', 'Guarda-Sol 01 (Frente Mar)', 4, 'ocupada', 'Rodrigo (Areia)', 120.00, 10.00, 0.00, '2026-08-26 10:15:00-03', 'Pediram guarda-sol bem inclinado por causa do vento'),
('table-2', 'quiosque-praia', 'sec-1', 'G-02', 'Guarda-Sol 02 (Frente Mar)', 6, 'conta_solicitada', 'Rodrigo (Areia)', 150.00, 10.00, 100.00, '2026-08-26 09:40:00-03', NULL),
('table-3', 'quiosque-praia', 'sec-1', 'G-03', 'Guarda-Sol 03 (Frente Mar)', 4, 'livre', NULL, 120.00, 10.00, 0.00, NULL, NULL),
('table-4', 'quiosque-praia', 'sec-3', 'M-01', 'Mesa Deck 01', 4, 'ocupada', 'Camila (Deck)', 0.00, 10.00, 0.00, '2026-08-26 11:10:00-03', NULL),
('table-5', 'quiosque-praia', 'sec-3', 'M-02', 'Mesa Deck 02', 6, 'livre', NULL, 0.00, 10.00, 0.00, NULL, NULL),
('table-6', 'quiosque-praia', 'sec-4', 'B-01', 'Bangalô VIP 01 (Lounge)', 8, 'ocupada', 'Thiago (Lounge)', 300.00, 12.00, 0.00, '2026-08-26 10:00:00-03', NULL),
('table-7', 'quiosque-praia', 'sec-2', 'G-10', 'Guarda-Sol 10 (Areia Meio)', 4, 'livre', NULL, 80.00, 10.00, 0.00, NULL, NULL),
('table-8', 'quiosque-praia', 'sec-2', 'G-11', 'Guarda-Sol 11 (Areia Meio)', 4, 'livre', NULL, 80.00, 10.00, 0.00, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 6. ORDERS BILLS (COMANDAS ATIVAS DAS MESAS OCUPADAS)
INSERT INTO orders_bills (id, tenant_id, table_id, waiter_name, status, customer_count, subtotal_amount, service_fee_percent, service_fee_amount, total_amount, paid_amount, opened_at, client_uuid, device_id) VALUES
('bill-1', 'quiosque-praia', 'table-1', 'Rodrigo (Areia)', 'aberta', 3, 217.00, 10.00, 21.70, 238.70, 0.00, '2026-08-26 10:15:00-03', 'e1111111-1111-1111-1111-111111111111', 'pos-sunmi-01'),
('bill-2', 'quiosque-praia', 'table-2', 'Rodrigo (Areia)', 'fechamento_solicitado', 4, 223.00, 10.00, 22.30, 245.30, 100.00, '2026-08-26 09:40:00-03', 'e2222222-2222-2222-2222-222222222222', 'pos-sunmi-01'),
('bill-4', 'quiosque-praia', 'table-4', 'Camila (Deck)', 'aberta', 2, 88.00, 10.00, 8.80, 96.80, 0.00, '2026-08-26 11:10:00-03', 'e4444444-4444-4444-4444-444444444444', 'tablet-deck-01'),
('bill-6', 'quiosque-praia', 'table-6', 'Thiago (Lounge)', 'aberta', 4, 318.00, 12.00, 38.16, 356.16, 0.00, '2026-08-26 10:00:00-03', 'e6666666-6666-6666-6666-666666666666', 'pos-gertec-02')
ON CONFLICT (id) DO NOTHING;

-- 7. BILL CUSTOMERS (CLIENTES PARA RATEIO COLORIDO POR PESSOA)
INSERT INTO bill_customers (id, tenant_id, order_id, name, color) VALUES
('c-1', 'quiosque-praia', 'bill-1', 'Lucas', '#3b82f6'),
('c-2', 'quiosque-praia', 'bill-1', 'Beatriz', '#ec4899'),
('c-3', 'quiosque-praia', 'bill-1', 'Mesa Toda', '#10b981'),
('c-4', 'quiosque-praia', 'bill-2', 'Carlos', '#f59e0b'),
('c-5', 'quiosque-praia', 'bill-2', 'Renata', '#8b5cf6'),
('c-6', 'quiosque-praia', 'bill-2', 'Felipe', '#06b6d4'),
('c-7', 'quiosque-praia', 'bill-2', 'Mesa Toda', '#10b981'),
('c-8', 'quiosque-praia', 'bill-4', 'Dr. Roberto', '#3b82f6'),
('c-9', 'quiosque-praia', 'bill-4', 'Mesa Toda', '#10b981'),
('c-10', 'quiosque-praia', 'bill-6', 'Amanda', '#ec4899'),
('c-11', 'quiosque-praia', 'bill-6', 'Gustavo', '#f59e0b'),
('c-12', 'quiosque-praia', 'bill-6', 'Priscila', '#8b5cf6'),
('c-13', 'quiosque-praia', 'bill-6', 'Mesa Toda', '#10b981')
ON CONFLICT (id) DO NOTHING;

-- 8. ORDER ITEMS (ITENS LANÇADOS COM ESTADOS KDS E ATRIBUIÇÃO AO CLIENTE)
INSERT INTO order_items (id, tenant_id, order_id, item_id, customer_id, assigned_to_customer, name, price, quantity, prep_station, status, notes, client_uuid, device_id) VALUES
('ord-1', 'quiosque-praia', 'bill-1', 'item-1', 'c-2', 'Beatriz', 'Água de Coco Gelada (Fruta)', 12.00, 2, 'bar', 'entregue', NULL, 'f1111111-1111-1111-1111-111111111111', 'pos-sunmi-01'),
('ord-2', 'quiosque-praia', 'bill-1', 'item-4', 'c-1', 'Lucas', 'Balde de Cerveja Heineken Long Neck (6 un)', 78.00, 1, 'bar', 'entregue', NULL, 'f2222222-2222-2222-2222-222222222222', 'pos-sunmi-01'),
('ord-3', 'quiosque-praia', 'bill-1', 'item-6', 'c-3', 'Mesa Toda', 'Camarão Rosa à Milanesa Crocante (600g)', 115.00, 1, 'cozinha', 'pronto', 'Molho tártaro extra, por favor', 'f3333333-3333-3333-3333-333333333333', 'pos-sunmi-01'),
('ord-4', 'quiosque-praia', 'bill-2', 'item-7', 'c-7', 'Mesa Toda', 'Isca de Peixe do Dia com Molho Especial (500g)', 84.00, 1, 'cozinha', 'entregue', NULL, 'f4444444-4444-4444-4444-444444444444', 'pos-sunmi-01'),
('ord-5', 'quiosque-praia', 'bill-2', 'item-2', 'c-5', 'Renata', 'Caipirinha Tradicional de Limão (500ml)', 26.00, 2, 'bar', 'entregue', NULL, 'f5555555-5555-5555-5555-555555555555', 'pos-sunmi-01'),
('ord-6', 'quiosque-praia', 'bill-2', 'item-3', 'c-6', 'Felipe', 'Gin Tropical da Praia (600ml)', 38.00, 1, 'bar', 'entregue', NULL, 'f6666666-6666-6666-6666-666666666666', 'pos-sunmi-01'),
('ord-7', 'quiosque-praia', 'bill-2', 'item-9', 'c-4', 'Carlos', 'Porção Batata Rústica com Cheddar e Bacon', 49.00, 1, 'cozinha', 'entregue', NULL, 'f7777777-7777-7777-7777-777777777777', 'pos-sunmi-01'),
('ord-8', 'quiosque-praia', 'bill-4', 'item-10', 'c-8', 'Dr. Roberto', 'Casquinha de Siri Gratinada (Unidade)', 32.00, 2, 'cozinha', 'preparando', NULL, 'f8888888-8888-8888-8888-888888888888', 'tablet-deck-01'),
('ord-9', 'quiosque-praia', 'bill-4', 'item-1', 'c-8', 'Dr. Roberto', 'Água de Coco Gelada (Fruta)', 12.00, 2, 'bar', 'entregue', NULL, 'f9999999-9999-9999-9999-999999999999', 'tablet-deck-01'),
('ord-10', 'quiosque-praia', 'bill-6', 'item-3', 'c-10', 'Amanda', 'Gin Tropical da Praia (600ml)', 38.00, 3, 'bar', 'entregue', NULL, 'faaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'pos-gertec-02'),
('ord-11', 'quiosque-praia', 'bill-6', 'item-6', 'c-13', 'Mesa Toda', 'Camarão Rosa à Milanesa Crocante (600g)', 115.00, 1, 'cozinha', 'entregue', NULL, 'fbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pos-gertec-02'),
('ord-12', 'quiosque-praia', 'bill-6', 'item-8', 'c-13', 'Mesa Toda', 'Lula à Dorê com Molho Rosé (400g)', 89.00, 1, 'cozinha', 'preparando', NULL, 'fccccccc-cccc-cccc-cccc-cccccccccccc', 'pos-gertec-02')
ON CONFLICT (id) DO NOTHING;

-- 9. CASH TRANSACTIONS & PAYMENTS (PAGAMENTO PARCIAL REGISTRADO NA MESA G-02)
INSERT INTO cash_transactions (id, tenant_id, order_id, customer_name, amount, payment_method, transaction_type, tx_id, client_uuid, device_id) VALUES
('pay-1', 'quiosque-praia', 'bill-2', 'Carlos', 100.00, 'pix', 'pagamento_comanda', 'PIX-98234710', 'd1111111-1111-1111-1111-111111111111', 'pos-sunmi-01')
ON CONFLICT (id) DO NOTHING;

-- 10. TABLE TRANSFER LOGS (HISTÓRICO DE AUDITORIA DE TROCAS / FUSÕES)
INSERT INTO table_transfer_logs (id, tenant_id, source_table_code, target_table_code, transfer_type, waiter_name, items_transferred_count, customers_transferred_count, reason) VALUES
('log-1', 'quiosque-praia', 'G-05', 'M-01', 'troca_completa', 'Rodrigo (Areia)', 4, 2, 'Maré alta atingiu a faixa de areia frontal, clientes migraram para o deck.'),
('log-2', 'quiosque-praia', 'G-08', 'G-02', 'fusao', 'Camila (Deck)', 2, 1, 'Cliente encontrou amigos na mesa vizinha e juntaram as contas.')
ON CONFLICT (id) DO NOTHING;`;
