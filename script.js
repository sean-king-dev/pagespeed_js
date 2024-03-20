// const config = require("./config.json");
// const API_KEY = config.API_KEY;

let API_KEY;

fetch("config.json")
  .then((response) => response.json())
  .then((data) => {
    API_KEY = data.API_KEY;
    // Now you can use API_KEY in your code
  })
  .catch((error) => console.error("Error loading config:", error));

function runPageSpeedTest() {
  const urlInput = document.getElementById("urlInput").value;
  const device = document.getElementById("deviceSelect").value;
  const throttling = document.getElementById("throttleSelect").value;
  const location = document.getElementById("locationSelect").value;
  const resultsDiv = document.getElementById("results");
  const loadingDiv = document.querySelector(".loading");

  if (!urlInput) {
    resultsDiv.innerHTML = "<p>Please enter a valid URL.</p>";
    return;
  }

  resultsDiv.innerHTML = "<p>Loading...</p>";

  // Show loading text
  loadingDiv.innerHTML = "Loading...";

  // Change text color to blue
  loadingDiv.style.color = "#007bff";

  fetch(
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      urlInput
    )}&key=${API_KEY}`
  )
    .then((response) => response.json())
    .then((data) => {
      const score = (
        data.lighthouseResult.categories.performance.score * 100
      ).toFixed(2);
      const metrics = data.lighthouseResult.audits;

      let resultsHTML = `<p>Overall Score: ${score}</p>`;
      resultsHTML += `<p>Date: ${new Date().toLocaleDateString()}</p>`;
      resultsHTML += `<p>Device: ${device}</p>`;
      resultsHTML += `<p>Throttling: ${throttling}</p>`;
      resultsHTML += `<p>Location: ${location}</p>`;
      resultsHTML += "<h2>Metrics:</h2>";

      Object.keys(metrics).forEach((metricKey) => {
        const metric = metrics[metricKey];
        if (metric.numericValue !== undefined) {
          let value = metric.numericValue.toFixed(2);
          if (metric.unit === "ms") {
            value += " ms";
          } else if (metric.unit === "s") {
            value += " seconds";
          }
          resultsHTML += `<p>${metric.title}: ${value}</p>`;
        }
      });

      resultsDiv.innerHTML = resultsHTML;

      // Store score in local storage
      const pastScores = JSON.parse(localStorage.getItem("pastScores")) || [];
      pastScores.push({
        url: urlInput,
        score: score,
        date: new Date().toLocaleDateString(),
        device: device,
        throttling: throttling,
        location: location,
        metrics: metrics, // Include metrics in stored data
      });
      localStorage.setItem("pastScores", JSON.stringify(pastScores));

      // Update past results display
      displayPastResults();

      // Clear loading text and reset color
      loadingDiv.innerHTML = "";
      loadingDiv.style.color = ""; // Reset color
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      resultsDiv.innerHTML = "<p>Error fetching data. Please try again.</p>";
      // Clear loading text and reset color
      loadingDiv.innerHTML = "";
      loadingDiv.style.color = ""; // Reset color
    });
}

// function runPageSpeedTest() {
//   const urlInput = document.getElementById("urlInput").value;
//   const device = document.getElementById("deviceSelect").value;
//   const throttling = document.getElementById("throttleSelect").value;
//   const location = document.getElementById("locationSelect").value;
//   const resultsDiv = document.getElementById("results");

//   if (!urlInput) {
//     resultsDiv.innerHTML = "<p>Please enter a valid URL.</p>";
//     return;
//   }

//   resultsDiv.innerHTML = "<p>Loading...</p>";

//       // Get the loading element
//       const loadingDiv = document.querySelector('.loading');

//       // Show loading text
//       loadingDiv.innerHTML = "Loading...";

//       // Change text color to blue
//       loadingDiv.style.color = "#007bff";

//   fetch(
//     `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(urlInput)}&key=${API_KEY}`)
//     .then((response) => response.json())
//     .then((data) => {
//       const score = (
//         data.lighthouseResult.categories.performance.score * 100
//       ).toFixed(2);
//       const metrics = data.lighthouseResult.audits;

//       let resultsHTML = `<p>Overall Score: ${score}</p>`;
//       resultsHTML += `<p>Date: ${new Date().toLocaleDateString()}</p>`;
//       resultsHTML += `<p>Device: ${device}</p>`;
//       resultsHTML += `<p>Throttling: ${throttling}</p>`;
//       resultsHTML += `<p>Location: ${location}</p>`;
//       resultsHTML += "<h2>Metrics:</h2>";

//       Object.keys(metrics).forEach((metricKey) => {
//         const metric = metrics[metricKey];
//         if (metric.numericValue !== undefined) {
//           let value = metric.numericValue.toFixed(2);
//           if (metric.unit === "ms") {
//             value += " ms";
//           } else if (metric.unit === "s") {
//             value += " seconds";
//           }
//           resultsHTML += `<p>${metric.title}: ${value}</p>`;
//         }
//       });

//       resultsDiv.innerHTML = resultsHTML;

//       // Store score in local storage
//       const pastScores =
//         JSON.parse(localStorage.getItem("pastScores")) || [];
//       pastScores.push({
//         url: urlInput,
//         score: score,
//         date: new Date().toLocaleDateString(),
//         device: device,
//         throttling: throttling,
//         location: location,
//       });
//       localStorage.setItem("pastScores", JSON.stringify(pastScores));

//       // Update past results display
//       displayPastResults();
//     })
//     .catch((error) => {
//       console.error("Error fetching data:", error);
//       resultsDiv.innerHTML =
//         "<p>Error fetching data. Please try again.</p>";
//     });
// }

runPageSpeedTest();

function displayPastResults() {
  const pastResultsDiv = document.getElementById("pastResults");
  const pastScores = JSON.parse(localStorage.getItem("pastScores")) || [];

  if (pastScores.length === 0) {
    pastResultsDiv.innerHTML = "<p>No past results available.</p>";
    return;
  }

  let pastResultsHTML = "<ul>";
  pastScores.forEach((score) => {
    pastResultsHTML += `<li>URL: ${score.url}, Score: ${score.score}, Date: ${score.date}, Device: ${score.device}, Throttling: ${score.throttling}, Location: ${score.location}</li>`;
  });
  pastResultsHTML += "</ul>";

  pastResultsDiv.innerHTML = pastResultsHTML;
}

function downloadCSV() {
  const pastScores = JSON.parse(localStorage.getItem("pastScores")) || [];
  if (pastScores.length === 0) {
    alert("No past results available to download.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "URL,Score,Date,Device,Throttling,Location\n";
  pastScores.forEach((score) => {
    csvContent += `${score.url},${score.score},${score.date},${score.device},${score.throttling},${score.location}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "past_results.csv");
  document.body.appendChild(link);
  link.click();
}

function downloadTXT() {
  const pastScores = JSON.parse(localStorage.getItem("pastScores")) || [];
  if (pastScores.length === 0) {
    alert("No past results available to download.");
    return;
  }

  let txtContent = "Past Results:\n";
  pastScores.forEach((score) => {
    txtContent += `URL: ${score.url},           
                  Score: ${score.score}, 
                  Date: ${score.date}, 
                  Device: ${score.device}, 
                  Throttling: ${score.throttling}, 
                  Location: ${score.location}\n\n`;

    // Check if metrics is defined before iterating over it
    if (score.metrics) {
      txtContent += "Metrics:\n";
      Object.keys(score.metrics).forEach((metricKey) => {
        const metric = score.metrics[metricKey];
        txtContent += `${metric.title}: ${metric.value}\n`;
      });
    }

    txtContent += "\n"; // Add a line break between each score
  });

  const encodedUri = encodeURI(txtContent);
  const link = document.createElement("a");
  link.setAttribute("href", "data:text/plain;charset=utf-8," + encodedUri);
  link.setAttribute("download", "past_results.txt");
  document.body.appendChild(link);
  link.click();
}

// Display past results on page load
displayPastResults();
