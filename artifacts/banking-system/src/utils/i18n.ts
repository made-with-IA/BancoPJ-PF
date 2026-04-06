const translations: Record<string, Record<string, string>> = {
  pt: {
    // Navigation
    dashboard: 'Dashboard',
    clients: 'Clientes',
    newClient: 'Novo Cliente',
    settings: 'Configurações',
    statement: 'Extrato',

    // Actions
    edit: 'Editar',
    delete: 'Excluir',
    save: 'Salvar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    search: 'Buscar',
    filter: 'Filtrar',
    clearFilters: 'Limpar Filtros',
    exportPdf: 'Exportar PDF',
    exportCsv: 'Exportar CSV',
    withdraw: 'Sacar',
    deposit: 'Depositar',
    viewStatement: 'Ver Extrato',
    viewDetails: 'Ver Detalhes',

    // Client Types
    individualClient: 'Pessoa Física',
    businessClient: 'Pessoa Jurídica',
    clientType: 'Tipo de Cliente',

    // Form labels - Individual
    fullName: 'Nome Completo',
    monthlyIncome: 'Renda Mensal',
    age: 'Idade',
    phone: 'Telefone / Celular',
    email: 'E-mail',
    category: 'Categoria',
    balance: 'Saldo',

    // Form labels - Business
    companyName: 'Razão Social',
    tradeName: 'Nome Fantasia',
    cnpj: 'CNPJ',

    // Categories
    standard: 'Padrão',
    premium: 'Premium',
    vip: 'VIP',
    corporate: 'Corporativo',

    // Transaction
    transactionType: 'Tipo de Transação',
    amount: 'Valor',
    description: 'Descrição',
    previousBalance: 'Saldo Anterior',
    newBalance: 'Novo Saldo',
    deposit: 'Depósito',
    withdrawal: 'Saque',
    transfer: 'Transferência',

    // Pagination
    previousPage: 'Página Anterior',
    nextPage: 'Próxima Página',
    page: 'Página',
    of: 'de',
    results: 'resultados',
    showing: 'Exibindo',
    to: 'a',

    // Filters
    filters: 'Filtros',
    minBalance: 'Saldo Mínimo',
    maxBalance: 'Saldo Máximo',
    startDate: 'Data Início',
    endDate: 'Data Fim',

    // Messages
    clientCreated: 'Cliente criado com sucesso!',
    clientUpdated: 'Cliente atualizado com sucesso!',
    clientDeleted: 'Cliente excluído com sucesso!',
    withdrawalSuccess: 'Saque realizado com sucesso!',
    settingsUpdated: 'Configurações salvas com sucesso!',
    confirmDelete: 'Tem certeza que deseja excluir este cliente?',
    noRecords: 'Nenhum registro encontrado.',
    errorGeneric: 'Ocorreu um erro. Tente novamente.',

    // Validation errors
    requiredField: 'Campo obrigatório',
    invalidEmail: 'E-mail inválido',
    invalidAge: 'Idade inválida',
    invalidBalance: 'Saldo inválido',
    invalidAmount: 'Valor inválido',
    invalidCnpj: 'CNPJ inválido',
    insufficientBalance: 'Saldo insuficiente para o saque',
    withdrawalLimitExceeded: 'Valor excede o limite máximo de saque',
    amountMustBePositive: 'O valor deve ser maior que zero',

    // Dashboard
    totalClients: 'Total de Clientes',
    totalIndividual: 'Pessoa Física',
    totalBusiness: 'Pessoa Jurídica',
    totalBalance: 'Saldo Total',
    recentTransactions: 'Transações Recentes',

    // Settings
    language: 'Idioma',
    currencyFormat: 'Formato de Moeda',
    dateFormat: 'Formato de Data',
    portuguese: 'Português',
    english: 'Inglês',

    // Statement
    currentBalance: 'Saldo Atual',
    transactionHistory: 'Histórico de Transações',
    noTransactions: 'Nenhuma transação encontrada.',

    // Export
    reportTitle: 'Relatório de Clientes - Sistema Bancário',
    generatedAt: 'Gerado em',
    withdrawalLimit: 'Limite de Saque',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    clients: 'Clients',
    newClient: 'New Client',
    settings: 'Settings',
    statement: 'Statement',

    // Actions
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    search: 'Search',
    filter: 'Filter',
    clearFilters: 'Clear Filters',
    exportPdf: 'Export PDF',
    exportCsv: 'Export CSV',
    withdraw: 'Withdraw',
    deposit: 'Deposit',
    viewStatement: 'View Statement',
    viewDetails: 'View Details',

    // Client Types
    individualClient: 'Individual Client',
    businessClient: 'Business Client',
    clientType: 'Client Type',

    // Form labels - Individual
    fullName: 'Full Name',
    monthlyIncome: 'Monthly Income',
    age: 'Age',
    phone: 'Phone',
    email: 'Email',
    category: 'Category',
    balance: 'Balance',

    // Form labels - Business
    companyName: 'Company Name',
    tradeName: 'Trade Name',
    cnpj: 'CNPJ',

    // Categories
    standard: 'Standard',
    premium: 'Premium',
    vip: 'VIP',
    corporate: 'Corporate',

    // Transaction
    transactionType: 'Transaction Type',
    amount: 'Amount',
    description: 'Description',
    previousBalance: 'Previous Balance',
    newBalance: 'New Balance',
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    transfer: 'Transfer',

    // Pagination
    previousPage: 'Previous Page',
    nextPage: 'Next Page',
    page: 'Page',
    of: 'of',
    results: 'results',
    showing: 'Showing',
    to: 'to',

    // Filters
    filters: 'Filters',
    minBalance: 'Min Balance',
    maxBalance: 'Max Balance',
    startDate: 'Start Date',
    endDate: 'End Date',

    // Messages
    clientCreated: 'Client created successfully!',
    clientUpdated: 'Client updated successfully!',
    clientDeleted: 'Client deleted successfully!',
    withdrawalSuccess: 'Withdrawal completed successfully!',
    settingsUpdated: 'Settings saved successfully!',
    confirmDelete: 'Are you sure you want to delete this client?',
    noRecords: 'No records found.',
    errorGeneric: 'An error occurred. Please try again.',

    // Validation errors
    requiredField: 'Required field',
    invalidEmail: 'Invalid email',
    invalidAge: 'Invalid age',
    invalidBalance: 'Invalid balance',
    invalidAmount: 'Invalid amount',
    invalidCnpj: 'Invalid CNPJ',
    insufficientBalance: 'Insufficient balance for withdrawal',
    withdrawalLimitExceeded: 'Amount exceeds maximum withdrawal limit',
    amountMustBePositive: 'Amount must be greater than zero',

    // Dashboard
    totalClients: 'Total Clients',
    totalIndividual: 'Individual',
    totalBusiness: 'Business',
    totalBalance: 'Total Balance',
    recentTransactions: 'Recent Transactions',

    // Settings
    language: 'Language',
    currencyFormat: 'Currency Format',
    dateFormat: 'Date Format',
    portuguese: 'Portuguese',
    english: 'English',

    // Statement
    currentBalance: 'Current Balance',
    transactionHistory: 'Transaction History',
    noTransactions: 'No transactions found.',

    // Export
    reportTitle: 'Client Report - Banking System',
    generatedAt: 'Generated at',
    withdrawalLimit: 'Withdrawal Limit',
  },
};

export function t(key: string, lang: string = 'pt'): string {
  const langTranslations = translations[lang] || translations['pt'];
  return langTranslations[key] || translations['pt'][key] || key;
}

export function getTranslations(lang: string): Record<string, string> {
  return { ...translations['pt'], ...(translations[lang] || {}) };
}
