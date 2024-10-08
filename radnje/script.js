// sadrzaj:
// oznake:
// mane:

// oznake:
// #stao
// #mana



const pTest = document.getElementById("p1");

let spisakTest = undefined;
let spisakJson = undefined;

window.addEventListener('load', () => {
  const url = "http://localhost:3201/radno-vreme/tabela";
  fetchSajtFn(url);
  $("#tabelaRezultatHeader").hide();
  $("#uspesnoDodataRadnja").hide();
  $('#neuspesnoDodavanjeRadnje').hide();

}); // on load


// event za pretragu radnji na #btnpretraziradnje
const btnPretraziRadnje = document.getElementById("btnPretraziRadnje");
const poljeZaPretraguRadji = document.getElementById("poljeZaPretraguRadnji");
// ako je query razlicit od "" onda pozovi funkciju za pretragu
$("#obavestenjeOPretrazi").hide();
btnPretraziRadnje.addEventListener("click", () => {
  if (poljeZaPretraguRadji.value != "") {
    pretraziRadnjeIspisi(poljeZaPretraguRadji.value);
    $("#obavestenjeOPretrazi").fadeOut(0);
    } else {
    const obavestenjeOPretrazi = document.getElementById("obavestenjeOPretrazi");
    obavestenjeOPretrazi.innerHTML = "Niste uneli tekst";
    $("#obavestenjeOPretrazi").fadeIn(100, ()=>console.log(""));
    }
});


// dodaj radnje:
// dobiti json od forme
$("#uspesnoDodataRadnja").className="";
const formaDodajRadnju = document.getElementById("dodajRadnju");
formaDodajRadnju.addEventListener("submit", async (event) => {
  event.preventDefault();
  // prebacimo formu u json format
  const formData = new FormData(event.target);
  // prebacimo FormData u obican js obj:
  const formDataObj = Object.fromEntries(formData.entries());
  // posaljemo serveru
  try { 
    let odgovor = await fetch(
      "http://localhost:3201/radno-vreme/dodaj-radnju", {
	method: "POST",
	body: JSON.stringify(formDataObj)
      }
    ); // fetch
    console.log('poslata forma');
    // ako je uspesno dodato radno vreme, obavestiti korisnika nekim obavestenjem
    if (odgovor.status == 200) {
      $('#uspesnoDodataRadnja').fadeIn(200);
      setTimeout(() => {
	$('#uspesnoDodataRadnja').fadeOut(500);
      }, 3000);
      // azurirati tabelu
      let arrObj = [];
      arrObj[0] = formDataObj;
      dodajRedoveUSpisakRadnji(arrObj, glavnaTabelaPotrebanNode, "end")
      // ako nije ubacenou bazu obavestiti korisnika
    } else if (odgovor.status == 500){
      console.log('status je 500');
      $('#neuspesnoDodavanjeRadnje').fadeIn(200);
      setTimeout(() => {
	$('#neuspesnoDodavanjeRadnje').fadeOut(500);
      }, 3000);
    } // if
  }    // try
  // ako nije uspelo da se posalje forma, console.log
  catch (err) {
    console.log("Nije uspelo slanje, forme:");
    console.log(err);
  } // catch
});








// Functions

// fn fetchSajtFn
const glavnaTabela = document.getElementById("spisak");
let glavnaTabelaPotrebanNode = glavnaTabela.getElementsByTagName("tbody")[0];
// Fn for async/await  fetch api
async function fetchSajtFn(url) {
  try {
    const response = await fetch(url);
    const spisak_json = await response.json();
    spisakJson = spisak_json;
    // tu bilo
    dodajRedoveUSpisakRadnji(spisak_json, glavnaTabelaPotrebanNode, "end");
    spisakTest = spisak_json;
  }
  catch (err) {
    console.log("fetch api greska: ");
    console.log(err);
  }
}

// fn pretraziRadnjeIspisi
let jelTabelaNapravljena = false;
let tabelaIspis = undefined;
let tabelaIspisTbody = undefined;
// nalazi red koji sadrzi "query" i ispisuje ga na html stranicu
function pretraziRadnjeIspisi(query) {
  console.log("--------------------");
  // #mana Predpostavlja da postoji samo jedan red koji se poklapa sa query
  // vrti kroz objekte  
  for (obj of spisakJson) {
    let pattern = new RegExp(String.raw`${query}`, 'i');
    let placeOfSearchedQuery = obj["ime_radnje"].match(pattern);
    // ako je pronadjen query
    if ( placeOfSearchedQuery != null) {
      // napraviti tabelu i child ako nije napravljena
      if (jelTabelaNapravljena != true) {
	tabelaIspis = document.createElement("table");
	tabelaIspisTbody = document.createElement("tbody");
	tabelaIspisTbody.appendChild(document.querySelector("#spisak tr").cloneNode(true));
	tabelaIspis.appendChild(tabelaIspisTbody);
	tabelaIspis.className = "table";
	jelTabelaNapravljena = true;
      } else {
	// 
      }
      // dodaje tabelu u div ako vec ne postoji
      if (document.getElementById("pretraziRadnjeDiv").children[document.getElementById("pretraziRadnjeDiv").children.length -1].nodeName != "TABLE") {
	document.getElementById("pretraziRadnjeDiv").appendChild(tabelaIspis);
      } else {
	console.log("nije dodata tabela ispod polja za pretragu jer vec postoji");
      }
      // stavi obj u niz
      const arrObj = [];
      arrObj[0] = obj;
      // Ispisati arrObj kao red u tabeli
      dodajRedoveUSpisakRadnji(arrObj, tabelaIspisTbody, "start");

      // prepisati tabelu preko zadnjeg child-a
      // document.getElementById("pretraziRadnjeDiv").children[document.getElementById("pretraziRadnjeDiv").children.length -1] = tabelaIspis;

      break;
    } // if
  } // for
} // pretraziRadnjeIspisi

// fn dodajRedoveUSpisakRadnji
// for adding table rows, for specific table
// arg: jsonTabela: array of objs
//      domObj: elemenat na koji se dodaju redovi(table ili tbody...)
//      pocIlKraj: "start" / "end" dal da dodan na pocetak ili kraj
// #stopped
function dodajRedoveUSpisakRadnji(jsonTabela, domObj, pocIlKraj) {
    // kopiramo html tr, izmenimo td-ove, dodamo na kraju redova tabele
  
  // tabela primer, sluzi za kopiranje 
  const tblRowPrimer = document.getElementById("nevidljivRedUTabeli");
  let tblRow = tblRowPrimer.cloneNode(true);
  tblRow.className = tblRow.className.replace("d-none", "");
  tblRow.id = "";
  // vrtimo krugova koliko ima array elemenata-objekata(redova) u jsonTabela
  // dodajemo redove koji su popunjeni sa informacijama:
  // let orderOfKeys = ["ime_radnje", "pon_pet", "sub", "ned"];
  for (let i=0; i < jsonTabela.length; i++) {
    let redObj = jsonTabela[i];
    // vrtimo krugova koliko kolona/kljuceva(obj) u tabeli i upisujemo vrednost pod ljucem redom u <td> polja
    let j = 0;
    for (key of Object.keys(redObj)) {
      tblRow.children[j].innerHTML = redObj[key];

      j++;
    }
    switch (pocIlKraj){
    case "start":
      // children[2], 2 je jer je 1 nevidljiv
      domObj.insertBefore(tblRow.cloneNode(true), domObj.children[1]);
      break;
    case "end":
      domObj.appendChild(tblRow.cloneNode(true));
      break;
    } // sw
  } // for arr
  
}



// #mane

// kada doda radnju, red koji doda u tabelu je samo vizuelno, ako se pretrazuje red koji je dodat, nece da ga nadje jer pretrazuje objekat koji je dobijen od baze a u njemu nema novododatog reda jer nije ponovo fetch() tabelu iz base pa da i dodati red bue u jsonu(objektu) iz baze
// resenje:
// 1. da se ponovo ucita tabela iz baze
// da se doda red kao objekat u objekat koji sadrzi redove iz kog se pretrazuju redovi




