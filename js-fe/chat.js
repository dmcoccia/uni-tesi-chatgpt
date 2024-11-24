(async function () {
  let threadId;

  // Effettua la chiamata in GET per ottenere il threadId
  try {
    const threadResponse = await fetch('http://localhost:3000/thread');
    const threadData = await threadResponse.json();
    threadId = threadData.threadId;
    console.log('Thread ID:', threadId);
  } catch (error) {
    console.error('Errore durante la chiamata GET al thread:', error);
    return;
  }

  // Crea il contenitore principale della chat
  const chatBox = document.createElement('div');
  chatBox.style.position = 'fixed';
  chatBox.style.bottom = '10px';
  chatBox.style.right = '10px';
  chatBox.style.width = '400px'; // Dimensione ingrandita
  chatBox.style.height = '500px'; // Dimensione ingrandita
  chatBox.style.backgroundColor = '#ffffff';
  chatBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  chatBox.style.border = '1px solid #ddd';
  chatBox.style.display = 'flex';
  chatBox.style.flexDirection = 'column';
  chatBox.style.fontFamily = 'Arial, sans-serif';
  chatBox.style.zIndex = '1000';

  // Intestazione della chat
  const chatHeader = document.createElement('div');
  chatHeader.style.backgroundColor = '#001f60';
  chatHeader.style.color = '#ffffff';
  chatHeader.style.padding = '15px';
  chatHeader.style.border = '1px solid #001f60';
  chatHeader.style.display = 'flex';
  chatHeader.style.justifyContent = 'space-between';
  chatHeader.style.alignItems = 'center';

  const chatTitle = document.createElement('span');
  chatTitle.textContent = 'Chat live';
  chatTitle.style.fontSize = '18px';
  chatTitle.style.fontWeight = 'bold';
  chatHeader.appendChild(chatTitle);

  const closeButton = document.createElement('button');
  closeButton.textContent = '✕';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.color = '#ffffff';
  closeButton.style.fontSize = '20px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = minimizeChat; // Minimizza la chat
  chatHeader.appendChild(closeButton);
  chatBox.appendChild(chatHeader);

  // Corpo della chat
  const chatBody = document.createElement('div');
  chatBody.id = 'chatBody';
  chatBody.style.flex = '1';
  chatBody.style.padding = '10px';
  chatBody.style.overflowY = 'auto';
  chatBody.style.borderTop = '1px solid #ddd';

  chatBox.appendChild(chatBody);

  // Footer della chat
  const chatFooter = document.createElement('div');
  chatFooter.style.padding = '10px';
  chatFooter.style.borderTop = '1px solid #ddd';
  chatFooter.style.display = 'flex';
  chatFooter.style.alignItems = 'center';
  chatFooter.style.justifyContent = 'space-between';

  const chatInput = document.createElement('textarea');
  chatInput.placeholder = 'Scrivi qui il tuo messaggio';
  chatInput.id = 'chatInput';
  chatInput.style.flex = '1';
  chatInput.style.height = '50px';
  chatInput.style.padding = '10px';
  chatInput.style.border = '1px solid #ddd';
  chatInput.style.fontSize = '16px';
  chatInput.style.resize = 'none';

  // Riconosce il tasto "Invio" per inviare il messaggio (Shift+Invio per nuova riga)
  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Evita nuova riga
      sendMessage();
    }
  });

  const sendButton = document.createElement('button');
  sendButton.textContent = 'Invia';
  sendButton.style.backgroundColor = '#001f60';
  sendButton.style.color = '#ffffff';
  sendButton.style.border = 'none';
  sendButton.style.padding = '12px 16px';
  sendButton.style.marginLeft = '10px';
  sendButton.style.fontSize = '16px';
  sendButton.style.cursor = 'pointer';
  sendButton.onclick = sendMessage;

  chatFooter.appendChild(chatInput);
  chatFooter.appendChild(sendButton);
  chatBox.appendChild(chatFooter);

  // Aggiunge la chat al body del documento
  document.body.appendChild(chatBox);

  // Crea il pulsante flottante
  const floatingButton = document.createElement('button');
  floatingButton.textContent = '💬';
  floatingButton.style.position = 'fixed';
  floatingButton.style.bottom = '10px';
  floatingButton.style.right = '10px';
  floatingButton.style.width = '50px';
  floatingButton.style.height = '50px';
  floatingButton.style.border = 'none';
  floatingButton.style.backgroundColor = '#001f60';
  floatingButton.style.color = '#ffffff';
  floatingButton.style.borderRadius = '50%';
  floatingButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  floatingButton.style.fontSize = '24px';
  floatingButton.style.display = 'none'; // Inizialmente nascosto
  floatingButton.style.cursor = 'pointer';
  floatingButton.onclick = maximizeChat; // Riporta la chat allo stato completo

  document.body.appendChild(floatingButton);

  // Funzione per inviare il messaggio
  async function sendMessage() {
    const message = chatInput.value.trim();
    if (message === '') return;

    // Mostra il messaggio dell'utente nella chat
    const userMessageElement = document.createElement('div');
    userMessageElement.className = 'chat-message';
    userMessageElement.innerHTML = `<small>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Utente scrive:</small><br>${message}`;
    userMessageElement.style.marginBottom = '10px';
    userMessageElement.style.fontSize = '14px';
    userMessageElement.style.color = '#333';
    chatBody.appendChild(userMessageElement);

    chatInput.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    // Mostra un'animazione di caricamento
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loading';
    loadingElement.innerHTML = `<small>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Operatore scrive:</small><br>...`;
    loadingElement.style.marginBottom = '10px';
    loadingElement.style.fontSize = '14px';
    loadingElement.style.color = '#999';
    loadingElement.style.lineHeight = '1.8';
    chatBody.appendChild(loadingElement);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Effettua la chiamata in POST per inviare il messaggio
    try {
      const response = await fetch('http://localhost:3000/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, threadId }),
      });

      const responseData = await response.json();

      // Rimuove il caricamento e mostra la risposta del server
      chatBody.removeChild(loadingElement);

      const responseElement = document.createElement('div');
      responseElement.className = 'chat-message';
      responseElement.innerHTML = `<small>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Operatore scrive:</small><br>${responseData.response}`;
      responseElement.style.marginBottom = '10px';
      responseElement.style.fontSize = '16px';
      responseElement.style.color = '#001f60';
      responseElement.style.fontWeight = 'normal';
      responseElement.style.lineHeight = '1.8';
      chatBody.appendChild(responseElement);
      chatBody.scrollTop = chatBody.scrollHeight;
    } catch (error) {
      console.error('Errore durante la chiamata POST:', error);
      chatBody.removeChild(loadingElement);
    }
  }

  // Funzione per minimizzare la chat
  function minimizeChat() {
    chatBox.style.display = 'none';
    floatingButton.style.display = 'block';
  }

  // Funzione per massimizzare la chat
  function maximizeChat() {
    chatBox.style.display = 'flex';
    floatingButton.style.display = 'none';
  }
})();
