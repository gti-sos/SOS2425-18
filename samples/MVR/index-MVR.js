// Inicialización del array con los datos de ejemplo (cada registro en una sola línea)
let data = [
  {
      request_date: "22/11/2024",
      request_month: 11,
      request_year: 2024,
      cnae_descr: "Transporte de mercancías por carretera",
      company_municipality: "Alicante",
      company_province: "Alicante",
      work_center_locality: "Alicante",
      sector: "SERVICIOS",
      total_work_sus: 1,
      men_work_sus: 1,
      women_work_sus: 0
  },
  {
      request_date: "12/09/2024",
      request_month: 12,
      request_year: 2024,
      cnae_descr: "Educación secundaria técnica y profesional",
      company_municipality: "Elche",
      company_province: "Alicante",
      work_center_locality: "Elche",
      sector: "SERVICIOS",
      total_work_sus: 3,
      men_work_sus: 2,
      women_work_sus: 1
  },
  {
      request_date: "14/11/2024",
      request_month: 11,
      request_year: 2024,
      cnae_descr: "Fabricación de muebles de oficina y de establecimientos comerciales",
      company_municipality: "Benicarló",
      company_province: "Castelló",
      work_center_locality: "Benicarló",
      sector: "INDUSTRIA",
      total_work_sus: 63,
      men_work_sus: 52,
      women_work_sus: 11
  },
  {
      request_date: "14/11/2024",
      request_month: 11,
      request_year: 2024,
      cnae_descr: "Fabricación de carrocerías para vehículos de motor, fabricación de remolques y semirremolques",
      company_municipality: "Peñíscola",
      company_province: "Castelló",
      work_center_locality: "Peñíscola",
      sector: "INDUSTRIA",
      total_work_sus: 87,
      men_work_sus: 55,
      women_work_sus: 32
  },
  {
      request_date: "18/11/2024",
      request_month: 11,
      request_year: 2024,
      cnae_descr: "Transporte por taxi",
      company_municipality: "Castellón de la Plana",
      company_province: "Castelló",
      work_center_locality: "Castellón De La Plana",
      sector: "SERVICIOS",
      total_work_sus: 1,
      men_work_sus: 1,
      women_work_sus: 0
  },
  {
      request_date: "21/11/2024",
      request_month: 11,
      request_year: 2024,
      cnae_descr: "Transporte de mercancías por carretera",
      company_municipality: "Moncófar",
      company_province: "Castelló",
      work_center_locality: "Moncófar",
      sector: "SERVICIOS",
      total_work_sus: 2,
      men_work_sus: 2,
      women_work_sus: 0
  },
  {
      request_date: "17/12/2024",
      request_month: 12,
      request_year: 2024,
      cnae_descr: "Transporte de mercancías por carretera",
      company_municipality: "Moncófar",
      company_province: "Castelló",
      work_center_locality: "Moncófar",
      sector: "SERVICIOS",
      total_work_sus: 2,
      men_work_sus: 2,
      women_work_sus: 0
  },
  {
      request_date: "31/10/2024",
      request_month: 10,
      request_year: 2024,
      cnae_descr: "Servicios integrales a edificios e instalaciones",
      company_municipality: "Cuart de Poblet",
      company_province: "Valencia",
      work_center_locality: "Aldaya",
      sector: "SERVICIOS",
      total_work_sus: 0,
      men_work_sus: 0,
      women_work_sus: 0
  },
  {
      request_date: "11/04/2024",
      request_month: 11,
      request_year: 2024,
      cnae_descr: "Fabricación de otros componentes, piezas y accesorios para vehículos de motor",
      company_municipality: "Ribarroja del Turia",
      company_province: "Valencia",
      work_center_locality: "Riba-Roja De Túria",
      sector: "INDUSTRIA",
      total_work_sus: 86,
      men_work_sus: 53,
      women_work_sus: 33
  },
  {
      request_date: "11/04/2024",
      request_month: 11,
      request_year: 2024,
      cnae_descr: "Actividades de las empresas de trabajo temporal",
      company_municipality: "Madrid",
      company_province: "Madrid",
      work_center_locality: "Aldaya; Almussafes; Gandía",
      sector: "SERVICIOS",
      total_work_sus: 79,
      men_work_sus: 60,
      women_work_sus: 19
  }
];


    // Valor geográfico por el cual se filtrarán las filas (puede modificarse según se necesite)
    let selectedProvince = "Valencia";
  
  
  function avgByPrueb(selectedProvince){
    // Filtrar el array para obtener solo las filas que tengan el valor seleccionado en "company_province"
    let filteredData = data.filter(item => item.company_province === selectedProvince);
    
    // Extraer los valores numéricos del campo "total_work_sus"
    let totalWorkSusValues = filteredData.map(item => item.total_work_sus);
    
    // Calcular la suma de los valores usando reduce
    let sum = totalWorkSusValues.reduce((acc, value) => acc + value, 0);
    
    // Calcular la media
    let average = sum / totalWorkSusValues.length;
    return average;
  }
  avgByPrueb(selectedProvince);
  module.exports = {avgByPrueb, data};
  
