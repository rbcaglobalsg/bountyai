import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(apiUrl)
  .then(res => res.json())
  .then(data => {
      console.log("Supported Models:");
      if (data.models) {
          data.models.forEach((m: any) => console.log(m.name));
      } else {
          console.log(data);
      }
  })
  .catch(err => console.error(err));
