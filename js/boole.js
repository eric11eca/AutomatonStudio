function dosanitize (widget) {
  var data = window.event.clipboardData.getData('text');
  widget.value = sanitize(data);
  window.event.preventDefault();
  return false;
}

function sanitize (x) {
  x = x.replace(/\u00AC/gi,"~");
  x = x.replace(/\u2227/gi,"&");
  x = x.replace(/\u2228/gi,"|");
  x = x.replace(/\u21D2/gi,"=>");
  x = x.replace(/\u21D4/gi,"<=>");
  x = x.replace(/\u2200/gi,"A");
  x = x.replace(/\u2203/gi,"E");
  x = x.replace(/\./gi,":");
  return x.replace(/[^a-z_0-9~&|=>:-\s\x28\x29\,{}]/gi,"");
}

let generate = document.querySelector(".generate"),
    premises = document.querySelector(".premises-input"),
    result = document.querySelector(".conclusion");

console.log(generate);

generate.addEventListener('click', dotruthtable);

function dotruthtable (e) {
  e.preventDefault();
  console.log("generate truth table");
  var pl = readdata(premises.value);
  //var rl = readdata(conclusions.value);
  var cl = seq();
  
  for (var i=0; i < pl.length; i++) {
    cl = getconstants(pl[i], cl);
  }

  //for (var j=0; j < rl.length; j++) {
  //  cl = getconstants(rl[j], cl);
  //}

  result.innerHTML = formattruthtable(cl,pl);
}

function formattruthtable(cl,pl) {
  exp = '<table cellspacing="0" cellpadding="2" border="1">';
  exp = exp + '<tr bgcolor="#455767">';
  exp = exp + '<th colspan="' + cl.length + '">Constants</th>';
  exp = exp + '<td></td>';

  if (pl.length>0) {
    exp = exp + '<th colspan="' + pl.length + '">Premises</th>';
  }
  exp = exp + '<td></td>';
  
  //if (rl.length>0) {
  //  exp = exp + '<th colspan="' + rl.length + '">Conclusions</th>';
  //}
  
  exp = exp + '</tr>';
  exp = exp + '<tr bgcolor="#455767">';

  for (var i=0; i<cl.length; i++)
      {exp = exp + '<th style="min-width:40px">' + cl[i] + '</th>'};
  
      exp = exp + '<td></td>';

  for (var j=0; j<pl.length; j++) {
    exp = exp + '<th style="min-width:40px">' + grind(pl[j]) + '</th>';
  }
  
  exp = exp + '<td></td>';

  //for (var j=0; j<rl.length; j++) {
  //  exp = exp + '<th style="min-width:40px">' + grind(rl[j]) + '</th>';
  //}

  exp = exp + '</tr>';
  var nl = databases(cl);

  for (var i=0; i<nl.length; i++) {
    exp = exp + '<tr>';
    
    for (var j=0; j<cl.length; j++) {
      exp = exp + '<td align="center">' + pretty(evaluate(cl[j],nl[i])) + '</td>';
    }
    
    exp = exp + '<td></td>';
       
    for (var j=0; j<pl.length; j++) { 
      exp = exp + '<td align="center">' + pretty(evaluate(pl[j],nl[i])) + '</td>';
    }
    
    exp = exp + '<td></td>';
    
    //for (var j=0; j<rl.length; j++) {
    //  exp = exp + '<td align="center">' + pretty(evaluate(rl[j],nl[i])) + '</td>';
    //}

    exp = exp + '</tr>';
  }

  exp = exp + '</table></center>';
  return exp
}

function $ (name)
 {return document.getElementById(name)}

function pretty (val)
 {if (val) {return '1'} else {return '0'}}

//------------------------------------------------------------------------------
// Miscellaneous
//------------------------------------------------------------------------------

function constants (p)
 {return getconstants(p,seq())}

function getconstants (p,nl)
 {if (symbolp(p))
     {if (!itemp(p,nl)) {nl[nl.length]=p}}
  else {for (var i=1; i<p.length; i++)
            {nl = getconstants(p[i],nl)}};
  return nl}

function itemp (p,nl)
 {for (var i=0; i<nl.length; i++)
      {if (nl[i]==p) {return true}};
  return false}

function databases (cl)
 {var al = seq();
  var nl = seq();
  getdatabases(cl,0,al,nl);
  return nl}

function getdatabases (cl,n,al,nl)
 {if (n===cl.length) {nl[nl.length]=makedatabase(cl,al); return true};
  al[n]=true;
  getdatabases(cl,n+1,al,nl);
  al[n]=false;
  getdatabases(cl,n+1,al,nl);
  return true}

function makedatabase (cl,al)
 {var db = seq();
  for (var i=0; i<cl.length; i++)
      {if (al[i]) {db[db.length]=cl[i]}};
  return db}

//------------------------------------------------------------------------------
// evaluate
//------------------------------------------------------------------------------

function evaluate (p,facts)
 {if (symbolp(p)) {return evalatom(p,facts)}
  if (p[0] == 'not') {return evalnot(p,facts)}
  if (p[0] == 'and') {return evaland(p,facts)}
  if (p[0] == 'or') {return evalor(p,facts)}
  if (p[0] == 'implication') {return evalimplication(p,facts)}
  if (p[0] == 'reduction') {return evalreduction(p,facts)}
  if (p[0] == 'equivalence') {return evalequivalence(p,facts)}
  return false}

function evalatom (p,facts)
 {for (var i=0; i<facts.length; i++)
      {if (facts[i]==p) {return true}};
  return false}

function evalnot (p,facts)
 {return !evaluate(p[1],facts)}

function evaland (p,facts)
 {for (var i=1; i<p.length; i++)
      {if (!evaluate(p[i],facts)) {return false}};
  return true}

function evalor (p,facts)
 {for (var i=1; i<p.length; i++)
      {if (evaluate(p[i],facts)) {return true}};
  return false}

function evalimplication (p,facts)
 {for (var i=1; i<p.length-1; i++)
      {if (!evaluate(p[i],facts)) {return true}};
  return evaluate(p[p.length-1],facts)}

function evalreduction (p,facts)
 {for (var i=2; i<p.length; i++)
      {if (!evaluate(p[i],facts)) {return true}};
  return evaluate(p[1],facts)}

function evalequivalence (p,facts)
 {return (evaluate(p[1],facts)==evaluate(p[2],facts))}

//------------------------------------------------------------------------------
// toggleinstructions
//------------------------------------------------------------------------------

function toggleinstructions (toggle)
 {if (toggle.innerHTML == 'Hide Instructions')
     {toggle.innerHTML = 'Show Instructions';
      document.getElementById('instructions').style.display='none';
      return true};
  toggle.innerHTML='Hide Instructions';
  document.getElementById('instructions').style.display='';
  return true}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
