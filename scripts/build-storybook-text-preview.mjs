// Local verification of the real staged text editor and reader, without generation calls.
import {build} from "esbuild";
import {mkdir,copyFile,writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const out=path.join(root,"output/storybooks/text-editing-check");
await mkdir(path.join(out,"landing"),{recursive:true});
await copyFile(path.join(root,"app/globals.css"),path.join(out,"style.css"));
await copyFile(path.join(root,"public/landing/charpai-back-cover-logo.png"),path.join(out,"landing/charpai-back-cover-logo.png"));
const entry=`import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {StorybookEditor} from ${JSON.stringify(path.join(root,"components/storybook-editor"))};
import {emptyDraft} from ${JSON.stringify(path.join(root,"lib/storybook"))};
import {applyStoryText} from ${JSON.stringify(path.join(root,"lib/storybook-text"))};
function Preview(){const [story,setStory]=useState({...emptyDraft(),title:'A book of family memories',subtitle:'Fictional story · Local check',coverSubtitle:'Our family',dedication:'For everyone who remembers',closingNote:'These memories belong to all of us.',sections:[{id:'home',heading:'Our first home',body:'We lived near the school. Every morning we walked there together.\\n\\nI remember the voices in the courtyard and the stories we shared.'},{id:'school',heading:'School days',body:'మా పాఠశాల జ్ఞాపకాలు. We learned together, and those memories stayed with us.'}]}),[saved,setSaved]=useState(false);
return <main className="folio-public-shell"><header className="folio-public-header"><span>Charpai · Local text editing check</span></header><section className="book-workbench" aria-label="Editable storybook"><div className="editor-toolbar"><h2>{story.title}</h2></div><div className="storybook-page"><StorybookEditor draft={story} onRegenerate={edited=>{setStory(current=>applyStoryText(current,edited));setSaved(false);}} onSave={async()=>setSaved(true)} disabled={new URLSearchParams(location.search).has('disabled')} allowExport storyUrl={location.origin+'/sample-story'}/></div><p role="status">{saved?'Saved in this local preview.':''}</p><details className="transcript-panel"><summary>Original transcript</summary><p>Fictional source text remains private and unchanged.</p></details></section></main>;}
createRoot(document.getElementById('root')).render(<Preview/>);`;
await build({stdin:{contents:entry,resolveDir:root,sourcefile:"text-check.tsx",loader:"tsx"},outfile:path.join(out,"preview.js"),bundle:true,platform:"browser",format:"esm",jsx:"automatic",tsconfig:path.join(root,"tsconfig.json"),define:{"process.env.NODE_ENV":'"production"'},minify:true});
await writeFile(path.join(out,"index.html"),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Text editing — Charpai local check</title><link rel="stylesheet" href="./style.css"></head><body><div id="root"></div><script type="module" src="./preview.js"></script></body></html>');
console.log(out);
