const REPO = 'Yolo9203/Rekap-Cams-Web'
const DATA_URL = `https://raw.githubusercontent.com/${REPO}/main/data/`

const SHEET_LIST = [
  { file: 'BAPP.json', name: 'BAPP' },
  { file: 'Kontanan.json', name: 'Kontanan' },
  { file: 'rekrut.json', name: 'Rekrut' },
  { file: 'Perdin_RO.json', name: 'Perdin RO' },
  { file: 'email_CDP.json', name: 'CDP General' },
  { file: 'CS.json', name: 'CS RO' },
  { file: 'COLA.json', name: 'Plasma Mandiri' },
]

const HEADER_MAP = {
  'KET': 'Deskripsi',
  'KEBUN': 'Est Pengirim',
  'NILAI': 'Nilai',
  'NAMA REK': 'Nama Rekening Penerima',
  'BANK': 'Bank Penerima',
  'NO REK': 'No Rek Penerima',
  'Qlola': 'Trx Qlola',
  'Lunas': 'Tgl Bayar',
}

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const path = url.pathname

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors })
    }

    try {
      if (path === '/' || path === '/index.html') {
        return new Response(HTML, { headers: { 'Content-Type': 'text/html;charset=utf-8', ...cors } })
      }

      if (path === '/api/sheets') {
        const sheets = SHEET_LIST.map(s => ({ name: s.name, file: s.file }))
        return new Response(JSON.stringify(sheets), { headers: { 'Content-Type': 'application/json', ...cors } })
      }

      if (path === '/api/sheet') {
        const file = url.searchParams.get('file')
        if (!file) return new Response('{"error":"file required"}', { status: 400, headers: { 'Content-Type': 'application/json', ...cors } })
        const resp = await fetch(DATA_URL + file)
        if (!resp.ok) return new Response('{"error":"not found"}', { status: 404, headers: { 'Content-Type': 'application/json', ...cors } })
        const data = await resp.json()
        return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', ...cors } })
      }

      return new Response('{"error":"not found"}', { status: 404, headers: { 'Content-Type': 'application/json', ...cors } })
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...cors } })
    }
  }
}

const HTML = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rekap CAMS - EHP</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Segoe UI,Arial;background:#eef1f5;color:#2c3e50}
.top{background:#c0392b;color:#fff;padding:15px 20px;text-align:center}
.top h1{font-size:20px;margin-bottom:4px}
.top p{font-size:13px;opacity:.9}
.container{max-width:100%;margin:20px auto;padding:0 15px}
.card{background:#fff;border-radius:8px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.08);margin-bottom:15px}
.card h2{color:#c0392b;margin-bottom:12px;font-size:16px}
.sheets{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
.sheet-btn{background:#2c3e50;color:#fff;border:none;padding:14px;border-radius:6px;cursor:pointer;font-size:14px;text-align:left;transition:.2s}
.sheet-btn:hover{background:#34495e;transform:translateY(-2px)}
.back{background:#95a5a6;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;margin-bottom:12px;font-size:13px}
.back:hover{background:#7f8c8d}
table{width:100%;border-collapse:collapse;font-size:12px;min-width:1600px}
th,td{padding:10px 12px;border:1px solid #ddd;text-align:left;white-space:nowrap}
th{background:#2c3e50;color:#fff;position:sticky;top:0}
tr:nth-child(even){background:#f8f9fa}
tr:hover{background:#e8f4f8}
.null{color:#bbb}
.loading{text-align:center;padding:40px;color:#7f8c8d}
</style>
</head>
<body>
<div class="top">
<h1>Rekap CAMS</h1>
<p>Eagle High Plantations - Banjarbaru</p>
</div>
<div class="container">
  <div id="view">
    <div class="card">
      <h2>Selamat Datang</h2>
      <p style="color:#666;margin-bottom:15px">Pilih sheet di bawah untuk menampilkan data.</p>
      <div id="sheets" class="sheets"><div class="loading">Memuat daftar sheet...</div></div>
    </div>
  </div>
</div>
<script>
const HM = {'KET':'Deskripsi','KEBUN':'Est Pengirim','NILAI':'Nilai','NAMA REK':'Nama Rekening Penerima','BANK':'Bank Penerima','NO REK':'No Rek Penerima','Qlola':'Trx Qlola','Lunas':'Tgl Bayar'};
async function loadSheets(){
  const res=await fetch('/api/sheets');
  const sheets=await res.json();
  const el=document.getElementById('sheets');
  el.innerHTML=sheets.map(s=>'<button class="sheet-btn" onclick="loadSheet(\\''+s.file+'\\')">'+s.name+'</button>').join('');
}
async function loadSheet(file){
  const view=document.getElementById('view');
  view.innerHTML='<div class="card"><div class="loading">Memuat data...</div></div>';
  const res=await fetch('/api/sheet?file='+encodeURIComponent(file));
  const json=await res.json();
  if(json.error){view.innerHTML='<div class="card"><p style="color:red">Error: '+json.error+'</p></div>';return;}
  const headers=json.headers||[];
  const data=json.data||[];
  if(!data.length){view.innerHTML='<div class="card"><p>Tidak ada data.</p></div>';return;}
  let html='<div class="card"><button class="back" onclick="loadSheets()">&larr; Kembali</button><h2>'+json.sheet+'</h2><div style="overflow-x:auto"><table><thead><tr>';
  headers.forEach(h=>{html+='<th>'+(HM[h]||h)+'</th>';});
  html+='</tr></thead><tbody>';
  data.forEach(row=>{
    html+='<tr>';
    validCols.forEach(v => { const c=row[v.i]; html+='<td>'+(c!==''&&c!==null&&c!==undefined?c:'<span class="null">-</span>')+'</td>'; });
    html+='</tr>';
  });
  html+='</tbody></table></div></div>';
  view.innerHTML=html;
}
loadSheets();
</script>
</body>
</html>`
