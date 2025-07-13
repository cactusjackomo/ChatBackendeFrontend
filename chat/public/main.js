const socket = io();

const clientsTotal = document.getElementById('clients-total');
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
//prende gli elementi di index.html

function getUsernameFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('username') || 'anonymous';
}//permette di prendere il username dalla url, se non c'è l'username viene impostato come anonymous

let username = getUsernameFromURL();//permette di settare username

if (username === 'anonymous') {
    alert('Accesso negato: devi essere autenticato per usare la chat.');

    messageInput.disabled = true;
    messageForm.querySelector('button[type="submit"]').disabled = true; //disabilita funzioni della chat agli anonimi
} else {
    socket.emit('register', username);

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!messageInput.value) return;
        socket.emit('message', { message: messageInput.value });
        messageInput.value = ''; //permette di non inviare messaggi vuoti e nel caso se ne inviasse uno, di svuotare la barra e di inviarne uno nuovo.

    });

    socket.on('clients-total', (data) => {
        clientsTotal.innerText = `Total Clients: ${data}`; //permette di vedere il numero di client connessi.
    });

    socket.on('chat-message', (data) => {
        const isOwnMessage = data.name === username;
        addMessageToUI(data, isOwnMessage); //gestione invio messaggi e visualizzazione
    });

    function addMessageToUI(data, isOwnMessage) {
        const messageElement = document.createElement('li');
        messageElement.classList.add(isOwnMessage ? 'message-right' : 'message-left'); //check se il messaggio è nostro o di un altro
        messageElement.innerHTML = `
            <p class="message">
                ${data.message}
                <span>${data.name} | ${new Date(data.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>  
                
            </p>
        `;
        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight; //permette di vedere il messaggio scritto e scrolla verso il basso
    }




}