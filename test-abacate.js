import AbacatePay from "./utils/abacatePay.js";

const abacate = new AbacatePay();

abacate.criarQrCodePix({
    amount: 1000,
    expiresIn: 3600,
    description: "Teste",
    externalId: "123"
}).then(data => {
    console.log(JSON.stringify(data, null, 2));
}).catch(err => {
    console.error(err);
});
