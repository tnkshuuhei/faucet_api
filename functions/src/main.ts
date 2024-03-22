require("dotenv").config();

const getFromApi = async (address: string) => {
  try {
    const response = await fetch(`${process.env.FAUCET_ENDPOINT}/${address}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    console.log(await response.text());
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

getFromApi("0xd4dB78F13Bc28c84211f2D8795B1aAd6c24e56bB");
