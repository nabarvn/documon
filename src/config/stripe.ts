export const PLANS = [
  {
    name: "Free",
    slug: "free",
    quota: 10,
    pagesPerPdf: 5,
    chunks: 6,
    price: {
      amount: 0,
      priceIds: {
        test: "",
        production: "",
      },
    },
  },
  {
    name: "Pro",
    slug: "pro",
    quota: 50,
    pagesPerPdf: 25,
    chunks: 8,
    price: {
      amount: 14,
      priceIds: {
        test: process.env.PRICING_API_ID,
        production: "",
      },
    },
  },
];
