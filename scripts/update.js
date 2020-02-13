const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const iconv = require("iconv-lite");
const legislador = require("./legisladorHelper");
const Mongo = require("./db");

function updateData() {
  let options = {
    uri: `${legislador.API_URL}/LegisladorWEB.ASP?WCI=ProjetoTramite`,
    method: "POST",
    encoding: null,
    headers: { "content-type": "application/json" },
    form: {
      ID: "20",
      dsVerbete: "transporte",
      dsTexto: "transporte",
      inEOU: 0,
      Navegar: "Pesquisar"
    }
  };

  request(options, function(error, response, body) {
    const utf8String = iconv.decode(Buffer.from(body), "ISO-8859-1");
    const $ = cheerio.load(utf8String);
    const list = $(".row .col-lg-6.d-flex");
    let data = [];
    list.each((i, el) => {
      el = $(el);
      let title = el.find("> .card > .card-header > .card-title").text();
      let date = legislador.extractDate(
        el.find("> .card > .card-header > .card-subtitle").text()
      );
      let text = el.find("> .card > .card-body > .card-text").text();
      let url = legislador.getProjectDetailsURL(
        el
          .find("> .card > .card-body > a.btn.btn-outline-secondary")
          .attr("onclick")
      );
      let id = legislador.createHash(options.uri + url);
      let item = {
        id,
        title,
        date,
        text,
        url
      };
      updateProjectDetails(item, url, newItem => {
        data.push(newItem);
        let hash = legislador.createHash(
          options.uri + url + JSON.stringify(newItem)
        );
        newItem.hash = hash;
        Mongo.updateProject(newItem);
        if (list.length == i + 1) {
          console.log("done");
        } else {
          console.log("updating");
        }
      });
    });

    return data;
  });
}

function updateProjectDetails(data, url, callback) {
  var options = {
    uri: url,
    method: "GET",
    encoding: null
  };
  request(options, function(error, response, body) {
    const utf8String = iconv.decode(Buffer.from(body), "ISO-8859-1");
    const $ = cheerio.load(utf8String);
    const rows = $(".card-body > .row");
    const columns = $(rows[0]).find("dt");
    const values = $(rows[0]).find("dd");

    data = !data || data.constructor.name !== "Object" ? {} : data;

    columns.each((i, el) => {
      let key, value;
      data[
        (key = $(el)
          .text()
          .trim())
      ] = $(values[i]).text();
      if (key === "Autor") {
        data[key] = $(values[i]).html();
      }
    });

    $("h5.card-title").each((i, el) => {
      el = $(el);
      if (el.text() === "Ementa") {
        let content = el
          .parent()
          .next()
          .find("p.card-text");
        data.Ementa = $(content).text();
      }
      if (el.text() === "Texto") {
        let content = el
          .parent()
          .next()
          .find("p.card-text");
        data.project_text = "";
        content.each((i, p) => {
          data.project_text += $(p).html() + "<br />";
        });
      }
    });

    const officialDoc = $("i.fa-file-contract");
    data.doc = "";
    if (officialDoc.length) {
      let onclick = $(officialDoc.parent()).attr("onclick");
      data.doc = legislador.getPDFEx(onclick);
    }

    const tramite = $("#idTramite");
    data.tramite = [];
    data.tramite_cols = [];
    if (tramite.length) {
      let tmtCols = tramite.find("thead th");
      let tmtRows = tramite.find("tbody tr");
      let cTramite = {};
      tmtCols.each((i, tr) => {
        data.tramite_cols.push($(tr).text());
      });
      tmtRows.each((i, tr) => {
        let tds = $(tr).find("td");
        tds.each((i, td) => {
          cTramite[$(tmtCols[i]).text()] = $(td).text();
        });
        data.tramite.push(cTramite);
      });
    }

    const hasParecer = $("div.card-header > h6 > i.fa-file-medical-alt").length;

    data.parecer = [];

    if (hasParecer) {
      $(".collapse").each((i, el) => {
        el = $(el);

        if (/carregarAnexoDOC/gm.test(el.html())) {
          el.find("a[onclick]").each((i, a) => {
            (a = $(a)) &&
              data.parecer.push({
                title: a.text(),
                file: legislador.getAnexoDOC(a.attr("onclick"))
              });
          });
        }
      });
    }
    return callback(data);
  });
}

Mongo.connect(() => {
  updateData();
});

module.exports = {
  Mongo,
  updateData,
  API_URL: legislador.API_URL
};
