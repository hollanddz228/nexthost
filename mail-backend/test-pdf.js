import { createInvoiceBuffer } from "./index.js";
import fs from "fs";

(async () => {
  const pdf = await createInvoiceBuffer({
    tariffName: "Test tariff",
    tariffPrice: "₸2500 / ай",
    email: "test@example.com"
  });

  fs.writeFileSync("test-receipt.pdf", pdf);
  console.log("✅ PDF сақталды: test-receipt.pdf");
})();
