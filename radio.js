/* NO SIGNAL RADIO: curated thematic paths through the existing 60-album catalogue. */
const NO_SIGNAL_RADIO_STATIONS = [
 {id:'after-hours',tag:'TRANSMISSION 01',symbol:'⌁',title:'NYC AFTER MIDNIGHT',short:'Concrete at 02:17',desc:'Dust, paranoia, streetlights. New York after the last train.',note:'Когда город пустеет, биты становятся громче. Тёмные улицы, кинематографичный сэмплинг и голоса без лишнего света.',albums:['route-16','route-20','route-21','route-22','route-23','route-14','route-25']},
 {id:'dusty-crates',tag:'TRANSMISSION 02',symbol:'◌',title:'DUSTY CRATES CLUB',short:'Jazz stains / warm drums',desc:'Jazz fragments, soul loops and drums with fingerprints.',note:'Негладкий соул, джазовые обрывки и продакшен, который хочется разбирать на слои. Не фоновая музыка — материал для внимательного слуха.',albums:['route-10','route-06','route-07','route-15','route-42','route-44','route-52','route-54']},
 {id:'low-end',tag:'TRANSMISSION 03',symbol:'↯',title:'LOW END THEORY',short:'Sub bass / southern heat',desc:'Slow synths, trunk rattles and regional dialects.',note:'Другая география меняет всё: низкие синтезаторы, липкий бас, психоделия Юга и западное побережье со своим собственным временем.',albums:['route-11','route-28','route-29','route-30','route-31','route-34','route-35','route-37']},
 {id:'broken-circuits',tag:'TRANSMISSION 04',symbol:'⌬',title:'BROKEN CIRCUITS',short:'Rap from another planet',desc:'Uneven grids, alien voices, beats outside the blueprint.',note:'Когда рэп разбирает собственную форму: странные персонажи, деформированные петли, футуристические города и намеренно неудобные ритмы.',albums:['route-39','route-43','route-45','route-46','route-47','route-48','route-56','route-58']},
 {id:'words',tag:'TRANSMISSION 05',symbol:'✳',title:'WORDS AS WEAPONS',short:'Memory / protest / pressure',desc:'Political urgency, personal testimony and hard questions.',note:'Пластинки, которые не позволяют отвести взгляд: медиа, район, память, власть и личная ответственность — без лозунгов вместо музыки.',albums:['route-03','route-09','route-16','route-32','route-41','route-42','route-55','route-60']},
 {id:'independent',tag:'TRANSMISSION 06',symbol:'⟁',title:'OFF THE GRID',short:'Independent frequencies',desc:'Leftfield classics from the margins of the map.',note:'Независимая сцена как лаборатория: автономные голоса, домашние миры, необычные конструкции и свобода не объяснять себя рынку.',albums:['route-40','route-43','route-44','route-45','route-47','route-48','route-49','route-53','route-57','route-59','route-60']}
];
(function(){
 const allStations=()=>NO_SIGNAL_RADIO_STATIONS;
 function getStation(){if(!state.radioRoute||!allStations().some(s=>s.id===state.radioRoute))state.radioRoute='after-hours';return allStations().find(s=>s.id===state.radioRoute)||allStations()[0]}
 function getAlbums(station){return station.albums.map(id=>albums[id]?{id,...albums[id]}:null).filter(Boolean)}
 function currentIndex(station,queue){if(!queue.length)return 0;const n=Number(state.radioIndex)||0;return Math.max(0,Math.min(queue.length-1,n))}
 function stationCard(station,index,active){
  const count=getAlbums(station).length;
  return '<button class="radio-station radio-station--'+esc(station.id)+(active?' active':'')+'" data-radio-select="'+esc(station.id)+'" aria-pressed="'+active+'">'+
   '<span class="radio-station-index">'+esc(station.tag)+' / 0'+(index+1)+'</span>'+
   '<span class="radio-station-symbol" aria-hidden="true">'+esc(station.symbol)+'</span>'+
   '<span class="radio-station-title">'+esc(station.title)+'</span>'+
   '<span class="radio-station-desc">'+esc(station.desc)+'</span>'+
   '<span class="radio-station-bottom"><span>'+count+' RECORDS</span><span class="radio-station-arrow">↗</span></span></button>';
 }
 function render(){
  const station=getStation(),queue=getAlbums(station),idx=currentIndex(station,queue),current=queue[idx];
  const bars=Array.from({length:25},(_,i)=>'<i style="--h:'+((i*17+29)%78+17)+'%;--d:'+(0.42+(i%7)*0.13)+'s"></i>').join('');
  const queueHtml=queue.map((a,i)=>'<div class="radio-queue-row '+(i===idx?'current':'')+'"><span class="radio-queue-no">'+String(i+1).padStart(2,'0')+'</span><button class="radio-queue-open" data-radio-open="'+esc(a.id)+'" aria-label="Открыть выпуск '+esc(a.artist+' — '+a.title)+'"><span class="radio-queue-title">'+esc(a.title)+'</span><span class="radio-queue-artist">'+esc(a.artist)+' · '+esc(a.year)+'</span></button><span class="radio-queue-chip">'+(i===idx?'ON AIR':'TRACK '+String(i+1).padStart(2,'0'))+'</span></div>').join('');
  return '<div class="radio-page">'+
   '<div class="radio-kicker"><span class="radio-pulse"></span> независимые частоты / эфир открыт</div>'+
   '<section class="radio-hero" aria-labelledby="radio-main-title"><div class="radio-hero-top"><span>NO SIGNAL RADIO / 88.6 FM</span><span class="radio-live">● LIVE SELECTOR</span></div>'+
   '<h1 class="radio-title" id="radio-main-title">FIND YOUR <span>FREQUENCY</span></h1>'+
   '<p class="radio-lede">Не бесконечная лента и не алгоритм по настроению. Шесть тематических маршрутов через альбомы NO SIGNAL — с собственным ритмом, странными стыками и свободой свернуть с основной дороги.</p>'+
   '<div class="radio-actions"><button class="btn radio-btn-acid" data-radio-shuffle>↯ ПОЙМАТЬ СЛУЧАЙНЫЙ СИГНАЛ</button><button class="btn radio-btn-outline" data-radio-copy>⎘ КОПИРОВАТЬ ТРЕКЛИСТ</button></div>'+
   '<div style="display:flex;align-items:end;justify-content:space-between;gap:14px;margin-top:27px"><span class="radio-kicker">TUNE IN / TUNE OUT</span><span class="radio-spectrum" aria-hidden="true">'+bars+'</span></div></section>'+
   '<div class="radio-section-head"><div><div class="eyebrow">Choose a transmission</div><h2>ШЕСТЬ ВХОДОВ<br>В ДРУГОЙ МИР</h2></div><span class="radio-count">06 CHANNELS<br>60 ALBUMS / MAIN ROUTE</span></div>'+
   '<div class="radio-grid">'+allStations().map((s,i)=>stationCard(s,i,s.id===station.id)).join('')+'</div>'+
   '<section class="radio-tuned" aria-label="Выбранный музыкальный маршрут"><div class="radio-tuned-head"><div><div class="radio-tuned-label">СЕЙЧАС НА ЧАСТОТЕ / '+esc(station.tag)+'</div><h2>'+esc(station.title)+'</h2><p class="radio-tuned-copy">'+esc(station.note)+'</p></div><div class="radio-tuned-meta">SIGNAL<br>LOCKED<br><span style="color:#d7ff42">'+String(idx+1).padStart(2,'0')+' / '+String(queue.length).padStart(2,'0')+'</span></div></div>'+
   (current?'<div class="radio-now"><div class="radio-now-number">'+String(idx+1).padStart(2,'0')+'</div><div><div class="radio-now-label">CURRENT RECORD / '+esc(current.year)+'</div><h3 class="radio-now-title">'+esc(current.title)+'</h3><div class="radio-now-artist">'+esc(current.artist)+'</div></div></div>'+
   '<div class="radio-transport"><button class="btn" data-radio-prev '+(idx===0?'disabled':'')+'>← НАЗАД</button><button class="btn radio-btn-acid" data-radio-next>'+ (idx===queue.length-1?'↻ В НАЧАЛО':'СЛЕДУЮЩИЙ →')+'</button><a class="btn radio-btn-outline" href="'+esc(current.spotify)+'" target="_blank" rel="noopener noreferrer">СЛУШАТЬ ↗</a></div>':'')+
   '<div class="radio-queue">'+queueHtml+'</div></section>'+
   '<p class="radio-footnote">NO SIGNAL RADIO — тематические подборки из каталога журнала. Открытие альбома ведёт к редакционному выпуску; «Слушать» открывает поиск альбома в Spotify. Никакого автоплея и фонового звука.</p>'+
   '</div>';
 }
 function attach(){
  document.querySelectorAll('[data-radio-select]').forEach(b=>b.addEventListener('click',()=>{state.radioRoute=b.dataset.radioSelect;state.radioIndex=0;render();document.querySelector('.radio-tuned')?.scrollIntoView({behavior:'smooth',block:'start'})}));
  document.querySelectorAll('[data-radio-open]').forEach(b=>b.addEventListener('click',()=>go('article',b.dataset.radioOpen)));
  document.querySelectorAll('[data-radio-next]').forEach(b=>b.addEventListener('click',()=>{const st=getStation(),q=getAlbums(st);state.radioIndex=q.length?(currentIndex(st,q)+1)%q.length:0;render();document.querySelector('.radio-tuned')?.scrollIntoView({behavior:'smooth',block:'nearest'})}));
  document.querySelectorAll('[data-radio-prev]').forEach(b=>b.addEventListener('click',()=>{const st=getStation(),q=getAlbums(st);state.radioIndex=Math.max(0,currentIndex(st,q)-1);render();document.querySelector('.radio-tuned')?.scrollIntoView({behavior:'smooth',block:'nearest'})}));
  document.querySelectorAll('[data-radio-shuffle]').forEach(b=>b.addEventListener('click',()=>{const st=allStations()[Math.floor(Math.random()*allStations().length)];const q=getAlbums(st);state.radioRoute=st.id;state.radioIndex=Math.floor(Math.random()*Math.max(q.length,1));render();document.querySelector('.radio-tuned')?.scrollIntoView({behavior:'smooth',block:'start'})}));
  document.querySelectorAll('[data-radio-copy]').forEach(b=>b.addEventListener('click',async()=>{const st=getStation(),q=getAlbums(st),txt=st.title+'\n'+q.map((a,i)=>(i+1)+'. '+a.artist+' — '+a.title+' ('+a.year+')').join('\n');try{await navigator.clipboard.writeText(txt);toast('Треклист скопирован')}catch(e){const field=document.createElement('textarea');field.value=txt;field.style.position='fixed';field.style.opacity='0';document.body.appendChild(field);field.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}field.remove();toast(ok?'Треклист скопирован':'Не удалось скопировать треклист')}}));
 }
 window.NoSignalRadio={render,attach,stations:allStations};
})();