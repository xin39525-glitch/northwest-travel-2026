(() => {
 'use strict';
 const next=document.getElementById('countdown');
 const milestones=[
 ['2026-10-01T07:16:00+08:00','樊鑫锋从深圳北出发','G6256 · 深圳北至广州南'],
 ['2026-10-01T09:49:00+08:00','樊鑫锋乘高铁去兰州','G404 · 广州南至兰州西'],
 ['2026-10-01T19:49:00+08:00','樊鑫锋抵达兰州西','欧雪莲已在兰州 · 准备会合'],
 ['2026-10-02T18:30:00+08:00','两人一起，从兰州出发','Z6201 · 09 车 11 / 12 号下铺'],
 ['2026-10-03T06:35:00+08:00','一起抵达敦煌','今天在敦煌玩一天'],
 ['2026-10-04T07:30:00+08:00','敦煌至格尔木一日游','参考接送时间 · 接人地点需核对'],
 ['2026-10-05T07:00:00+08:00','格尔木跟团一日游','参考接送时间 · 巍澜大酒店上车'],
 ['2026-10-05T23:46:00+08:00','乘夜卧前往西宁','Z9820 · 格尔木站出发'],
 ['2026-10-06T06:11:00+08:00','抵达西宁，上午看动物','动物园往返交通及游览时间待补充'],
 ['2026-10-06T13:40:00+08:00','从西宁乘车回兰州','D2694 · 西宁站出发'],
 ['2026-10-08T14:00:00+08:00','兰州酒店退房截止','如家·neo · 后续安排待补充']];
 function tick(){
  if(!next)return;
  const n=milestones.find(x=>new Date(x[0]).getTime()>Date.now());
  if(!n){document.getElementById('next-title').textContent='这一程，留作回忆';document.getElementById('next-detail').textContent='资料覆盖至 10 月 8 日 · 后续待补充';next.innerHTML='<small>OUR JOURNEY</small><strong>一起走过</strong>';return;}
  const diff=new Date(n[0]).getTime()-Date.now(),d=Math.floor(diff/86400000),h=Math.floor(diff/3600000)%24,m=Math.floor(diff/60000)%60;
  document.getElementById('next-title').textContent=n[1];
  document.getElementById('next-detail').textContent=n[0].slice(5,16).replace('T',' ').replace('-','.')+' · '+n[2];
  next.innerHTML=`<small>距离下一项行程</small><strong>${d}<em>天</em>${h}<em>时</em>${m}<em>分</em></strong>`;
 }
 tick();setInterval(tick,60000);
 const labels={0:'晴',1:'大部晴朗',2:'多云',3:'阴',45:'雾',48:'雾凇',51:'小毛毛雨',53:'毛毛雨',55:'较强毛毛雨',56:'冻毛毛雨',57:'冻毛毛雨',61:'小雨',63:'中雨',65:'大雨',66:'冻雨',67:'冻雨',71:'小雪',73:'中雪',75:'大雪',77:'雪粒',80:'阵雨',81:'阵雨',82:'强阵雨',85:'阵雪',86:'强阵雪',95:'雷阵雨',96:'雷阵雨伴冰雹',99:'雷阵雨伴冰雹'};
 const sunny='<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>';
 const cloudy='<path d="M6 18a5 5 0 1 1 1-10 6 6 0 0 1 11 2 4 4 0 0 1 0 8Z"/>';
 const nodes=[...document.querySelectorAll('[data-weather-city]')];if(!nodes.length)return;
 const saved=window.TRIP_WEATHER;
 const fmt=v=>new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(v));
 function render(data){
  let shown=0;
  for(const el of nodes){
   const daily=data.cities?.[Number(el.dataset.weatherCity)]?.daily;
   const i=daily?.time?.indexOf(el.dataset.weatherDate)??-1;if(i<0)continue;
   const min=daily.temperature_2m_min?.[i],max=daily.temperature_2m_max?.[i],code=daily.weather_code?.[i],rain=daily.precipitation_probability_max?.[i];
   if(!Number.isFinite(min)||!Number.isFinite(max)||!Number.isFinite(code))continue;
   el.querySelector('.weather-temp').textContent=`${min}° / ${max}°`;
   el.querySelector('.weather-condition span').textContent=labels[code]||'天气待补充';
   el.querySelector('.weather-condition small').textContent=Number.isFinite(rain)?`降水 ${rain}%`:'降水待补充';
   el.querySelector('.weather-symbol svg').innerHTML=[0,1].includes(code)?sunny:cloudy;
   el.title='该条预报获取时间：'+fmt(data.fetchedAt)+'（北京时间）';shown++;
  }return shown;
 }
 if(saved)render(saved);
 const status=text=>document.querySelectorAll('[data-weather-status]').forEach(el=>el.textContent=text);
 const snapshot=saved?'预报快照：'+fmt(saved.fetchedAt)+'（北京时间）':'天气待补充';
 status(snapshot);
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai'}).format(new Date());
 if(today>'2026-10-08')return;
 const url='https://api.open-meteo.com/v1/forecast?latitude=36.06,40.14,36.41,36.62&longitude=103.83,94.66,94.90,101.78&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=Asia%2FShanghai&forecast_days=16';
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
 fetch(url,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('unavailable');return r.json()}).then(cities=>{
  if(!Array.isArray(cities)||cities.length!==4)throw Error('invalid response');
  const fetchedAt=new Date().toISOString();const count=render({cities,fetchedAt});
  if(!count)throw Error('no matching dates');
  status('可用预报更新于 '+fmt(fetchedAt)+'（北京时间）'+(count<nodes.length?'；未覆盖日期保留 '+fmt(saved.fetchedAt)+' 的快照':''));
 }).catch(()=>status('暂未刷新 · '+snapshot)).finally(()=>clearTimeout(timeout));
})();
