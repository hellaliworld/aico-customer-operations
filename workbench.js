const $ = (s)=>document.querySelector(s);
const sampleCases = [
 {id:1,category:'Shipping',message:'Hi, I placed my order three days ago. When will it arrive?',policy:'Orders are usually dispatched within 2 business days. Delivery estimates depend on shipping method and destination.'},
 {id:2,category:'Returns',message:"The jacket doesn't fit. Can I return it?",policy:'Returns are accepted within 30 days of delivery if items are unworn and in original condition. Final-sale items are excluded.'},
 {id:3,category:'Product information',message:'Is this bottle dishwasher safe?',policy:'Product care details are listed on each product page. If not listed, support should confirm with the product team.'},
 {id:4,category:'Refund',message:"I returned my order two weeks ago and still don't have my money.",policy:'Refunds are reviewed after the return is received. Approved refunds are processed to the original payment method; processing time varies.'},
 {id:5,category:'Order change',message:'Please change the delivery address on my order.',policy:'Address changes may only be possible before fulfillment. Verify the order through the approved process.'},
 {id:6,category:'Complaint',message:"This is the third time I've emailed and nobody has replied.",policy:'Repeated contact or service-failure complaints should be prioritized for a human agent.'},
 {id:7,category:'Shipping',message:'Do you ship to Norway?',policy:'Shipping destinations depend on current shipping policy and checkout availability.'},
 {id:8,category:'Cancellation',message:'Cancel my order immediately.',policy:'Cancellation may only be possible before fulfillment. Verify order status; authorized staff must cancel.'},
 {id:9,category:'Discount',message:'Can you give me a 20% discount because I am a loyal customer?',policy:'Discounts are only offered when an active promotion or authorized exception applies.'},
 {id:10,category:'Damaged item',message:'The item arrived broken. What should I do?',policy:'Damaged-item claims require order details and evidence described in the store damage policy.'}
];
let cases = sampleCases.map(x=>CaseOpsEngine.analyze(x));
let selectedId=1;
let counter=11;
const statusKey='aico_workbench_cases_v1';
try { const saved=localStorage.getItem(statusKey); if(saved){const parsed=JSON.parse(saved); if(Array.isArray(parsed)&&parsed.length) cases=parsed;} } catch(e) {}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function persist(){try{localStorage.setItem(statusKey,JSON.stringify(cases));}catch(e){}}
function current(){return cases.find(c=>c.id===selectedId)||cases[0];}
function renderList(){
 const term=$('#search').value.toLowerCase(); const filter=$('#filter').value;
 const filtered=cases.filter(c=>(`${c.id} ${c.message} ${c.category}`).toLowerCase().includes(term)&&(filter==='all'||(filter==='high'&&c.priority==='High')||(filter==='review'&&c.humanReview)||(filter==='done'&&c.reviewStatus==='Reviewed')));
 $('#caseList').innerHTML=filtered.map(c=>`<button class="case ${c.id===selectedId?'active':''}" data-id="${c.id}"><div class="caseTop"><strong>#${c.id} · ${esc(c.category)}</strong><span class="pill ${c.priority.toLowerCase()}">${esc(c.priority)}</span></div><div class="caseMsg">${esc(c.message)}</div><div class="caseBottom"><span>${c.humanReview?'Human review':'Routine draft'}</span><span>${esc(c.reviewStatus||'Needs human review')}</span></div></button>`).join('')||'<p class="empty">No matching cases.</p>';
 $('#caseList').querySelectorAll('[data-id]').forEach(b=>b.addEventListener('click',()=>{selectedId=Number(b.dataset.id);render();}));
 $('#totalCount').textContent=cases.length; $('#highCount').textContent=cases.filter(c=>c.priority==='High').length; $('#reviewCount').textContent=cases.filter(c=>c.reviewStatus!=='Reviewed').length;
}
function renderDetail(){
 const c=current(); if(!c){$('#detail').innerHTML='<p>No cases yet.</p>';return;}
 $('#detail').innerHTML=`<div class="detailHeader"><div><span class="eyebrow">CASE ${c.id}</span><h2>${esc(c.category||'Unclassified')}</h2></div><span class="pill ${c.priority.toLowerCase()}">${esc(c.priority)}</span></div>
 <label>Customer message <textarea id="message" rows="3">${esc(c.message)}</textarea></label>
 <label>Store policy / approved facts <textarea id="policy" rows="4">${esc(c.policy)}</textarea></label>
 <div class="analysis"><strong>Review flags</strong><p>${esc(c.reason||'')}${c.humanReview?' · Human approval required.':' · Check policy before use.'}</p></div>
 <label>Suggested response — draft only <textarea id="response" rows="5">${esc(c.response||'')}</textarea></label>
 <div class="actions"><button id="regenerate" class="secondary">Refresh draft</button><button id="copyPrompt" class="secondary">Copy AI review prompt</button><button id="markReviewed" class="primary">Mark reviewed</button></div>
 <p class="micro">No message is sent to a customer. Saving is local to this browser only.</p>`;
 $('#regenerate').onclick=()=>{const item={...c,message:$('#message').value,policy:$('#policy').value};const fresh=CaseOpsEngine.analyze(item);Object.assign(c,fresh,{response: fresh.response, reviewStatus:'Needs human review'});persist();render();};
 $('#copyPrompt').onclick=async()=>{const text=`You are assisting an ecommerce support analyst. Do not send anything. Use only the store policy below; do not invent order status, timings, discounts, refunds, or actions. If the case needs account lookup or a consequential decision, flag human review. Return category, priority, risk flags, one concise draft reply, and what must be verified.\n\nCUSTOMER MESSAGE:\n${$('#message').value}\n\nSTORE POLICY:\n${$('#policy').value}\n\nCURRENT DRAFT:\n${$('#response').value}`;try{await navigator.clipboard.writeText(text);alert('Prompt copied. Review it before pasting into your AI tool.');}catch(e){window.prompt('Copy this prompt',text);}};
 $('#markReviewed').onclick=()=>{c.message=$('#message').value;c.policy=$('#policy').value;c.response=$('#response').value;c.reviewStatus='Reviewed';c.humanReview=true;c.reviewedAt=new Date().toISOString();persist();render();};
}
function render(){renderList();renderDetail();}
function exportCSV(){const headers=['id','category','priority','humanReview','reviewStatus','message','policy','response','reason'];const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const csv=[headers.join(','),...cases.map(c=>headers.map(h=>quote(c[h])).join(','))].join('\r\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='aico-case-review.csv';a.click();URL.revokeObjectURL(a.href);}
$('#search').addEventListener('input',renderList); $('#filter').addEventListener('change',renderList); $('#export').onclick=exportCSV;
$('#addCase').onclick=()=>{const m=prompt('Paste a fictional or properly anonymized customer message:');if(!m)return;const p=prompt('Paste the store policy or facts relevant to this message:');if(p===null)return;const item=CaseOpsEngine.analyze({id:counter++,category:'',message:m,policy:p});cases.unshift(item);selectedId=item.id;persist();render();};
$('#reset').onclick=()=>{if(!confirm('Reset to the 10 fictional demo cases? This removes local edits.'))return;cases=sampleCases.map(x=>CaseOpsEngine.analyze(x));counter=11;selectedId=1;persist();render();};
render();
