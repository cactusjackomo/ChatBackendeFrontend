const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;
//creazione web server

const server = app.listen(PORT, () =>
    console.log(`Server aperto sulla porta ${PORT}`)
);

const { Server } = require('socket.io'); //libreria socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173', //accetta richieste da origin
        methods: ["GET", "POST"],
        credentials: true
    }
});


const publicPath = path.join('./src');
console.log(`Cartella pubblica: ${publicPath}`); //per vedere la cartella pubblica


app.use((req, res, next) => {

    if (
        (req.path === '/' || req.path === '/index.html') &&
        (!req.query.username || req.query.username === 'anonymous')
    ) {
        return res.status(403).send('<h1>Accesso negato</h1><p>Devi essere autenticato per usare la chat.</p>');
    }
    next(); //middleware che non permette agli utenti non autorizzati ad usare la chat
});


app.use(express.static(publicPath)); //serve i file statici solo dopo che l'username è stato verificato


app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
}); //viene inviato file index.html


let socketsConnected = new Set(); //tiene traccia degli ID

io.on('connection', (socket) => {
    socketsConnected.add(socket.id);
    io.emit('clients-total', socketsConnected.size); //fa vedere il numero di client connessi

    socket.on('register', (username) => {
        if (!username || username === 'anonymous') {
            socket.disconnect();
        } else {
            socket.username = username;
        }
    }); //permette di assegnare l'username dell'utente e nel caso non fosse registrato al sito, lo reinderizza nella registrazione.

    socket.on('disconnect', () => {
        socketsConnected.delete(socket.id);
        io.emit('clients-total', socketsConnected.size);
    }); //rimozione numero id dal socketsConnected

    socket.on('message', (data) => {
        if (!socket.username || socket.username === 'anonymous') return;
        io.emit('chat-message', {
            message: data.message,
            name: socket.username,
            dateTime: new Date()
        }); //permette di mandare il messaggio e di vedere il nome dell'utente che lo ha scritto e la data.
    });
});
