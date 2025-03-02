let datos = [
  { year: 2024, month: 11, prov_cod: 12, prov_name: "Castellón/Castelló", mun_cod: 40, mun_name: "Castelló de la Plana/Castellón de la Plana", sec_cod: "A", sec_descr: "Agricultura", grp_cod: 9, grp_descr: "Ocupaciones elementales", gend_cod: "H", gend_descr: "Hombre", age_range: "<25", num_contracts: 21 },
  { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 250, mun_name: "València", sec_cod: "A", sec_descr: "AGRICULTURA", grp_cod: 9, grp_descr: "Ocupaciones elementales", gend_cod: "H", gend_descr: "Hombre", age_range: ">44", num_contracts: 561 },
  { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 250, mun_name: "València", sec_cod: "S", sec_descr: "SERVICIOS", grp_cod: 8, grp_descr: "Operadoras de instalaciones y maquinaria, y montadores", gend_cod: "H", gend_descr: "Hombre", age_range: ">44", num_contracts: 227 },
  { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 76, mun_name: "Guardamar del Segura", sec_cod: "C", sec_descr: "CONSTRUCCIÓN", grp_cod: 7, grp_descr: "Artesanos y trabajadores cualificados de las industrias manufactureras y la construcción (excepto operadores de instalaciones y maquinaria)", gend_cod: "H", gend_descr: "Hombre", age_range: ">44", num_contracts: 2 },
  { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 76, mun_name: "Guardamar del Segura", sec_cod: "I", sec_descr: "INDUSTRIA", grp_cod: 9, grp_descr: "Ocupaciones elementales", gend_cod: "H", gend_descr: "Hombre", age_range: "25-44", num_contracts: 1 },
  { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 119, mun_name: "Sant Joan d'Alacant", sec_cod: "S", sec_descr: "SERVICIOS", grp_cod: 5, grp_descr: "Trabajadores de los servicios de restauración, personales, protección y vendedores", gend_cod: "H", gend_descr: "Hombre", age_range: "25-44", num_contracts: 9 },
  { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 902, mun_name: "Pilar de la Horadada", sec_cod: "A", sec_descr: "AGRICULTURA", grp_cod: 9, grp_descr: "Ocupaciones elementales", gend_cod: "H", gend_descr: "Hombre", age_range: "<25", num_contracts: 11 },
  { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 58, mun_name: "Cox", sec_cod: "S", sec_descr: "SERVICIOS", grp_cod: 9, grp_descr: "Ocupaciones elementales", gend_cod: "H", gend_descr: "Hombre", age_range: ">44", num_contracts: 9 },
  { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 65, mun_name: "Elx/Elche", sec_cod: "C", sec_descr: "CONSTRUCCIÓN", grp_cod: 7, grp_descr: "Artesanos y trabajadores cualificados de las industrias manufactureras y la construcción (excepto operadores de instalaciones y maquinaria)", gend_cod: "H", gend_descr: "Hombre", age_range: "25-44", num_contracts: 16 },
  { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 230, mun_name: "Silla", sec_cod: "S", sec_descr: "SERVICIOS", grp_cod: 9, grp_descr: "Ocupaciones elementales", gend_cod: "H", gend_descr: "Hombre", age_range: "<25", num_contracts: 10 },
  { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 202, mun_name: "Pobla de Vallbona, la", sec_cod: "I", sec_descr: "INDUSTRIA", grp_cod: 3, grp_descr: "Técnicos, profesionales de apoyo", gend_cod: "H", gend_descr: "Hombre", age_range: "25-44", num_contracts: 2 },
  { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 31, mun_name: "Benidorm", sec_cod: "S", sec_descr: "SERVICIOS", grp_cod: 5, grp_descr: "Trabajadores de los servicios de restauración, personales, protección y vendedores", gend_cod: "H", gend_descr: "Hombre", age_range: "<25", num_contracts: 102 }
];
  
function mediaPorProvincia(provincia)
{
  let sumaContratos = 0;
  let cantidad = 0;

  let filtro = datos.filter(item => item.prov_name == provincia);

  filtro.forEach(item => {
    sumaContratos += item.num_contracts;
    cantidad++;
  })

  let media = cantidad > 0 ? (sumaContratos/cantidad).toFixed(2) : 0;
  return media;
}

mediaPorProvincia("Alicante/Alacant")

module.export = {mediaPorProvincia};