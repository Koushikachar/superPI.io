import { describe, it, expect } from "vitest";
import { rupeesInWords } from "../src/lib/pdf/engine";
describe("rupeesInWords", () => {
  it("uses the lakh and crore system", () => {
    expect(rupeesInWords(1234.5)).toBe("Indian Rupees One Thousand Two Hundred Thirty Four and Fifty Paise Only");
    expect(rupeesInWords(100000)).toBe("Indian Rupees One Lakh Only");
    expect(rupeesInWords(12345678.9)).toBe("Indian Rupees One Crore Twenty Three Lakh Forty Five Thousand Six Hundred Seventy Eight and Ninety Paise Only");
    expect(rupeesInWords(0)).toBe("Indian Rupees Zero Only");
  });
});
