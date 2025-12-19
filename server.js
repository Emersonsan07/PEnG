const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Permitir que o front-end se comunique com este servidor
app.use(cors());
app.use(express.json());

app.post('/subscribe', (req, res) => {
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ error: 'E-mail é obrigatório' });

    // Formato: Data, Email (CSV)
    const logEntry = `${new Date().toISOString()},${email}\n`;

    fs.appendFile('emails.csv', logEntry, (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao salvar no arquivo' });
        console.log(`Novo inscrito: ${email}`);
        res.json({ message: 'Sucesso' });
    });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));