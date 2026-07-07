import axios from "axios";
// Static mapping of city names to IDs (used as fallback)
const staticCityIdMap = {
  Abbottabad: "1",
  "Abdul Hakim": "2",
  ABAZAI: "3",
  Karachi: "789",
  Lahore: "456",
  Peshawar: "123",
  Quetta: "234",
  "Zone C&D": "999",
  Kassowal: "555",
  Katlang: "556",
  "Katha Saghral": "557",
  Khadro: "558",
  Khairabad: "559",
  "Khairpur Mahar": "560",
  "Khairpur Mirs": "561",
  "Khairpur Nathan Shah": "562",
  "Khairpur Tamewali": "563",
  "Khalabat Township": "564",
  "Khan Bella": "565",
  "Khan Garh": "566",
  "Khan Pur": "567",
  Kharian: "568",
  Khanewal: "569",
  Khanpur: "570",
};

// Static fallback list of cities
const staticCities = [
  "Abbottabad",
  "Abdul Hakim",
  "ABAZAI",
  "Karachi",
  "Lahore",
  "Peshawar",
  "Quetta",
  "Zone C&D",
  "Kassowal",
  "Katlang",
  "Katha Saghral",
  "Khadro",
  "Khairabad",
  "Khairpur Mahar",
  "Khairpur Mirs",
  "Khairpur Nathan Shah",
  "Khairpur Tamewali",
  "Khalabat Township",
  "Khan Bela",
  "Khan Garh",
  "Khan Pur",
  "Kharian",
  "Khanewal",
  "Khanpur",
];

// Helper function to fetch cities from Trax API
export const fetchTrexCities = async () => {
  try {
   const traxApiKey = "YmlhZFhZU2pPZTFQaW1ERll0bzJOeVRRVFB1MDlkOHRuNk5hdFkwRXQ5TW15UUF5dXF3bjRwUHlsSnY0684cc3fc41e7b"; // Replace with actual Trax API key
    const apiUrl = "https://sonic.pk/api/cities";



    const response = await axios.get(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: traxApiKey,
      },
      timeout: 80000,
    });



    if (response.data.status !== 0) {
      throw new Error(response.data.message || "Trax API returned an error");
    }

    if (!response.data.cities || !Array.isArray(response.data.cities)) {
      throw new Error("Invalid response format: cities array not found");
    }

    const cities = response.data.cities
      .map((city) => ({
        id: city.id,
        name: city.name,
        hub: city.hub,
        zone: city.zone,
        pickup: city.pickup,
        delivery: city.delivery,
      }))
      .filter((city) => city.name && typeof city.name === "string" && city.id);



    const uniqueCities = Array.from(
      new Map(cities.map((city) => [`${city.id}_${city.name.toLowerCase()}`, city])).values()
    ).sort((a, b) => a.name.localeCompare(b.name));



    return {
      success: true,
      cities: uniqueCities,
      message: "Cities fetched successfully from Trax API",
    };
  } catch (error) {
    console.error("Error fetching cities from Trax API:", error.message);
    

    const fallbackCities = staticCities.map((city) => ({
      id: staticCityIdMap[city] || `static-${city}`,
      name: city,
    }));


    return {
      success: false,
      cities: fallbackCities,
      message: "Using static city list due to Trax API failure.",
    };
  }
};

// Helper function to fetch cities from Leopards API
export const fetchLeopardsCities = async () => {
  try {
    const apiKey = "487F7B22F68312D2C1BBC93B1AEA445B1781948571";
    const apiPassword = "12092917";
    const apiUrl = "https://merchantapi.leopardscourier.com/api/getAllCities/format/json/";



    const response = await axios.post(
      apiUrl,
      { api_key: apiKey, api_password: apiPassword },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 80000,
      }
    );



    if (response.data.status === 0 || response.data.error) {
      throw new Error(response.data.error || "Leopards API returned an error");
    }

    if (!response.data.city_list || !Array.isArray(response.data.city_list)) {
      throw new Error("Invalid response format: city_list array not found");
    }

    const cities = response.data.city_list
      .map((city) => ({
        id: city.id,
        name: city.name,
      }))
      .filter((city) => city.name && typeof city.name === "string" && city.id);

 

    const uniqueCities = Array.from(new Map(cities.map((city) => [city.id, city])).values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );


    uniqueCities.unshift({ id: null, name: "Select" });

    return {
      success: true,
      cities: uniqueCities,
      message: "Cities fetched successfully from Leopards API",
    };
  } catch (error) {
    console.error("Error fetching cities from Leopards API:", error.message);
    

    const fallbackCities = staticCities.map((city) => ({
      id: staticCityIdMap[city] || `static-${city}`,
      name: city,
    }));
    fallbackCities.unshift({ id: null, name: "Select" });
    

    return {
      success: false,
      cities: fallbackCities,
      message: "Using static city list due to Leopards API failure.",
    };
  }
};
// Helper function to fetch cities from Leopards API
export const fetchDaakCities = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v8/track/daak/cities`);

    if (response.data.status !== "success" || !Array.isArray(response.data.cities)) {
      throw new Error(response.data.message || "Daak API error");
    }

    const cities = response.data.cities
      .map((city) => ({
        id: city.id,
        name: city.name,
      }))
      .filter((city) => city.name && typeof city.name === "string")
      .sort((a, b) => a.name.localeCompare(b.name));

    cities.unshift({ id: null, name: "Select" });

    return {
      success: true,
      cities,
      message: "Cities fetched successfully from Daak API",
    };
  } catch (error) {
    console.error("Error fetching cities from Daak API:", error.message);

    const fallbackCities = staticCities.map((city) => ({
      id: staticCityIdMap[city] || `static-${city}`,
      name: city,
    }));
    fallbackCities.unshift({ id: null, name: "Select" });

    return {
      success: false,
      cities: fallbackCities,
      message: "Using static city list due to Daak API failure.",
    };
  }
};



// Helper function to fetch cities from M&P API
export const fetchMnPCities = async () => {
  try {
    const username =  "LIONEXCOURIER_API_281809";
    const password = "raja1209G!";
    const accountNo = "281809";
    const apiUrl = `https://mnpcourier.com/mycodapi/api/Branches/Get_Cities?username=${encodeURIComponent(
      username
    )}&password=${encodeURIComponent(password)}&AccountNo=${encodeURIComponent(accountNo)}`;

    const response = await axios.get(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 80000,
    });

    console.log("M&P API response:", response.data);

    // Check if response.data is an array and has at least one object with a City property
    if (!response.data || !Array.isArray(response.data) || !response.data[0]?.City || !Array.isArray(response.data[0].City)) {
      throw new Error("Invalid response format: City array not found");
    }

    // Extract the City array from the first object
    const cities = response.data[0].City
      .map((city, index) => ({
        id: `mnp-${index + 1}`, // Generate a unique ID since API doesn't provide one
        name: city,
      }))
      .filter((city) => city.name && typeof city.name === "string");

    // Remove duplicates and sort
    const uniqueCities = Array.from(
      new Map(cities.map((city) => [city.name.toLowerCase(), city])).values()
    ).sort((a, b) => a.name.localeCompare(b.name));

    // Add "Select" option
    uniqueCities.unshift({ id: null, name: "Select" });

    return {
      success: true,
      cities: uniqueCities,
      message: "Cities fetched successfully from M&P API",
    };
  } catch (error) {
    console.error("Error fetching cities from M&P API:", error.message);

    const fallbackCities = staticCities.map((city) => ({
      id: staticCityIdMap[city] || `static-${city}`,
      name: city,
    }));
    fallbackCities.unshift({ id: null, name: "Select" });

    return {
      success: false,
      cities: fallbackCities,
      message: "Using static city list due to M&P API failure.",
    };
  }
};