let NICStreetmap = '8nTEokHIiOP_AXnFAMHUepBxidEABCSa2MhxgaVcupLu2ZdHQKsYpIQuFgvuZWga_uiIhUQ5hM39UwNMIpsXAw..';
const Terrain = 'J5v_0Qf9lOFHIaX8fCGrpNDpqgIJ_tLlSD--Pgq10pjih3B7bfYmJe5DmdWiDQOj';
let Bharatmaps = '5ewlhladvLt1Pq7VEKutoe_-1y7XqH7v_cvKCgvUcbS-GC94tqrrsftiWi-osv0H';
let NICTerrain = "J5v_0Qf9lOFHIaX8fCGrpNDpqgIJ_tLlSD--Pgq10pjih3B7bfYmJe5DmdWiDQOj";
let proposalAPI = '';
let CAFInsertAPI = '';


let OkmUrl = '';

const _hostNM = window.location.host;
if (_hostNM.toLowerCase() === "localhost:4200") {
  Bharatmaps = '5ewlhladvLt1Pq7VEKutoe_-1y7XqH7v_cvKCgvUcbS-GC94tqrrsftiWi-osv0H';
  OkmUrl = 'https://stgdev.parivesh.nic.in/okm-dev/okm/downloadDocument';
  NICStreetmap = '5R5ftJZp67OS1L5l-xLGvAr1nGAHJi5Tq8GZN-IpCWL0m-eHYez26Dxh-XXJ-6Pu';
  proposalAPI = 'https://stgdev.parivesh.nic.in/ua-dev/parivesh/GetProposalData';
  CAFInsertAPI = 'https://stgdev.parivesh.nic.in/gis-dev/api/InsertOutData';
}
else if (_hostNM.toLowerCase() === "stg.parivesh.nic.in") {
  Bharatmaps = 'e6JV0rq7AjpDlFyDNElc0eG3YWyiUKwKo6sMR5iE1j6TZU-El4SDmf3w1bYwd7mf77Tjh-7EyoiEjdV5cST7-w..';
  OkmUrl = 'https://stg.parivesh.nic.in/dms/okm/downloadDocument?';

}
else if (_hostNM.toLowerCase() === "stgdev.parivesh.nic.in") {
  Bharatmaps = 'NxG0cCEmYvqxHJZjxLORxMSC5axLaf2Mgxl_hqYuyKL9BjtwZLEWARiROiAP9FBFvlAEN7_c9t9iXBM-IF1GFQ..';
  OkmUrl = 'https://stgdev.parivesh.nic.in/okm-dev/okm/downloadDocument?';
  NICTerrain = "mzdflNkRm_9kGjMMMH3N33h4QZ6RXjsPsdWMEuqTcKuYk-gGz_qgPc1dscYVPNDwUtmEpiZohWtDUq8HfIaizw..";
  NICStreetmap = '8nTEokHIiOP_AXnFAMHUepBxidEABCSa2MhxgaVcupLu2ZdHQKsYpIQuFgvuZWga_uiIhUQ5hM39UwNMIpsXAw..';
  proposalAPI = 'https://stgdev.parivesh.nic.in/ua-dev/parivesh/GetProposalData';
  CAFInsertAPI = 'https://stgdev.parivesh.nic.in/gis-dev/api/InsertOutData';
}
else if (_hostNM.toLowerCase() === "parivesh.nic.in") {
  Bharatmaps = 'JbQ3DQUmr-2TC0EK5q7Hdvm3JFgfIQDt4mYcvpmtr9ziHAZ4qMm1ySFZTzAokiOAgOJrF-QEPUh1G0IcEMOYSg..';
  OkmUrl = 'https://parivesh.nic.in/dms/okm/downloadDocument?';
  NICStreetmap = 'xpkMIk4dd7nGD_4kjvBsnZ7wrk6C4WAoU65hex7-aTffIeBu-XhHUQg5ofXn90kBExUa_BNYekk7XK8WHzdE_A..';
  NICTerrain = 'ryMidSlB7IPkRXRBxj5PFOaU77PkWyqsZtRWHguH_tOLIJ8FDJ6YARDD2mcwDHVi5CXTSQWhZJJPijqLaDvLmw..';
  proposalAPI = 'https://parivesh.nic.in/ua/parivesh/GetProposalData';
  CAFInsertAPI = 'https://parivesh.nic.in/gis/api/InsertOutData';
}

export { NICStreetmap, Terrain, Bharatmaps, OkmUrl, NICTerrain, proposalAPI, CAFInsertAPI }
