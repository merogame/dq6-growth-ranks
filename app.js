const $=id=>document.getElementById(id),fmt=n=>n.toLocaleString('ja-JP');
const labels=['HP','MP','ちから','すばやさ','みのまもり','かしこさ','かっこよさ'];
const max=Math.max(...CHARACTERS.map(c=>c.rows.at(-1)[1]-c.rows[0][1]));
const events=[...new Set([0,...CHARACTERS.flatMap(c=>c.rows.map(r=>r[1]-c.rows[0][1]))])].sort((a,b)=>a-b);
let exp=0,stat=2,changes=[];
function rowAt(c,e){let lo=0,hi=c.rows.length;const target=c.rows[0][1]+e;while(lo<hi){let mid=(lo+hi)>>1;if(c.rows[mid][1]<=target)lo=mid+1;else hi=mid;}return c.rows[Math.max(0,lo-1)];}
function standings(e){const result=CHARACTERS.map((c,i)=>({c,i,row:rowAt(c,e)}));result.forEach(x=>x.rank=1+result.filter(y=>y.row[stat]>x.row[stat]).length);return result.sort((a,b)=>a.rank-b.rank||a.i-b.i);}
function rebuildChanges(){let last='';changes=events.filter(e=>{const sig=standings(e).sort((a,b)=>a.i-b.i).map(x=>x.rank).join(',');const changed=sig!==last;last=sig;return changed;});}
function setExp(value){exp=Math.min(max,Math.max(0,Math.floor(Number(value)||0)));render();}
function render(){
$('exp').value=exp;$('slider').value=exp;
$('ranking').setAttribute('aria-label',(stat===0?'レベル':labels[stat-2])+'の順位・追加経験値'+fmt(exp));
const shortLabels=['HP','MP','力','早','守','賢','美'];
const heading=(name,index,content)=>`<th scope="col" class="sortable ${stat===index?'active':''}" aria-sort="${stat===index?'descending':'none'}"><button type="button" data-stat="${index}" aria-pressed="${stat===index}" aria-label="${name}の高い順に並べ替え" title="${name}の高い順">${content}</button></th>`;
$('ranking').innerHTML=`<table><colgroup><col class="rank-col"><col class="name-col"><col class="level-col">${labels.map(()=>'<col class="ability-col">').join('')}</colgroup><thead><tr><th scope="col">順位</th><th scope="col">名前</th>${heading('レベル',0,'Lv')}${labels.map((name,i)=>heading(name,i+2,`<span class="full-label">${name}</span><span class="short-label">${shortLabels[i]}</span>`)).join('')}</tr></thead><tbody>${standings(exp).map(x=>`<tr><td class="place">${x.rank}</td><th scope="row" class="name">${x.c.name}</th><td class="level ${stat===0?'active':''}">${x.row[0]}</td>${x.row.slice(2).map((value,i)=>`<td class="${stat===i+2?'active':''}">${fmt(value)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
$('previous').disabled=!changes.some(e=>e<exp);$('next').disabled=!changes.some(e=>e>exp);
$('status').textContent=exp===0?'加入時':exp===max?'全員MAX':'＋'+fmt(exp)+' EXP';
}
$('exp').max=max;$('slider').max=max;
$('ranking').onclick=e=>{const button=e.target.closest('button[data-stat]');if(!button)return;stat=Number(button.dataset.stat);rebuildChanges();render();$('ranking').querySelector(`button[data-stat="${stat}"]`).focus({preventScroll:true});};
$('exp').oninput=e=>setExp(e.target.value);$('slider').oninput=e=>setExp(e.target.value);
$('reset').onclick=()=>setExp(0);$('maximum').onclick=()=>setExp(max);
$('previous').onclick=()=>setExp(changes.findLast(e=>e<exp)??0);$('next').onclick=()=>setExp(changes.find(e=>e>exp)??max);
$('about').onclick=()=>$('info').showModal();$('close').onclick=()=>$('info').close();
$('sources').innerHTML=CHARACTERS.map(c=>`<a href="${c.source}" target="_blank" rel="noopener noreferrer">${c.name}：Lv${c.rows[0][0]} / ${fmt(c.rows[0][1])} EXP ↗</a>`).join('');
rebuildChanges();render();
