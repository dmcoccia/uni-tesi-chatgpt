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
    chatBox.style.width = '300px';
    chatBox.style.height = '400px';
    chatBox.style.backgroundColor = '#ffffff';
    chatBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    chatBox.style.borderRadius = '10px';
    chatBox.style.display = 'flex';
    chatBox.style.flexDirection = 'column';
    chatBox.style.fontFamily = 'Arial, sans-serif';
    chatBox.style.zIndex = '1000';
  
    // Intestazione della chat
    const chatHeader = document.createElement('div');
    chatHeader.style.backgroundColor = '#001f60';
    chatHeader.style.color = '#ffffff';
    chatHeader.style.padding = '10px';
    chatHeader.style.borderTopLeftRadius = '10px';
    chatHeader.style.borderTopRightRadius = '10px';
    chatHeader.style.display = 'flex';
    chatHeader.style.justifyContent = 'space-between';
    chatHeader.style.alignItems = 'center';
  
    const chatTitle = document.createElement('span');
    chatTitle.textContent = 'Chat live';
    chatTitle.style.fontSize = '16px';
    chatTitle.style.fontWeight = 'bold';
    chatHeader.appendChild(chatTitle);
  
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = '#ffffff';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
      chatBox.style.display = 'none';
    };
    chatHeader.appendChild(closeButton);
    chatBox.appendChild(chatHeader);
  
    // Corpo della chat
    const chatBody = document.createElement('div');
    chatBody.id = 'chatBody';
    chatBody.style.flex = '1';
    chatBody.style.padding = '10px';
    chatBody.style.overflowY = 'auto';
    chatBody.style.borderTop = '1px solid #ddd';
  
    const initialMessage = document.createElement('div');
    initialMessage.className = 'chat-message';
    initialMessage.innerHTML = 'Chat avviata<br><small>4:57 PM</small>';
    initialMessage.style.marginBottom = '10px';
    initialMessage.style.fontSize = '14px';
    initialMessage.style.color = '#333';
    chatBody.appendChild(initialMessage);
  
    chatBox.appendChild(chatBody);
  
    // Footer della chat
    const chatFooter = document.createElement('div');
    chatFooter.style.padding = '10px';
    chatFooter.style.borderTop = '1px solid #ddd';
    chatFooter.style.display = 'flex';
  
    const chatInput = document.createElement('input');
    chatInput.type = 'text';
    chatInput.placeholder = 'Scrivi qui il tuo messaggio';
    chatInput.id = 'chatInput';
    chatInput.style.flex = '1';
    chatInput.style.padding = '8px';
    chatInput.style.border = '1px solid #ddd';
    chatInput.style.borderRadius = '20px';
    chatInput.style.outline = 'none';
  
    // Riconosce il tasto "Invio" per inviare il messaggio
    chatInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        sendMessage();
      }
    });
  
    chatFooter.appendChild(chatInput);
  
    const sendButton = document.createElement('button');
    sendButton.textContent = 'Invia';
    sendButton.style.backgroundColor = '#001f60';
    sendButton.style.color = '#ffffff';
    sendButton.style.border = 'none';
    sendButton.style.padding = '8px 12px';
    sendButton.style.marginLeft = '5px';
    sendButton.style.borderRadius = '20px';
    sendButton.style.cursor = 'pointer';
    sendButton.onclick = sendMessage;
  
    chatFooter.appendChild(sendButton);
    chatBox.appendChild(chatFooter);
  
    // Aggiunge la chat al body del documento
    document.body.appendChild(chatBox);
  
    // Funzione per inviare il messaggio
    async function sendMessage() {
      const message = chatInput.value.trim();
      if (message === '') return;
  
      // Mostra il messaggio dell'utente nella chat
      const messageElement = document.createElement('div');
      messageElement.className = 'chat-message';
      messageElement.innerHTML = `${message}<br><small>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>`;
      messageElement.style.marginBottom = '10px';
      messageElement.style.fontSize = '14px';
      messageElement.style.color = '#333';
      chatBody.appendChild(messageElement);
  
      chatInput.value = '';
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
  
        // Mostra la risposta del server nella chat
        const responseElement = document.createElement('div');
        responseElement.className = 'chat-message';
        responseElement.innerHTML = `${responseData.response}<br><small>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>`;
        responseElement.style.marginBottom = '10px';
        responseElement.style.fontSize = '14px';
        responseElement.style.color = '#001f60';
        responseElement.style.fontWeight = 'bold';
        chatBody.appendChild(responseElement);
        chatBody.scrollTop = chatBody.scrollHeight;
      } catch (error) {
        console.error('Errore durante la chiamata POST:', error);
      }
    }
  })();
  