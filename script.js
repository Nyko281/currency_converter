// Funktion für den DarkMode
(function() {
  var switchToDark = document.getElementById("switchToDark");
    if (switchToDark) {
      initTheme();
      switchToDark.addEventListener("change", function(event) {
          resetTheme();
      });
      // Was soll drin passieren, wenn das Schalter aktiv ist 
      function initTheme() {
          var darkThemeClick =
              localStorage.getItem("switchToDark") !== null &&
              localStorage.getItem("switchToDark") === "dark";
          switchToDark.checked = darkThemeClick;
          darkThemeClick
              ?
              document.body.setAttribute("theme", "dark") :
              document.body.removeAttribute("theme");
      }
      // Was soll passieren wen der Schalter inaktiv ist bzw. noch mal verwendet wird
      function resetTheme() {
          if (switchToDark.checked) {
              document.body.setAttribute("theme", "dark");
              localStorage.setItem("switchToDark", "dark");
              document.getElementById("spanChange").innerHTML = "";
              currency_output = black
          } else {
              document.body.removeAttribute("theme");
              localStorage.removeItem("switchToDark");
              document.getElementById("spanChange").innerHTML = "";
          }
      }
  }
})();
// Ende der Funktion für den DarkMode


const first_currency = document.getElementById('first_currency');
const second_currency = document.getElementById('second_currency');
const currency_rate = document.getElementById('currency_rate');
const currency_input = document.getElementById('currency_input');
const currency_output = document.getElementById('currency_output');

const calc_btn = document.getElementById('calc_btn');
const details_btn = document.getElementById('details_btn');
const period_btns = document.getElementById("time_btns");
const hide_btn = document.getElementById('hide_btn');
const add_btn = document.getElementById('add_btn');

const host = "api.frankfurter.app";


// Einfache Währungsrate abfragen und einfügen
async function getRate() {
  if (first_currency.value === second_currency.value) {
    alert("Wähle bitte 2 unterschiedliche Währungen aus!");
  } else {
    const response = await fetch(`https://${host}/latest?from=${first_currency.value}&to=${second_currency.value}`)
    const json = await response.json();
    const rate = Object.values(json.rates)[0];
    
    currency_rate.innerHTML = `1 ${first_currency.value} = ${rate} ${second_currency.value}`
  }
}


// individuellen Wert umrechnen
async function calcCurrency() {
  if (first_currency.value === second_currency.value) {
    alert("Wähle bitte 2 unterschiedliche Währungen aus!");
  } else {
    const response = await fetch(`https://${host}/latest?amount=${currency_input.value}&from=${first_currency.value}&to=${second_currency.value}`);
    const json = await response.json();
    const output_value = Object.values(json.rates)[0];

    currency_output.innerHTML = output_value;
  }
}


// Time Series abfragen und als Plot darstellen
async function makePlot(days) {
  var today_datetime = new Date();
  var today_date = today_datetime.getFullYear() + '-' + (today_datetime.getMonth() + 1) + '-' + today_datetime.getDate();

  var past_datetime = new Date(today_date);
  past_datetime.setDate(past_datetime.getDate() - days);
  var past_date = past_datetime.getFullYear() + '-' + (past_datetime.getMonth() + 1) + '-' + ("0" + past_datetime.getDate()).slice(-2);

  var date_list = []
  var value_list = [];

  var response = await fetch(`https://${host}/${past_date}..?from=${first_currency.value}&to=${second_currency.value}`);
  var json = await response.json();
  Object.entries(json.rates).forEach(([key, value]) => {
    date_list.push(key);
    var v = Object.values(value);
    value_list.push(v[0]);
  })

  var data = [
    {
      x: date_list,
      y: value_list,
      type: 'scatter'
    }
  ];

  var layout = {
    title: `1 ${first_currency.value} = ... ${second_currency.value}`,
  };

  var GRAPH = document.getElementById('graph');
  var config = {responsive: true};
  Plotly.newPlot(GRAPH, data, layout, config);
}


// Detail (Grafik) Feld anzeigen
function showDetails() {
  makePlot(7);
  var detail_view = document.getElementById("detail_view");
  detail_view.style.visibility = 'visible';
  detail_view.style.display = 'flex';
  details_btn.style.display = 'none'; 
}


// Detail (Grafik) Feld wieder ausblenden
function hideDetails() {
  var detail_view = document.getElementById("detail_view");
  detail_view.style.visibility = 'hidden';
  detail_view.style.display = 'none';
  details_btn.style.display = 'inline';
  document.getElementById("week").checked = true;
}


// Zeitraum für Grafik von RadioButtons abfragen und Plot ändern
function changePlot() {
  var period = document.getElementsByName("period");
  for(var i = 0; i < period.length; i++) {
    if(period[i].checked) {
      var period_val = period[i].value;
    }
  }
  makePlot(period_val);
}


// Plot mit dritter Währung erstellen und einfügen
async function threeCurPlot(days) {
  var today_datetime = new Date();
  var today_date = today_datetime.getFullYear() + '-' + (today_datetime.getMonth() + 1) + '-' + today_datetime.getDate();

  var past_datetime = new Date(today_date);
  past_datetime.setDate(past_datetime.getDate() - days);
  var past_date = past_datetime.getFullYear() + '-' + (past_datetime.getMonth() + 1) + '-' + ("0" + past_datetime.getDate()).slice(-2);

  var date_list = [];
  var value_list_one = [];
  var value_list_two = [];

  var response = await fetch(`https://${host}/${past_date}..?from=${first_currency.value}&to=${second_currency.value}`);
  var json = await response.json();
  Object.entries(json.rates).forEach(([key, value]) => {
    date_list.push(key);
    var v = Object.values(value);
    value_list_one.push(v[0]);
  })

  var third_currency = document.getElementById('third_currency');

  var response = await fetch(`https://${host}/${past_date}..?from=${first_currency.value}&to=${third_currency.value}`);
  var json = await response.json();
  Object.entries(json.rates).forEach(([key, value]) => {
    var v = Object.values(value);
    value_list_two.push(v[0]);
  })

  var data_one = {
    x: date_list,
    y: value_list_one,
    type: 'scatter',
    name: second_currency.value
  };

  var data_two = {
    x: date_list,
    y: value_list_two,
    type: 'scatter',
    name: third_currency.value
  };
  
  var data = [data_one, data_two];

  var layout = {
    title: `1 ${first_currency.value} = ...`,
  };

  var GRAPH = document.getElementById('graph');
  var config = {responsive: true};
  Plotly.newPlot(GRAPH, data, layout, config);
}


// Zeitraum für Plot mit drei Währungen abfragen und damit "threeCurPlot" aufrufen
function add_third() {
  var period = document.getElementsByName("period");
  for(var i = 0; i < period.length; i++) {
    if(period[i].checked) {
      var period_val = period[i].value;
    }
  }
  threeCurPlot(period_val);
}


// EventListener für verschieden Buttons und Felder
document.addEventListener('DOMContentLoaded', getRate);
first_currency.addEventListener('change', getRate);
first_currency.addEventListener('change', calcCurrency);
first_currency.addEventListener('change', changePlot);
second_currency.addEventListener('change', getRate);
second_currency.addEventListener('change', calcCurrency);
second_currency.addEventListener('change', changePlot);
calc_btn.addEventListener('click', calcCurrency);
details_btn.addEventListener('click', showDetails);
period_btns.addEventListener('change', changePlot);
hide_btn.addEventListener('click', hideDetails);
add_btn.addEventListener('click', add_third);