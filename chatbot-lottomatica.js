
import { OpenAI } from 'openai';
import fs from 'fs';

export const openai = new OpenAI({
  apiKey: "chiave inserita qui"//process.env.OPENAI_API_KEY
});

export class lottomaticaChatbot {
  assistantId;

  constructor() {
    this.createAssistant();
  }

  //Creazione Thread
  async createThread() {
    console.log("Nuovo thread");
    const thread = await openai.beta.threads.create();
    return thread;
  }

  //Creazione Messaggio
  async addMessage(threadId, message) {
    console.log("nuovo messaggio thread: " + threadId);
    const response = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });
    return response;
  }

  // Avvio Assistente
  async runAssistant(threadId) {
    console.log("avvio assistente per thread: " + threadId);
    const response = await openai.beta.threads.runs.create(threadId, {
      assistant_id: this.assistantId,
    });
    return response;
  }

  // Lista dei messaggi
  async messageList(threadId, runId) {
    return await openai.beta.threads.messages.list(threadId);
  }

  // Attendere le risposte
  async retriveResponse(threadId, runId) {
    return await openai.beta.threads.runs.retrieve(threadId, runId);
  }

  //Creazione Assistente
  async createAssistant() {
    try {
      // prendo la lista dei file esistenti
      const list = await openai.files.list();
      const file = (list.data.length > 0) ? list.data[0] : await openai.files.create({
        file: fs.createReadStream("data/faq.json")
      });

      console.log("File creato:", file);

      // Controlliamo che l'assistente non esista già
      const checkExistAssistants = await openai.beta.assistants.list();
      let assistant = checkExistAssistants.data.find(
        (as) => as.name === "FAQ AI Lottomatica"
      );

      // Se non lo trova, lo creiamo
      if (!assistant) {
        assistant = await openai.beta.assistants.create({
          name: "FAQ AI Lottomatica",
          instructions:
            `FAQ AI Lottomatica è in grado di rispondere alle domande degli utenti solo cercando all'interno della sua knowledge. 
          Usa un linguaggio professionale ma coinvolgente. Cerca di essere il più dettagliato possibile. 
          Evita tecnicismi e rendi il contenuto facilmente comprensibile. Il tono deve essere amichevole, ispirazionale e pratico. 
          Se non riesci a risolvere il problema del cliente, invia le informazioni per contattare il call center Lottomatica che puoi trovare in guida/contatti, mail, telefono ed orari`,
          model: "gpt-3.5-turbo",
          tools: [{ type: "code_interpreter" }],
          //file_ids: [file.id],
        });

        console.log("Assistente creato:", assistant);
      }
      this.assistantId = assistant.id;
      return assistant;
    }
    catch (error) {
      console.error("Errore nella creazione:", error);
    }
  }
}

