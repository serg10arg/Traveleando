(async function main() {
    // global variable
    const recommendation = document.querySelector(".recommendation");
    const searchElement = document.getElementById("input");
    const formElement = document.getElementById("form");
    const raiseEvent = new Event("input");
    let searchArray = [];
  
    function getTimeZoneForCountry(country) {
      switch (country) {
        case "Australia":
          return "Australia/Sydney";
        case "Japan":
          return "Asia/Tokyo";
        case "Brazil":
          return "America/Sao_Paulo";
        case "Cambodia":
          return "Asia/Phnom_Penh";
        case "India":
          return "Asia/Kolkata";
        case "French Polynesia":
          return "Pacific/Tahiti";
        default:
          return "UTC";
      }
    }
    async function fetchData() {
      try {
        const res = await fetch("https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBMSkillsNetwork-JS0101EN-SkillsNetwork/travel1.json");
        const data = await res.json();
        return data;
      } catch (e) {
        console.log(e);
      }
    }
  
    const data = await fetchData();
    const originalSearchArray = (() => {
      let arr = [];
      for (let [key, value] of Object.entries(data)) {
        if (key !== "countries") {
          arr.push(key);
        }
        value.map((ele) => {
          if (key === "countries") {
            ele.cities.map((city) => {
              arr.push(city.name);
            });
          } else {
            arr.push(ele.name);
          }
        });
      }
      return arr;
    })();
    searchElement.addEventListener("input", () => {
      let val = searchElement.value;
      if (document.getElementById("options")) {
        document.getElementById("options").remove();
      }
      if (val === "") return;
      searchArray = originalSearchArray.filter((ele) => ele.toLowerCase().includes(val.toLowerCase()));
      if (searchArray.length === 0) {
        return;
      } else if (searchArray.length > 8) {
        searchArray.length = 8;
      }
      let optionsElement = document.createElement("ul");
      optionsElement.setAttribute("id", "options");
      searchArray.forEach((e) => {
        let li = document.createElement("li");
        li.addEventListener("click", (e) => {
          searchElement.value = e.target.textContent;
          searchElement.dispatchEvent(raiseEvent);
        });
        li.textContent = e;
        optionsElement.appendChild(li);
      });
      searchElement.insertAdjacentElement("afterend", optionsElement);
    });
  
    formElement.addEventListener("submit", (event) => {
      event.preventDefault();
      if (searchArray.length === 0) {
        let p = document.createElement("p");
        p.textContent = "Please enter valid search query !";
        searchElement.insertAdjacentElement("afterend", p);
        setTimeout(() => p.remove(), 3000);
      } else if (searchArray.length > 2) {
        searchArray.length = 2;
      }
      let arrayOfCities = [];
      searchArray.map((ele) => {
        for (let [key, value] of Object.entries(data)) {
          if (key === ele) {
            return arrayOfCities.push(...value);
          }
          if (key === "countries") {
            value.map((country) => {
              country.cities.map((city) => {
                if (city.name === ele) {
                  arrayOfCities.push(city);
                }
              });
            });
          }
          value.map((v) => {
            if (v.name === ele) {
              arrayOfCities.push(v);
            }
          });
        }
      });
      let html = "";
      const country = arrayOfCities[0]?.name.split(", ")[1];
      const city = arrayOfCities[0]?.name.split(", ")[0];
      const options = {
        timeZone: getTimeZoneForCountry(country),
        hour12: true,
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      };
      const cityTime = new Date().toLocaleTimeString("en-US", options);
      html = `<p>Current time in ${city} (${getTimeZoneForCountry(country)}): <strong>${cityTime}</strong></p>`;
      arrayOfCities.forEach((card) => {
        if (Array.isArray(card)) {
          return;
        }
        html += `<div class="card">
        <img src="./img/${card.imageUrl}" alt="${card.name}">
        <h3>${card.name}</h3>
        <p>${card.description}</p>
        <button class="btn">visit</button>
        </div>
        `;
      });
      if (document.getElementById("options")) {
        document.getElementById("options").remove();
      }
      recommendation.innerHTML = "";
      recommendation.insertAdjacentHTML("beforeend", html);
    });
  })();