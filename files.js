export const files = {
  "index.js": {
    file: {
      contents: `import express from 'express'

const app = express();
const port=3111;

app.get('/',(req,res)=>{
    res.send('Welcome to WebContainers app! 🥳');
})

app.listen(port,()=>{
    console.log(\`App is live at http://localhost:\${port}\`)
})
            `,
    },
  },
  "package.json": {
    file: {
      contents: `
            {
                "name": "server",
                "type": "module",
                "version": "1.0.0",
                "description": "",
                "main": "index.js",
                "scripts": {
                  "start":"nodemon --watch './' index.js"
                },
                "keywords": [],
                "author": "",
                "license": "ISC",
                "dependencies": {
                  "express": "^4.18.2",
                  "nodemon": "^2.0.21"
                }
              }
              
            `,
    },
  },
};
