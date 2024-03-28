require("dotenv").config();

const getFromApi = async (address: string) => {
  try {
    const response = await fetch(
      `${process.env.FAUCET_ENDPOINT}/api/usdc?address=${address}`
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    console.log(await response.text());
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

getFromApi("0x92596E9a5355bB298F116817eC1B7beD37E3013b");
