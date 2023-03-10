import { WebContainer } from "@webcontainer/api";
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { files } from "./files";
import "./style.css";


let webcontainerInstance;

window.addEventListener("load", async () => {
  const textareaEl = document.querySelector("textarea");
  const terminalEl = document.querySelector('.terminal');
  const iframeEl = document.querySelector("iframe");

  textareaEl.value = files['index.js'].file.contents;
  textareaEl.addEventListener("input",(e)=>{
    writeIndexJS(e.currentTarget.value)
  })

  const fitAddon = new FitAddon();

  const terminal =new Terminal({
    convertEol:true
  })

  terminal.loadAddon(fitAddon);
  terminal.open(terminalEl);

  fitAddon.fit();


  // call only once
  webcontainerInstance = await WebContainer.boot();
  await webcontainerInstance.mount(files);


  // const exitCode = await installDependecies(terminal);
  // if(exitCode !==0){
  //    throw new Error('Installation failed')
  // }

  // startDevServer(terminal)



  // Wait for `server-ready` event
  webcontainerInstance.on('server-ready',(port,url)=>{
    console.log('server ready ',port,url)
    iframeEl.src=url
  })

  const shellProcess= await startShell(terminal)
  window.addEventListener('resize',()=>{
    fitAddon.fit();
    shellProcess.resize({
      cols:terminal.cols,
      rows:terminal.rows
    })
  })
});


async function startShell(terminal){
  const shellProcess = await webcontainerInstance.spawn('jsh',{
    terminal:{
      cols:terminal.cols,
      rows:terminal.rows
    }
  });
  shellProcess.output.pipeTo(new WritableStream({
    write(data){
      terminal.write(data)
    }
  }))

  const input = shellProcess.input.getWriter();
  terminal.onData((data)=>{
    input.write(data)
  })


  return shellProcess
}

async function installDependecies(terminal) {
  // Install dependencies
  const installProcess = await webcontainerInstance.spawn("npm", ["install"]);

  installProcess.output.pipeTo(new WritableStream({
    write(data){
      terminal.write(data);
    }
  }))

  // Wait for install command to exit
  return installProcess.exit;
}

async function startDevServer(terminal){
  const iframeEl = document.querySelector("iframe");
  // Run `npm run start` to start the Express app
  const serverProcess = await webcontainerInstance.spawn('npm',['run','start'])
  
  serverProcess.output.pipeTo(new WritableStream({
    write(data){
      terminal.write(data)
    }
  }))
  // Wait for `server-ready` event
  webcontainerInstance.on('server-ready',(port,url)=>{
    iframeEl.src=url
  })
}

async function writeIndexJS(content){
  await webcontainerInstance.fs.writeFile('/index.js',content)
}

document.querySelector("#app").innerHTML = `
<div class="container">
  <div class="editor">
    <textarea>I am a textarea</textarea>
  </div>
  <div class="preview">
    <iframe src="loading.html"></iframe>
  </div>
</div>
<div class="terminal"></div>
`;
