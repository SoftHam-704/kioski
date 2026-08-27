-- =========================================================================
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
CREATE INDEX IF NOT EXISTS idx_items_sync ON order_items (client_uuid, synced_at);
