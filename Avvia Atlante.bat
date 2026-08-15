@echo off
cd /d "%~dp0"
title Atlante dei Vulcani - Server (non chiudere finche' stai navigando)
echo Avvio del server locale...
start "Server Atlante Vulcani" /min cmd /c "python -m http.server 8756"
timeout /t 2 /nobreak >nul
start "" "http://localhost:8756"
echo.
echo L'Atlante dei Vulcani e' aperto nel browser.
echo Per chiudere: chiudi questa finestra e quella minimizzata "Server Atlante Vulcani".
pause >nul
