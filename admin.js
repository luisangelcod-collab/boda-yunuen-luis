const ADMIN_ENDPOINT="https://fzkxoyamxmeddfxmqbmz.supabase.co/functions/v1/rsvp-admin";
const loginView=document.querySelector("#loginView");
const loginForm=document.querySelector("#loginForm");
const passwordField=document.querySelector("#adminPassword");
const loginButton=document.querySelector("#loginButton");
const loginStatus=document.querySelector("#loginStatus");
const dashboard=document.querySelector("#dashboard");
const dashboardStatus=document.querySelector("#dashboardStatus");
const rowsBody=document.querySelector("#rsvpRows");
const emptyMessage=document.querySelector("#emptyMessage");
let adminPassword="";
let allRows=[];
let currentFilter="all";

function formatDate(value){return new Intl.DateTimeFormat("es-MX",{dateStyle:"medium",timeStyle:"short",timeZone:"America/Mexico_City"}).format(new Date(value))}
function setLoginStatus(message){loginStatus.textContent=message}
async function loadRows(password){
  const response=await fetch(ADMIN_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});
  let result={};
  try{result=await response.json()}catch{}
  if(!response.ok)throw new Error(result.error||"No fue posible abrir la lista.");
  return Array.isArray(result.rows)?result.rows:[];
}
function updateSummary(){
  document.querySelector("#attendeeTotal").textContent=allRows.filter(row=>row.attendance==="si").reduce((total,row)=>total+(Number(row.guest_count)||0),0);
  document.querySelector("#yesTotal").textContent=allRows.filter(row=>row.attendance==="si").length;
  document.querySelector("#noTotal").textContent=allRows.filter(row=>row.attendance==="no").length;
  document.querySelector("#responseTotal").textContent=allRows.length;
}
function appendCell(row,value,className=""){const cell=document.createElement("td");cell.textContent=value||"—";if(className)cell.className=className;row.append(cell);return cell}
function renderRows(){
  rowsBody.textContent="";
  const visible=currentFilter==="all"?allRows:allRows.filter(row=>row.attendance===currentFilter);
  visible.forEach(item=>{
    const row=document.createElement("tr");
    const statusCell=document.createElement("td");
    const badge=document.createElement("span");
    badge.className=`badge ${item.attendance==="si"?"yes":"no"}`;
    badge.textContent=item.attendance==="si"?"Sí asistirá":"No asistirá";
    statusCell.append(badge);row.append(statusCell);
    appendCell(row,item.guest_name,"names");
    appendCell(row,item.attendance==="si"?String(item.guest_count||1):"0");
    appendCell(row,item.phone);
    appendCell(row,formatDate(item.created_at));
    appendCell(row,item.message,"message");
    rowsBody.append(row);
  });
  emptyMessage.hidden=visible.length!==0;
}
function showDashboard(rows){
  allRows=rows;
  loginView.hidden=true;
  dashboard.hidden=false;
  document.querySelector("#updatedAt").textContent=`Actualizado: ${formatDate(new Date().toISOString())}`;
  updateSummary();renderRows();
}
loginForm.addEventListener("submit",async event=>{
  event.preventDefault();
  const password=passwordField.value;
  loginButton.disabled=true;loginButton.textContent="Verificando…";setLoginStatus("");
  try{const rows=await loadRows(password);adminPassword=password;passwordField.value="";showDashboard(rows)}
  catch(error){setLoginStatus(error.message||"Clave incorrecta.");passwordField.select()}
  finally{loginButton.disabled=false;loginButton.textContent="Entrar"}
});
document.querySelector("#refreshButton").addEventListener("click",async()=>{
  dashboardStatus.textContent="Actualizando…";
  try{allRows=await loadRows(adminPassword);updateSummary();renderRows();document.querySelector("#updatedAt").textContent=`Actualizado: ${formatDate(new Date().toISOString())}`;dashboardStatus.textContent="Lista actualizada."}
  catch(error){dashboardStatus.textContent=error.message||"No fue posible actualizar."}
});
document.querySelector("#logoutButton").addEventListener("click",()=>{adminPassword="";allRows=[];rowsBody.textContent="";dashboard.hidden=true;loginView.hidden=false;setLoginStatus("");passwordField.focus()});
document.querySelectorAll("[data-filter]").forEach(button=>button.addEventListener("click",()=>{currentFilter=button.dataset.filter;document.querySelectorAll("[data-filter]").forEach(item=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",String(active))});renderRows()}));
function csvCell(value){return`"${String(value??"").replaceAll('"','""')}"`}
document.querySelector("#downloadButton").addEventListener("click",()=>{
  const headings=["Fecha de respuesta","Asistencia","Número de asistentes","Nombres completos","Teléfono","Mensaje","Invitación"];
  const lines=[headings,...allRows.map(row=>[formatDate(row.created_at),row.attendance==="si"?"Sí asistirá":"No asistirá",row.attendance==="si"?(row.guest_count||1):0,row.guest_name,row.phone,row.message,row.invitation])];
  const csv="\ufeff"+lines.map(line=>line.map(csvCell).join(";")).join("\r\n");
  const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
  const link=document.createElement("a");link.href=url;link.download=`confirmaciones-yunuen-luis-${new Date().toISOString().slice(0,10)}.csv`;link.click();URL.revokeObjectURL(url);
});
