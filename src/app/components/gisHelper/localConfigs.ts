const NICStreetmap = '5R5ftJZp67OS1L5l-xLGvAr1nGAHJi5Tq8GZN-IpCWL0m-eHYez26Dxh-XXJ-6Pu';
const Terrain = 'J5v_0Qf9lOFHIaX8fCGrpNDpqgIJ_tLlSD--Pgq10pjih3B7bfYmJe5DmdWiDQOj';
const Bharatmaps = '5ewlhladvLt1Pq7VEKutoe-1y7XqH7v_cvKCgvUcbS-GC94tqrrsftiWi-osv0H';

let newtokenbharatmaps__ =  '';

let OkmUrl = '';

const _hostNM = window.location.host;
if (_hostNM.toLowerCase() === "localhost:4200"){
    newtokenbharatmaps__ = '5ewlhladvLt1Pq7VEKutoe_-1y7XqH7v_cvKCgvUcbS-GC94tqrrsftiWi-osv0H';
    OkmUrl = 'https://stgdev.parivesh.nic.in/okm-dev/okm/downloadDocument?';
}else if (_hostNM.toLowerCase() === "stg.parivesh.nic.in"){
newtokenbharatmaps__ ='e6JV0rq7AjpDlFyDNElc0eG3YWyiUKwKo6sMR5iE1j6TZU-El4SDmf3w1bYwd7mf77Tjh-7EyoiEjdV5cST7-w..';
OkmUrl = 'https://stg.parivesh.nic.in/dms/okm/downloadDocument?';
}else if (_hostNM.toLowerCase() === "stgdev.parivesh.nic.in"){
  newtokenbharatmaps__ = 's_spwJubB4QvDiZwbGZR9LJaiyj6sl-dSODP_W-OnifzxrVjR1Aq70Pq8KfZYgBXLkDfdKSoncVFTFnC1CrmNA..';
  OkmUrl = 'https://stgdev.parivesh.nic.in/okm-dev/okm/downloadDocument?';
}else if (_hostNM.toLowerCase() === "parivesh.nic.in"){
newtokenbharatmaps__ = 'JbQ3DQUmr-2TC0EK5q7Hdvm3JFgfIQDt4mYcvpmtr9ziHAZ4qMm1ySFZTzAokiOAgOJrF-QEPUh1G0IcEMOYSg..';
OkmUrl = 'https://parivesh.nic.in/dms/okm/downloadDocument?';
}

export { NICStreetmap, Terrain, Bharatmaps,newtokenbharatmaps__, OkmUrl}