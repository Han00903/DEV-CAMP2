const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { Request } = this.entities;

    // READ 이벤트에 로그를 찍기
    this.on('READ', Request, async (req) => {
        const result = await SELECT.from(Request);
        
        // 데이터 로그를 콘솔에 출력
        console.log('Request data:', result);

        return result;
    });
});