@echo off
REM FinanceTrack - Quick Setup and Test Runner for Windows

echo.
echo 🚀 FinanceTrack - Melhorias Implementadas
echo ============================================
echo.

echo 📦 Instalando dependências do backend...
cd backend
call npm install
cd ..

echo.
echo 📦 Instalando dependências do frontend...
cd frontend
call npm install
cd ..

echo.
echo 🧪 Executando testes do backend...
cd backend
call npm test -- --passWithNoTests
cd ..

echo.
echo 🧪 Executando testes do frontend...
cd frontend
call npm test -- --passWithNoTests
cd ..

echo.
echo ✅ Testes concluídos!
echo.
echo 💡 Próximos passos:
echo   1. npm run dev (no backend)
echo   2. npm run dev (no frontend)
echo   3. Acessar documentação da API: http://localhost:3000/api/docs
echo   4. Ver logs em: backend/logs/
echo.
