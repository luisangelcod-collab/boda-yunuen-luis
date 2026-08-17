const WEDDING_DATE=new Date("2026-11-14T00:00:00-06:00");
const RSVP_ENDPOINT="https://fzkxoyamxmeddfxmqbmz.supabase.co/rest/v1/wedding_rsvp";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_511lJk84mU8RKS3J-c7AUw_ai2O8gB7";
const WHATSAPP_NUMBER="523511524939";
const PHOTOS=[
  {number:1,width:1066,height:1600,small:640},
  {number:2,width:1066,height:1600,small:640},
  {number:3,width:1066,height:1600,small:640},
  {number:4,width:1066,height:1600,small:640},
  {number:5,width:1066,height:1600,small:640},
  {number:6,width:1600,height:1066,small:960,orientation:"landscape"},
  {number:7,width:1066,height:1600,small:640},
  {number:8,width:1066,height:1600,small:640},
  {number:9,width:1066,height:1600,small:640},
  {number:10,width:852,height:1280,small:640},
  {number:11,width:853,height:1280,small:640},
  {number:12,width:853,height:1280,small:640},
  {number:13,width:853,height:1280,small:640},
  {number:14,width:853,height:1280,small:640},
  {number:15,width:853,height:1280,small:640},
].map(photo=>{const stem=`assets/photos/yunuen-luis-${String(photo.number).padStart(2,"0")}`;return{...photo,src:`${stem}.jpeg`,avif:`${stem}-${photo.small}.avif ${photo.small}w, ${stem}-${photo.width}.avif ${photo.width}w`,alt:`Yunuen y Luis, fotografía ${photo.number} de 15`}});
const prefersReducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
const siteHeader=document.querySelector("#siteHeader");
const menuButton=document.querySelector("#menuButton");
const mobileNav=document.querySelector("#mobileNav");

function updateHeader(){siteHeader.classList.toggle("scrolled",scrollY>24)}
addEventListener("scroll",updateHeader,{passive:true});updateHeader();
menuButton.addEventListener("click",()=>{const open=menuButton.getAttribute("aria-expanded")==="true";menuButton.setAttribute("aria-expanded",String(!open));menuButton.setAttribute("aria-label",open?"Abrir menú":"Cerrar menú");menuButton.textContent=open?"☰":"×";mobileNav.hidden=open});
mobileNav.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{mobileNav.hidden=true;menuButton.setAttribute("aria-expanded","false");menuButton.setAttribute("aria-label","Abrir menú");menuButton.textContent="☰"}));

const guestName=new URLSearchParams(location.search).get("invitado")?.trim();
const guestGreeting=document.querySelector("#guestGreeting");
const invitationField=document.querySelector("#invitation");
if(guestName){const safeName=guestName.slice(0,140);guestGreeting.textContent=`Invitación especial para ${safeName}`;guestGreeting.hidden=false;invitationField.value=safeName.slice(0,160)}

function updateCountdown(){let remaining=Math.max(0,WEDDING_DATE-Date.now());const days=Math.floor(remaining/864e5);remaining%=864e5;const hours=Math.floor(remaining/36e5);remaining%=36e5;const minutes=Math.floor(remaining/6e4);const seconds=Math.floor(remaining%6e4/1000);document.querySelector("#days").textContent=days;document.querySelector("#hours").textContent=String(hours).padStart(2,"0");document.querySelector("#minutes").textContent=String(minutes).padStart(2,"0");document.querySelector("#seconds").textContent=String(seconds).padStart(2,"0")}
updateCountdown();setInterval(updateCountdown,1000);

const slides=document.querySelector("#slides");
const dots=document.querySelector("#carouselDots");
const carousel=document.querySelector("#carousel");
let currentPhoto=0,carouselTimer,touchStartX=0;
PHOTOS.forEach((photo,index)=>{const slide=document.createElement("figure");slide.className=`slide${photo.orientation==="landscape"?" slide--landscape":""}`;slide.setAttribute("aria-label",`${index+1} de ${PHOTOS.length}`);slide.setAttribute("aria-hidden",index===0?"false":"true");const picture=document.createElement("picture");const avif=document.createElement("source");avif.type="image/avif";avif.srcset=photo.avif;avif.sizes="(max-width: 560px) 100vw, (max-width: 820px) calc(100vw - 12px), 690px";const image=document.createElement("img");image.src=photo.src;image.alt=photo.alt;image.width=photo.width;image.height=photo.height;image.loading=index<2?"eager":"lazy";image.decoding="async";image.fetchPriority=index===0?"high":"low";let fallbackAttempted=false;image.addEventListener("error",()=>{if(fallbackAttempted)return;fallbackAttempted=true;avif.remove();image.src=`${photo.src}?format=jpeg`});picture.append(avif,image);slide.append(picture);slides.append(slide);const dot=document.createElement("button");dot.className=`dot${index===0?" active":""}`;dot.type="button";dot.setAttribute("aria-label",`Mostrar fotografía ${index+1}`);dot.setAttribute("aria-current",index===0?"true":"false");dot.addEventListener("click",()=>showPhoto(index,true));dots.append(dot)});
function warmCarouselPhoto(index,priority="low"){const normalized=(index+PHOTOS.length)%PHOTOS.length;const image=slides.children[normalized]?.querySelector("img");if(!image)return;image.loading="eager";image.fetchPriority=priority;image.decode?.().catch(()=>{})}
function showPhoto(index,restart=false){currentPhoto=(index+PHOTOS.length)%PHOTOS.length;warmCarouselPhoto(currentPhoto,"high");warmCarouselPhoto(currentPhoto+1);slides.style.transform=`translateX(-${currentPhoto*100}%)`;[...slides.children].forEach((slide,i)=>slide.setAttribute("aria-hidden",String(i!==currentPhoto)));[...dots.children].forEach((dot,i)=>{const active=i===currentPhoto;dot.classList.toggle("active",active);dot.setAttribute("aria-current",String(active))});if(restart)restartCarousel()}
warmCarouselPhoto(0,"high");warmCarouselPhoto(1);
function startCarousel(){if(prefersReducedMotion)return;clearInterval(carouselTimer);carouselTimer=setInterval(()=>showPhoto(currentPhoto+1),7000)}
function pauseCarousel(){clearInterval(carouselTimer)}
function restartCarousel(){pauseCarousel();startCarousel()}
document.querySelector("#previousPhoto").addEventListener("click",()=>showPhoto(currentPhoto-1,true));document.querySelector("#nextPhoto").addEventListener("click",()=>showPhoto(currentPhoto+1,true));carousel.addEventListener("mouseenter",pauseCarousel);carousel.addEventListener("mouseleave",startCarousel);carousel.addEventListener("focusin",pauseCarousel);carousel.addEventListener("focusout",startCarousel);carousel.addEventListener("touchstart",event=>{touchStartX=event.changedTouches[0].clientX;pauseCarousel()},{passive:true});carousel.addEventListener("touchend",event=>{const distance=event.changedTouches[0].clientX-touchStartX;if(Math.abs(distance)>45)showPhoto(currentPhoto+(distance<0?1:-1));startCarousel()},{passive:true});document.addEventListener("visibilitychange",()=>document.hidden?pauseCarousel():startCarousel());startCarousel();

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");revealObserver.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll(".reveal").forEach(element=>revealObserver.observe(element));

const rsvpDialog=document.querySelector("#rsvpDialog");
const rsvpForm=document.querySelector("#rsvpForm");
const attendance=document.querySelector("#attendance");
const guestCount=document.querySelector("#guestCount");
const submitRsvp=document.querySelector("#submitRsvp");
const formStatus=document.querySelector("#formStatus");
function openRsvpDialog(){formStatus.className="form-status";formStatus.textContent="";rsvpDialog.showModal();document.body.classList.add("dialog-open");setTimeout(()=>document.querySelector("#guestName").focus(),0)}
function closeRsvpDialog(){rsvpDialog.close()}
document.querySelectorAll("[data-open-rsvp]").forEach(button=>button.addEventListener("click",openRsvpDialog));document.querySelector("#closeRsvp").addEventListener("click",closeRsvpDialog);rsvpDialog.addEventListener("click",event=>{if(event.target===rsvpDialog)closeRsvpDialog()});rsvpDialog.addEventListener("close",()=>document.body.classList.remove("dialog-open"));
attendance.addEventListener("change",()=>{const attending=attendance.value==="si";guestCount.disabled=!attending;guestCount.required=attending;guestCount.value=attending?Math.max(1,Number(guestCount.value)||1):0});
function showFormStatus(message,error=false){formStatus.textContent=message;formStatus.className=`form-status visible${error?" error":""}`}
function buildWhatsAppUrl(payload){const attending=payload.attendance==="si";const lines=["Nueva confirmación para la boda de Yunuen y Luis","",`Nombre: ${payload.guest_name}`,`Asistencia: ${attending?"Sí asistirá":"No asistirá"}`,`Número de asistentes: ${payload.guest_count}`,`Invitación: ${payload.invitation}`];if(payload.phone)lines.push(`Teléfono: ${payload.phone}`);if(payload.message)lines.push(`Mensaje: ${payload.message}`);return`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`}
function showWhatsAppStatus(payload){formStatus.textContent="";formStatus.className="form-status visible";const message=document.createElement("p");message.textContent="¡Confirmación registrada! Tu respuesta quedó guardada. Toca el botón para enviarla también por WhatsApp a Yunuen y Luis.";const link=document.createElement("a");link.className="button button-dark whatsapp-button";link.href=buildWhatsAppUrl(payload);link.target="_blank";link.rel="noopener noreferrer";link.textContent="Enviar por WhatsApp";link.setAttribute("aria-label","Enviar esta confirmación por WhatsApp a Yunuen y Luis");formStatus.append(message,link)}
rsvpForm.addEventListener("submit",async event=>{event.preventDefault();if(rsvpForm.website.value)return;const data=new FormData(rsvpForm);const attending=data.get("attendance")==="si";const payload={guest_name:String(data.get("guest_name")||"").trim(),attendance:attending?"si":"no",guest_count:attending?Math.min(20,Math.max(1,Number(data.get("guest_count"))||1)):0,phone:String(data.get("phone")||"").trim()||null,message:String(data.get("message")||"").trim()||null,invitation:String(data.get("invitation")||"Invitación general").slice(0,160),user_agent:navigator.userAgent.slice(0,500)};submitRsvp.disabled=true;submitRsvp.textContent="Enviando…";showFormStatus("Enviando tu respuesta…");try{const response=await fetch(RSVP_ENDPOINT,{method:"POST",headers:{apikey:SUPABASE_PUBLISHABLE_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(payload)});if(!response.ok)throw new Error(`RSVP request failed with status ${response.status}`);rsvpForm.reset();attendance.dispatchEvent(new Event("change"));invitationField.value=guestName?guestName.slice(0,160):"Invitación general";showWhatsAppStatus(payload)}catch(error){console.error("No se pudo registrar la confirmación",error);showFormStatus("No se pudo registrar tu respuesta. Revisa tu conexión e intenta nuevamente.",true)}finally{submitRsvp.disabled=false;submitRsvp.textContent="Enviar confirmación"}});
