const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'EMPIRE0550';
const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const UPLOADS = path.join(ROOT, 'uploads');
fs.mkdirSync(DATA, {recursive:true});
fs.mkdirSync(UPLOADS, {recursive:true});
const postsFile = path.join(DATA, 'posts.json');
const settingsFile = path.join(DATA, 'settings.json');
if (!fs.existsSync(postsFile)) fs.writeFileSync(postsFile, '[]');
if (!fs.existsSync(settingsFile)) fs.writeFileSync(settingsFile, JSON.stringify({siteName:'BIGGEST EMPIRE',whatsappGroupUrl:'',wallpaper:'/assets/efootball_wallpaper.mp4'}, null, 2));

const upload = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, UPLOADS),
    filename: (_, file, cb) => cb(null, Date.now() + '-' + crypto.randomBytes(5).toString('hex') + path.extname(file.originalname).toLowerCase())
  }),
  limits: { fileSize: 120 * 1024 * 1024 }
});
app.use(express.json({limit:'2mb'}));
app.use(express.urlencoded({extended:true, limit:'2mb'}));
app.use(express.static(path.join(ROOT,'public')));
app.use('/uploads', express.static(UPLOADS));

const readJson = f => JSON.parse(fs.readFileSync(f,'utf8'));
const writeJson = (f,d) => fs.writeFileSync(f, JSON.stringify(d,null,2));
const sessions = new Map();
function auth(req,res,next){
  const token = req.headers.authorization?.replace(/^Bearer\s+/,'');
  if(!token || !sessions.has(token)) return res.status(401).json({error:'Unauthorized'});
  next();
}

app.get('/api/feed', (req,res)=>res.json({posts:readJson(postsFile),settings:readJson(settingsFile)}));
app.post('/api/admin/login',(req,res)=>{
  if(req.body.password !== ADMIN_PASSWORD) return res.status(401).json({error:'Invalid password'});
  const token = crypto.randomBytes(24).toString('hex'); sessions.set(token, Date.now());
  setTimeout(()=>sessions.delete(token), 8*60*60*1000);
  res.json({token});
});
app.post('/api/admin/post', auth, upload.fields([{name:'image',maxCount:1},{name:'video',maxCount:1}]), (req,res)=>{
  const posts = readJson(postsFile);
  const files = req.files || {};
  const image = files.image?.[0] ? '/uploads/'+files.image[0].filename : '';
  const video = files.video?.[0] ? '/uploads/'+files.video[0].filename : '';
  const post = {id:crypto.randomUUID(), title:req.body.title||'Empire Update', body:req.body.body||'', type:req.body.type||'announcement', image, video, createdAt:new Date().toISOString()};
  posts.unshift(post); writeJson(postsFile,posts.slice(0,300)); res.json(post);
});
app.delete('/api/admin/post/:id', auth, (req,res)=>{
  const posts=readJson(postsFile); const p=posts.find(x=>x.id===req.params.id); if(!p) return res.sendStatus(404);
  for(const u of [p.image,p.video]) if(u && u.startsWith('/uploads/')) {const f=path.join(UPLOADS,path.basename(u)); if(fs.existsSync(f)) fs.unlinkSync(f);}
  writeJson(postsFile,posts.filter(x=>x.id!==req.params.id)); res.json({ok:true});
});
app.post('/api/admin/settings', auth, (req,res)=>{
  const s=readJson(settingsFile); const next={...s, ...req.body}; writeJson(settingsFile,next); res.json(next);
});
app.post('/api/admin/wallpaper', auth, upload.single('video'), (req,res)=>{
  if(!req.file) return res.status(400).json({error:'Video required'});
  const settings=readJson(settingsFile); settings.wallpaper='/uploads/'+req.file.filename; writeJson(settingsFile,settings); res.json(settings);
});
app.get('*', (req,res)=>res.sendFile(path.join(ROOT,'public','index.html')));
app.listen(PORT,()=>console.log(`BIGGEST EMPIRE LIVE running on http://localhost:${PORT}`));
