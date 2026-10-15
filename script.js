(function(){
  var pages=['home','product','tech','about','contact'];
  var links=document.getElementById('links');
  function go(p,tab){
    if(pages.indexOf(p)<0)p='home';
    pages.forEach(function(id){document.getElementById(id).classList.toggle('active',id===p)});
    document.querySelectorAll('nav.links .l').forEach(function(b){
      if(b.dataset.go===p)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
    });
    links.classList.remove('open');
    document.getElementById('burger').setAttribute('aria-expanded','false');
    if(p==='contact')setTab(tab||'contact');
    window.scrollTo({top:0,behavior:'auto'});
    try{history.replaceState(null,'','#'+p)}catch(e){}
  }
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-go]');
    if(t){go(t.dataset.go,t.dataset.tab)}
  });
  function setTab(t){
    document.getElementById('form-contact').hidden=t!=='contact';
    document.getElementById('form-demo').hidden=t!=='demo';
    document.getElementById('tab-contact').setAttribute('aria-selected',t==='contact');
    document.getElementById('tab-demo').setAttribute('aria-selected',t==='demo');
  }
  document.querySelectorAll('.tabs button').forEach(function(b){b.addEventListener('click',function(){setTab(b.dataset.tab)})});

  document.getElementById('burger').addEventListener('click',function(){
    var o=links.classList.toggle('open');this.setAttribute('aria-expanded',o);
  });

  // theme
  document.getElementById('theme').addEventListener('click',function(){
    var r=document.documentElement,cur=r.getAttribute('data-theme');
    var dark=cur?cur==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
    r.setAttribute('data-theme',dark?'light':'dark');
  });

  // toast
  var tt=document.getElementById('toast');
  function toast(m){tt.textContent=m;tt.classList.add('show');setTimeout(function(){tt.classList.remove('show')},3600)}

  var ENDPOINT='https://formsubmit.co/ajax/swarlekh2@gmail.com';
  function mailFallback(subject,body){
    var url='https://mail.google.com/mail/?view=cm&fs=1&to=swarlekh2@gmail.com&su='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    if(!window.open(url,'_blank')){window.location.href=url}
  }
  function valid(form){
    var ok=true;form.querySelectorAll('[required]').forEach(function(i){if(!i.value.trim()){ok=false}});
    return ok;
  }
  function send(form,subject,fields,okMsg){
    var btn=form.querySelector('button[type=submit]'),label=btn.textContent;
    btn.disabled=true;btn.textContent='Sending…';
    var data=Object.assign({_subject:subject,_template:'table',_captcha:'false'},fields);
    fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
      .then(function(r){return r.json()})
      .then(function(j){
        if(j.success==='true'||j.success===true){form.reset();toast(okMsg)}
        else throw new Error('failed');
      })
      .catch(function(){
        var body=Object.keys(fields).map(function(k){return k+': '+fields[k]}).join('\n');
        toast('Could not send online. Opening your email app instead…');
        mailFallback(subject,body);
      })
      .finally(function(){btn.disabled=false;btn.textContent=label});
  }
  var v=function(id){return document.getElementById(id).value.trim()};
  document.getElementById('form-contact').addEventListener('submit',function(e){
    e.preventDefault();
    if(!valid(this)){toast('Please fill in your name, email and message.');return}
    send(this,v('c-sub')||'Message from SwarLekh website',{Name:v('c-name'),Email:v('c-email'),Message:v('c-msg')},'Thank you! Your message has been sent.');
  });
  document.getElementById('form-demo').addEventListener('submit',function(e){
    e.preventDefault();
    if(!valid(this)){toast('Please fill in your name, email and institution.');return}
    send(this,'Demo request – '+v('d-inst'),{Name:v('d-name'),Email:v('d-email'),Phone:v('d-phone'),Institution:v('d-inst'),Role:v('d-role'),'Preferred date':v('d-date'),Notes:v('d-note')},'Demo request sent! We will contact you soon.');
  });

  // hero voice demo: listening -> transcribing -> saved
  (function(){
    var el=document.getElementById('typed'),wave=document.getElementById('wave'),
        st=document.getElementById('status'),stText=document.getElementById('statusText');
    if(!el)return;
    var text='Water evaporates from oceans and lakes, rises as vapour and cools into clouds. It then falls as rain or snow and flows back to rivers and seas.';
    function state(s,label,live){st.dataset.state=s;stText.textContent=label;wave.classList.toggle('live',live)}
    var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce){el.textContent=text;state('done','Answer saved',false);return}
    var timer;
    function run(){
      el.textContent='';el.classList.remove('cur');
      state('listen','Listening',true);
      timer=setTimeout(function(){
        state('write','Writing your answer',true);el.classList.add('cur');
        var i=0;
        (function type(){
          if(i<text.length){i++;el.textContent=text.slice(0,i);timer=setTimeout(type,30)}
          else{
            el.classList.remove('cur');
            state('done','Answer saved ✓',false);
            timer=setTimeout(run,3200);
          }
        })();
      },2000);
    }
    run();
  })();

  document.getElementById('yr').textContent=new Date().getFullYear();
  var h=(location.hash||'').replace('#','');if(h&&pages.indexOf(h)>=0)go(h);
})();
