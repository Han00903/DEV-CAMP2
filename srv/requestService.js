const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { Request } = this.entities;

    this.on('READ', Request, async (req) => {
        const result = await SELECT.from(Request);
        console.log('📌 Request data:', result);
        return result;
    });

    this.on('CREATE', Request, async (req) => {
        try {
            console.log("📌 Received request payload:", req.data);

            const { 
                request_number, 
                request_product, 
                request_quantity, 
                requestor, 
                request_date, 
                request_state, 
                request_reason,
                request_estimated_price,
                request_reject_reason
            } = req.data;

            // 필수 필드 확인 (request_number 제외)
            if (!request_number || !request_product || !requestor || !request_date || !request_state || !request_reason) {
                console.error("❌ 필수 입력값 누락:", req.data);
                return req.error(400, "필수 입력값이 누락되었습니다.");
            }

            // 데이터 타입 검증
            if (typeof request_quantity !== "number" || typeof request_estimated_price !== "number") {
                console.error("❌ 데이터 타입 불일치:", req.data);
                return req.error(400, "수량과 예상 가격은 숫자여야 합니다.");
            }

            // 수량과 예상 가격이 0보다 커야 함
            if (request_quantity <= 0 || request_estimated_price <= 0) {
                console.error("❌ 잘못된 값 입력됨:", req.data);
                return req.error(400, "수량과 예상 가격은 0보다 커야 합니다.");
            }

            // 너무 큰 값 제한 (MySQL Integer 최대값: 2147483647)
            if (request_quantity > 2147483647 || request_estimated_price > 2147483647) {
                console.error("❌ 허용된 값 초과:", req.data);
                return req.error(400, "수량과 예상 가격은 2147483647 이하이어야 합니다.");
            }

            // 정상적인 데이터라면 INSERT 수행
            const newRequest = await INSERT.into(Request).entries(req.data);
            console.log("✅ 새로운 요청 생성 완료:", newRequest);

            return newRequest;
        } catch (error) {
            console.error("❌ 서버 내부 오류 발생:", error);
            return req.error(500, "서버 오류가 발생했습니다.");
        }
    });
});