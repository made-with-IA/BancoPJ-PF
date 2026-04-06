import app from './app';

const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🏦 Sistema Bancário rodando na porta ${PORT}`);
  console.log(`   Acesse: http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
