import { getDatabase } from './connection';
import { initializeDatabase } from './init';

function seed(): void {
  initializeDatabase();
  const db = getDatabase();

  // Seed individual clients
  const insertIndividual = db.prepare(`
    INSERT OR IGNORE INTO individual_clients (full_name, monthly_income, age, phone, email, category, balance)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const individuals = [
    ['Ana Paula Silva', 5000, 32, '11999991111', 'ana.paula@email.com', 'premium', 15000],
    ['Carlos Eduardo Souza', 3500, 45, '11988882222', 'carlos.souza@email.com', 'standard', 8500],
    ['Mariana Oliveira', 7000, 28, '11977773333', 'mariana.oliveira@email.com', 'premium', 25000],
    ['João Pedro Costa', 2800, 38, '11966664444', 'joao.costa@email.com', 'standard', 4200],
    ['Fernanda Lima', 9500, 52, '11955555555', 'fernanda.lima@email.com', 'vip', 85000],
    ['Roberto Santos', 4200, 41, '11944446666', 'roberto.santos@email.com', 'standard', 12000],
    ['Luciana Ferreira', 6800, 35, '11933337777', 'luciana.ferreira@email.com', 'premium', 31000],
    ['Diego Alves', 3100, 29, '11922228888', 'diego.alves@email.com', 'standard', 2800],
    ['Camila Rodrigues', 5500, 44, '11911119999', 'camila.rodrigues@email.com', 'premium', 19500],
    ['Rafael Torres', 8200, 33, '11900000000', 'rafael.torres@email.com', 'vip', 55000],
  ];

  for (const individual of individuals) {
    insertIndividual.run(...individual);
  }

  // Seed business clients
  const insertBusiness = db.prepare(`
    INSERT OR IGNORE INTO business_clients (company_name, trade_name, cnpj, phone, email, category, balance)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const businesses = [
    ['Tech Solutions Ltda', 'TechSol', '11.222.333/0001-44', '1133334444', 'contato@techsol.com.br', 'corporate', 150000],
    ['Comércio Geral S.A.', 'ComGeral', '22.333.444/0001-55', '1144445555', 'financeiro@comgeral.com.br', 'premium', 280000],
    ['Distribuidora Norte Ltda', 'DistriNorte', '33.444.555/0001-66', '1155556666', 'adm@distinorte.com.br', 'standard', 95000],
    ['Serviços Integrados ME', 'ServiInt', '44.555.666/0001-77', '1166667777', 'contato@serviint.com.br', 'standard', 42000],
    ['Indústria Brasileira S.A.', 'IndusBR', '55.666.777/0001-88', '1177778888', 'financeiro@indusbr.com.br', 'corporate', 520000],
  ];

  for (const business of businesses) {
    insertBusiness.run(...business);
  }

  // Seed sample transactions
  const insertTransaction = db.prepare(`
    INSERT INTO transactions (client_id, client_type, transaction_type, amount, description, previous_balance, new_balance, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transactions = [
    [1, 'individual', 'deposit', 5000, 'Depósito inicial', 10000, 15000, '2024-01-15 10:00:00'],
    [1, 'individual', 'withdrawal', 500, 'Saque - despesas pessoais', 15500, 15000, '2024-01-20 14:30:00'],
    [2, 'individual', 'deposit', 3500, 'Salário janeiro', 5000, 8500, '2024-01-31 09:00:00'],
    [3, 'individual', 'withdrawal', 800, 'Saque - conta médica', 25800, 25000, '2024-02-05 11:00:00'],
    [1, 'business', 'deposit', 50000, 'Recebimento de cliente', 100000, 150000, '2024-01-10 08:00:00'],
    [2, 'business', 'withdrawal', 20000, 'Pagamento de fornecedor', 300000, 280000, '2024-01-25 15:00:00'],
  ];

  for (const tx of transactions) {
    insertTransaction.run(...tx);
  }

  console.log('Database seeded successfully with sample data.');
}

seed();
