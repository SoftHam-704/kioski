-- =========================================================================
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
ON CONFLICT (id) DO NOTHING;
