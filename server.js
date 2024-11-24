import express from "express";
import { lottomaticaChatbot } from "./chatbot-lottomatica.js";


const app = express();
app.use(express.json());
app.use(express.static('static'));
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  });

// const allowedOrigins = ['www.lottomatica.it', 'lottomatica.it'];
// app.use(cors({
//     origin: function(origin, callback){
//       if (!origin) {
//         return callback(null, true);
//       }
  
//       if (allowedOrigins.includes(origin)) {
//         const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     }
  
//   }));

const ltmChat = new lottomaticaChatbot();

/*-------------
 ROTTE API
---------------*/
// Nuovo thread
app.get("/thread", async (req, res) => {
    const thread = await ltmChat.createThread(); 
    res.json({ threadId: thread.id });    
});

// Nuovo messaggio
app.post("/message", async (req, res) => {
    try {
        let userMessage = req.body.message;
        let threadId= req.body.threadId;

        if (userMessage?.length == 0) {
            return res.status(400).json({ error: "Il messaggio è obbligatorio" });
        }

        const msgResponse = await ltmChat.addMessage(threadId, userMessage);

        const runResponse = await ltmChat.runAssistant(threadId);

        let run = await ltmChat.retriveResponse(threadId, runResponse.id);   
        while (run.status !== "completed") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            run = await ltmChat.retriveResponse(threadId, runResponse.id);           
        }

        
        let messagesResponse = await ltmChat.messageList(threadId, runResponse.id);
        let messages = [];
        messagesResponse.body.data.forEach((message) => {
            messages.push(message.content);
        });
        const response = messages[0]?.filter(contentItem => contentItem.type === 'text').map(textContent => textContent.text.value).join('\n');

        res.json({ response });

    } catch (error) {
        console.error("Error processing chat:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Avvio server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});