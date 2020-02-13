const moreDetailsRE = /WinProjetoTXT\((\d+)\,(\d+)\,(\d+)\,(\d+)\,\'([a-z]+)\'/i;
const downloadDocRE = /carregarPDFx\((\d+)\,(\d+)\,(\d+)\,(\d+)\,(\d+)\).*/;
const downloadAnexoRE = /carregarAnexoDOC\((\d+)\,(\d+)\,(\d+)\,(\d+)\,(\d+),(\d+)\).*/;
const crypto = require("crypto");

const Helper = {
  API_URL: "http://www.legislador.com.br",

  createHash(data) {
    let shasum = crypto.createHash("sha1");
    shasum.update(data);
    return shasum.digest("hex");
  },

  extractDate(str) {
    let result = str.match(/(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{1,4})/g);
    if (result && result.length) {
      return new Date(
        Date.parse(
          result[0]
            .split("/")
            .reverse()
            .join("/")
        )
      );
    }
    return null;
  },
  getProjectDetailsURL(onclick) {
    const params = onclick.match(moreDetailsRE);

    if (!params.length) {
      return "";
    }

    let argID = params[1];
    let argINEspecie = params[2];
    let argNRProjeto = params[3];
    let argAAProjeto = params[4];
    let argVerbete = params[5];
    let argINObjetoAnexo = null;
    let argNREmenda = null;
    let argNRSubemenda = null;
    let argMapa = null;
    let param = "";

    if (argVerbete) {
      param = "&dsVerbete=" + argVerbete;
    }
    if (argINObjetoAnexo) {
      param += "&inObjetoAnexo=" + argINObjetoAnexo;
    }
    if (argNREmenda) {
      param += "&nrEmenda=" + argNREmenda;
    }
    if (argNRSubemenda) {
      param += "&nrSubemenda=" + argNRSubemenda;
    }
    if (argMapa) {
      param += "&mapa=1";
    }
    return (
      Helper.API_URL +
      "/LegisladorWEB.ASP?WCI=ProjetoTexto&ID=" +
      argID +
      "&inEspecie=" +
      argINEspecie +
      "&nrProjeto=" +
      argNRProjeto +
      "&aaProjeto=" +
      argAAProjeto +
      param
    );
  },

  getPDFEx(onclick) {
    let params = onclick.match(downloadDocRE);

    if (params.length !== 6) {
      return "";
    }

    return (
      Helper.API_URL +
      "/LegisladorWEB.ASP?WCI=carregarPDF&ID=" +
      params[1] +
      "&inDocAssociado=" +
      params[2] +
      "&tpDocAssociado=" +
      params[3] +
      "&nrDocAssociado=" +
      params[4] +
      "&aaDocAssociado=" +
      params[5]
    );
  },

  getAnexoDOC(onclick) {
    let params = onclick.match(downloadAnexoRE);
    if (params.length === 7) {
      return (
        Helper.API_URL +
        "/LegisladorWEB.ASP?WCI=AnexoDOC&ID=" +
        params[1] +
        "&inDocAssociado=" +
        params[2] +
        "&tpDocAssociado=" +
        params[3] +
        "&nrDocAssociado=" +
        params[4] +
        "&aaDocAssociado=" +
        params[5] +
        "&nrSequencia=" +
        params[6]
      );
    }

    return "";
  }
};

module.exports = Helper;
