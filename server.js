/* server.js */
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Configurações de Pastas
const DATA_DIR = path.join(__dirname, 'data');
const FILE_PATH = path.join(DATA_DIR, 'leads.csv');

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (Front-end)
app.use(express.static(__dirname)); 

// Garantir que a pasta de dados existe
if (!fs.existsSync(DATA_DIR)){
    fs.mkdirSync(DATA_DIR);
}

// Rota de API: Salvar Lead
app.post('/lead', (req, res) => {
    const { name, email, company, position, interest, date } = req.body;

    if (!email || !name) {
        return res.status(400).json({ error: 'Dados obrigatórios faltando.' });
    }

    // Cria cabeçalho do CSV se arquivo não existir
    if (!fs.existsSync(FILE_PATH)) {
        fs.writeFileSync(FILE_PATH, 'Date,Name,Email,Company,Position,Interest\n');
    }

    // Sanitização simples para CSV (evita quebra por vírgulas no input)
    const safe = (text) => text ? text.replace(/,/g, ';').replace(/"/g, '') : '';
    
    const logEntry = `${date},"${safe(name)}","${safe(email)}","${safe(company)}","${safe(position)}","${safe(interest)}"\n`;

    fs.appendFile(FILE_PATH, logEntry, (err) => {
        if (err) {
            console.error('Erro ao salvar:', err);
            return res.status(500).json({ error: 'Erro interno.' });
        }
        console.log(`[Lead] ${name} (${company}) salvo com sucesso.`);
        res.json({ message: 'Lead capturado!' });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📂 Acesse o site em http://localhost:${PORT}/index.html`);
});